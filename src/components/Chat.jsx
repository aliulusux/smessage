import React, { useEffect, useRef, useState } from "react";
import Header from "./Header.jsx";
import UserList from "./UserList.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageBubble from "./MessageBubble.jsx";
import {
  supabase,
  listMessages,
  sendMessage,
  subscribeMessages,
  presenceChannel,
} from "../lib/supabaseClient";
import { motion } from "framer-motion";
import TypingIndicator from "./TypingIndicator.jsx";

export default function Chat({ username, channel, onBack, onLogout }) {
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const listRef = useRef(null);

  /* ---------------------- Load History ---------------------- */
  useEffect(() => {
    (async () => {
      if (channel?.id) {
        const history = await listMessages(channel.id);
        setMsgs(history || []);
      }
    })();
  }, [channel?.id]);

  /* ---------------------- Realtime Messages ---------------------- */
  useEffect(() => {
    if (!channel?.id) return;

    const unsub = subscribeMessages(channel.id, (row) => {
      setMsgs((m) => [...m, row]);
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });

    // ✅ Listen for realtime updates (seen status etc.)
    const updateSub = supabase
      .channel(`messages-updates-${channel.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          setMsgs((prev) =>
            prev.map((m) =>
              m.id === payload.new.id ? { ...m, ...payload.new } : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      unsub && unsub();
      supabase.removeChannel(updateSub);
    };
  }, [channel?.id]);

  /* ---------------------- Mark Seen Logic ---------------------- */
  useEffect(() => {
    if (!channel?.id || !username) return;

    const markSeen = async () => {
      try {
        const unseen = msgs.filter((m) => !m.seen && m.sender !== username);
        if (unseen.length === 0) return;

        const ids = unseen.map((m) => m.id);

        await supabase
          .from("messages")
          .update({ seen: true, status: "seen" })
          .in("id", ids)
          .eq("channel_id", channel.id);
      } catch (err) {
        console.error("Error marking messages as seen:", err.message);
      }
    };

    markSeen();
  }, [msgs, username, channel?.id]);

  /* ---------------------- Presence + Typing ---------------------- */
  useEffect(() => {
    if (!channel?.id || !username) return;

    const ch = presenceChannel(channel.id, username);

    const updateUsers = () => {
      const state = ch.presenceState();
      const names = Object.keys(state || {});
      setUsers(names.sort((a, b) => a.localeCompare(b)));
    };

    ch.on("presence", { event: "sync" }, updateUsers);
    ch.on("presence", { event: "join" }, updateUsers);
    ch.on("presence", { event: "leave" }, updateUsers);

    ch.on("broadcast", { event: "typing" }, ({ payload }) => {
      const name = payload.user;
      if (name === username) return;
      setTyping((t) => Array.from(new Set([...t, name])));
      setTimeout(() => setTyping((t) => t.filter((n) => n !== name)), 1500);
    });

    return () => {
      try {
        ch.untrack();
        supabase.removeChannel(ch);
      } catch (err) {
        console.warn("Cleanup error:", err.message);
      }
    };
  }, [channel?.id, username]);

  /* ---------------------- Auto Scroll ---------------------- */
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  /* ---------------------- Send Message ---------------------- */
  const handleSend = async (text) => {
    if (!text.trim()) return;
    await sendMessage({
      channel_id: channel.id,
      sender: username,
      body: text,
      status: "sent",
    });
  };

  /* ---------------------- Typing Broadcast ---------------------- */
  const broadcastTyping = useRef();
  useEffect(() => {
    if (!channel?.id || !username) return;
    const ch = presenceChannel(channel.id + ":typing-signal", username);
    broadcastTyping.current = () =>
      ch.send({
        type: "broadcast",
        event: "typing",
        payload: { user: username },
      });
    return () => ch.untrack();
  }, [channel?.id, username]);

  /* ---------------------- Render ---------------------- */
  return (
    <div className="chat-screen">
      <Header onBack={onBack} onLogout={onLogout} />
      <div className="chat-body">
        <div className="center">
          <div className="room-head">
            <h3>{channel?.name || "Chat"}</h3>
            {channel?.is_private && <span className="lock">🔒 private</span>}
          </div>

          <div className="messages" ref={listRef}>
            {msgs.map((m) => (
              <MessageBubble key={m.id} me={m.sender === username} msg={m} />
            ))}
            {typing.length > 0 && <TypingIndicator />}
          </div>

          <MessageInput
            onSend={handleSend}
            onTyping={() => broadcastTyping.current?.()}
          />
        </div>
        <UserList users={users} typingUsers={typing} />
      </div>
    </div>
  );
}
