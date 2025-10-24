import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header.jsx";
import UserList from "./UserList.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageBubble from "./MessageBubble.jsx";
import { supabase, listMessages, sendMessage, subscribeMessages, presenceChannel } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import TypingIndicator from "./TypingIndicator.jsx";

export default function Chat({ username, channel, onBack, onLogout }) {
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const listRef = useRef(null);

  // ✅ load chat history
  useEffect(() => {
    (async () => {
      if (channel?.id) {
        const history = await listMessages(channel.id);
        setMsgs(history || []);
      }
    })();
  }, [channel?.id]);

  // ✅ realtime messages subscription
  useEffect(() => {
    if (!channel?.id) return;
    const unsub = subscribeMessages(channel.id, (row) => {
      setMsgs((m) => [...m, row]);
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub && unsub();
  }, [channel?.id]);

  // ✅ mark messages as seen when received or updated
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

  // ✅ presence + typing
  useEffect(() => {
    if (!channel?.id || !username) return;

    const ch = presenceChannel(channel.id, username);

    const updateUsers = () => {
      const state = ch.presenceState();
      const names = Object.keys(state || {});
      setUsers(names.sort((a, b) => a.localeCompare(b)));
    };

    // Presence tracking
    ch.on("presence", { event: "sync" }, updateUsers);
    ch.on("presence", { event: "join" }, updateUsers);
    ch.on("presence", { event: "leave" }, updateUsers);

    // Typing broadcast listener
    ch.on("broadcast", { event: "typing" }, ({ payload }) => {
      const name = payload.user;
      if (name === username) return;
      setTyping((t) => Array.from(new Set([...t, name])));
      setTimeout(() => setTyping((t) => t.filter((n) => n !== name)), 1500);
    });

    // cleanup
    return () => {
      try {
        ch.untrack();
        supabase.removeChannel(ch);
        window.removeEventListener("beforeunload", ch.untrack);
        window.removeEventListener("pagehide", ch.untrack);
      } catch (err) {
        console.warn("Cleanup error:", err.message);
      }
    };
  }, [channel?.id, username]);

  // ✅ auto-scroll on new messages
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // ✅ message send
  const handleSend = async (text) => {
    if (!text.trim()) return;
    await sendMessage({ channel_id: channel.id, sender: username, body: text });
  };

  // ✅ typing signal broadcast
  const broadcastTyping = React.useRef();
  useEffect(() => {
    if (!channel?.id || !username) return;
    const ch = presenceChannel(channel.id + ":typing-signal", username);
    broadcastTyping.current = () => {
      ch.send({
        type: "broadcast",
        event: "typing",
        payload: { user: username },
      });
    };
    return () => ch.untrack();
  }, [channel?.id, username]);

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
