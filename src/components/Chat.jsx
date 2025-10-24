import React, { useEffect, useMemo, useRef, useState } from "react";
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
import TypingIndicator from "./TypingIndicator.jsx";

export default function Chat({ username, channel, onBack, onLogout }) {
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const listRef = useRef(null);

  // load history
  useEffect(() => {
    (async () => setMsgs(await listMessages(channel.id)))();
  }, [channel.id]);

  // realtime messages
  useEffect(() => {
    const unsub = subscribeMessages(channel.id, (row) => {
      setMsgs((m) => [...m, row]);
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
  }, [channel.id]);

  // mark seen (optional — keep your existing version if you prefer)
  useEffect(() => {
    const markSeen = async () => {
      const unseen = msgs.filter((m) => !m.seen && m.sender !== username);
      for (const m of unseen) {
        await supabase.from("messages").update({ seen: true }).eq("id", m.id);
      }
    };
    if (msgs.length) markSeen();
  }, [msgs, username]);

  // presence + typing
  useEffect(() => {
    const ch = presenceChannel(channel.id, username);

    const updateUsers = () => {
      const state = ch.presenceState();
      const names = Object.keys(state || {});
      setUsers(names.sort((a, b) => a.localeCompare(b)));
    };

    ch.on("presence", { event: "sync" }, updateUsers);
    ch.on("presence", { event: "leave" }, updateUsers);
    ch.on("presence", { event: "join" }, updateUsers);

    ch.on("broadcast", { event: "typing" }, ({ payload }) => {
      const name = payload.user;
      if (!name || name === username) return;
      setTyping((prev) => {
        const next = new Set(prev);
        next.add(name);
        return Array.from(next);
      });
      // keep them "typing" for 5s of inactivity
      setTimeout(() => {
        setTyping((prev) => prev.filter((n) => n !== name));
      }, 5000);
    });

    return () => {
      ch.untrack();
      supabase.removeChannel(ch);
    };
  }, [channel.id, username]);

  // keep autoscroll on new messages
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleSend = async (text) => {
    await sendMessage({
      channel_id: channel.id,
      sender: username,
      body: text,
    });
  };

  // broadcast typing with the original presence channel (fast + cheap)
  const broadcastTyping = React.useRef();
  useEffect(() => {
    const ch = presenceChannel(channel.id + ":typing-signal", username);
    broadcastTyping.current = () =>
      ch.send({
        type: "broadcast",
        event: "typing",
        payload: { user: username },
      });
    return () => ch.untrack();
  }, [channel.id, username]);

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

          {/* Typing indicator (others only) */}
          <TypingIndicator
            typingUsers={typing}
            currentUser={username}
          />

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
