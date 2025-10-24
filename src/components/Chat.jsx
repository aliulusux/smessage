import React, { useEffect, useRef, useState } from "react";
import Header from "./Header.jsx";
import UserList from "./UserList.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import {
  supabase,
  listMessages,
  sendMessage,
} from "../lib/supabaseClient";

/**
 * This version uses:
 * - one realtime channel for presence+typing per room
 * - one realtime channel for message INSERT + UPDATE (status changes)
 * - marks others' messages as seen and reflects it locally
 */
export default function Chat({ username, channel, onBack, onLogout }) {
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const listRef = useRef(null);

  // -------- Load initial history
  useEffect(() => {
    (async () => {
      const rows = await listMessages(channel.id);
      setMsgs(rows || []);
    })();
  }, [channel.id]);

  // -------- Realtime: messages (INSERT + UPDATE)
  useEffect(() => {
    const rt = supabase
      .channel(`messages:${channel.id}`)

      // New messages in this room
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          const row = payload.new;
          setMsgs((m) => [...m, row]);
          listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
        }
      )

      // Status updates (e.g., delivered -> seen)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          const row = payload.new;
          setMsgs((m) => m.map((x) => (x.id === row.id ? row : x)));
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(rt);
    };
  }, [channel.id]);

  // -------- Mark others' messages as seen (immediately reflect)
  useEffect(() => {
    const run = async () => {
      const unseen = msgs.filter(
        (m) => m.sender !== username && m.status !== "seen"
      );
      if (unseen.length === 0) return;

      // Optimistic local update
      setMsgs((m) =>
        m.map((x) =>
          x.sender !== username && x.status !== "seen" ? { ...x, status: "seen" } : x
        )
      );

      // Persist to DB
      const ids = unseen.map((m) => m.id);
      await supabase.from("messages").update({ status: "seen" }).in("id", ids);
      // The UPDATE subscription above will also keep us in sync.
    };
    if (msgs.length) run();
  }, [msgs, username]);

  // -------- Realtime: presence + typing (single channel)
  useEffect(() => {
    const presence = supabase.channel(`room:${channel.id}`, {
      config: { presence: { key: username } },
    });

    // Track presence with username; state usernames → users list
    presence
      .on("presence", { event: "sync" }, () => {
        const state = presence.presenceState();
        const names = Object.keys(state || {});
        setUsers(names.sort((a, b) => a.localeCompare(b)));
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const name = payload?.user;
        if (!name || name === username) return;

        // Add or refresh a timeout for this user
        setTyping((prev) => {
          if (prev.includes(name)) return prev;
          return [...prev, name];
        });

        // Remove after 5s of inactivity
        clearTimeout(presence._ti?.[name]);
        presence._ti ||= {};
        presence._ti[name] = setTimeout(() => {
          setTyping((prev) => prev.filter((n) => n !== name));
        }, 5000);
      });

    presence.track({ user: username });
    presence.subscribe();

    return () => {
      // cleanup typing timeouts
      if (presence._ti) Object.values(presence._ti).forEach(clearTimeout);
      supabase.removeChannel(presence);
    };
  }, [channel.id, username]);

  // -------- Keep autoscroll
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // -------- Send / Typing
  const handleSend = async (text) => {
    await sendMessage({
      channel_id: channel.id,
      sender: username,
      body: text,
    });
  };

  const sendTyping = async () => {
    const ch = supabase.getChannels().find((c) => c.topic === `realtime:room:${channel.id}`);
    // if not yet ready (very first keystroke), no-op
    if (!ch) return;
    ch.send({
      type: "broadcast",
      event: "typing",
      payload: { user: username },
    });
  };

  return (
    <div className="chat-screen">
      <Header onBack={onBack} onLogout={onLogout} />
      <div className="chat-body">
        <div className="center">
          <div className="room-head">
            <h3>{channel.name}</h3>
            {channel.is_private && <span className="lock">🔒 private</span>}
          </div>

          <div className="messages" ref={listRef}>
            {msgs.map((m) => (
              <MessageBubble key={m.id} me={m.sender === username} msg={m} />
            ))}
          </div>

          {/* Other users only */}
          <TypingIndicator typingUsers={typing} currentUser={username} />

          <MessageInput onSend={handleSend} onTyping={sendTyping} />
        </div>

        <UserList users={users} typingUsers={typing} />
      </div>
    </div>
  );
}
