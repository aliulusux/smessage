import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header.jsx";
import UserList from "./UserList.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageBubble from "./MessageBubble.jsx";
import {
  listMessages, sendMessage, subscribeMessages,
  presenceChannel
} from "../lib/supabaseClient";
import { motion } from "framer-motion";

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

  // presence + typing
  useEffect(() => {
    const ch = presenceChannel(channel.id, username);

    const updateUsers = () => {
      const state = ch.presenceState();
      const names = Object.keys(state || {});
      setUsers(names.sort((a,b)=>a.localeCompare(b)));
    };
    ch.on("presence", { event: "sync" }, updateUsers);

    ch.on("broadcast", { event: "typing" }, ({ payload }) => {
      const name = payload.user;
      if (name === username) return;
      setTyping((t) => Array.from(new Set([...t, name])));
      setTimeout(() => setTyping((t) => t.filter(n => n !== name)), 1500);
    });

    window.addEventListener("pagehide", () => ch.untrack());
    return () => { ch.untrack(); };
  }, [channel.id, username]);

  const handleSend = async (text) => {
    await sendMessage({ channel_id: channel.id, sender: username, body: text });
  };

  const handleTyping = () => {
    // broadcast lightweight typing signal
    // (no await for snappy UX)
    try {
      const ch = window.supabaseBroadcast ||= {};
    } catch {}
  };

  // Real typing broadcast (reuse presence channel)
  const broadcastTyping = React.useRef();
  useEffect(() => {
    const ch = presenceChannel(channel.id + ":typing-signal", username);
    broadcastTyping.current = () => ch.send({ type: "broadcast", event: "typing", payload: { user: username } });
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
            {msgs.map(m => <MessageBubble key={m.id} me={m.sender===username} msg={m} />)}
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
