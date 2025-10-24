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
import TypingIndicator from "./TypingIndicator.jsx";
import "../styles.css";

// normalize every message so UI never crashes if some field is missing
function sanitizeMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  const iso =
    typeof raw.created_at === "string"
      ? raw.created_at
      : raw.created_at instanceof Date
      ? raw.created_at.toISOString()
      : new Date().toISOString();

  return {
    id: raw.id ?? crypto.randomUUID(),
    channel_id: raw.channel_id,
    sender: raw.sender ?? "unknown",
    body: raw.body ?? "",
    created_at: iso,
    seen: Boolean(raw.seen),
    status:
      raw.status ?? (raw.seen ? "seen" : raw.delivered ? "delivered" : "sent"),
  };
}

export default function Chat({ username, channel, onBack, onLogout }) {
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]); // array of names currently typing (others only)
  const listRef = useRef(null);

  // ---------- history ----------
  useEffect(() => {
    (async () => {
      const rows = await listMessages(channel.id);
      const safe = (Array.isArray(rows) ? rows : []).map(sanitizeMessage).filter(Boolean);
      setMsgs(safe);
    })();
  }, [channel.id]);

  // ---------- realtime messages ----------
  useEffect(() => {
    const unsub = subscribeMessages(channel.id, (payloadRow) => {
      const maybeRow = payloadRow?.new ?? payloadRow;
      const safe = sanitizeMessage(maybeRow);
      if (!safe) return;

      setMsgs((prev) => {
        const without = prev.filter((m) => m.id !== safe.id);
        return [...without, safe];
      });

      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
  }, [channel.id]);

  // ---------- mark seen & broadcast ----------
  const broadcastSeen = useRef();
  useEffect(() => {
    const seenCh = presenceChannel(channel.id + ":seen-signal", username);
    broadcastSeen.current = ({ id, reader }) =>
      seenCh.send({
        type: "broadcast",
        event: "seen",
        payload: { id, reader },
        self: false, // don't hear our own seen
      });

    // apply remote seen instantly
    seenCh.on("broadcast", { event: "seen" }, ({ payload }) => {
      const { id } = payload || {};
      setMsgs((prev) =>
        prev.map((m) => (Number(m.id) === Number(id) ? { ...m, status: "seen" } : m))
      );
    });

    return () => seenCh.untrack();
  }, [channel.id, username]);

  useEffect(() => {
    const markSeen = async () => {
      const unseen = msgs.filter((m) => m.status !== "seen" && m.sender !== username);
      if (!unseen.length) return;

      const ids = unseen.map((m) => Number(m.id));
      const { error } = await supabase.from("messages").update({ status: "seen" }).in("id", ids);
      if (error) {
        console.warn("markSeen error:", error);
        return;
      }

      setMsgs((prev) => prev.map((m) => (ids.includes(Number(m.id)) ? { ...m, status: "seen" } : m)));
      ids.forEach((id) => broadcastSeen.current?.({ id, reader: username }));
    };
    markSeen();
  }, [msgs, username]);

  // ---------- presence & typing ----------
  const presenceRef = useRef();
  useEffect(() => {
    const ch = presenceChannel(channel.id, username);
    presenceRef.current = ch;

    const updateUsers = () => {
      const names = Object.keys(ch.presenceState() || {});
      setUsers(names.sort((a, b) => a.localeCompare(b)));
    };

    ch.on("presence", { event: "sync" }, updateUsers);
    ch.on("presence", { event: "join" }, updateUsers);
    ch.on("presence", { event: "leave" }, updateUsers);

    // show when someone starts typing
    ch.on("broadcast", { event: "typing_start" }, ({ payload }) => {
      const who = payload?.user;
      if (!who || who === username) return; // never show myself
      setTyping((prev) => (prev.includes(who) ? prev : [...prev, who]));
    });

    // hide when they stop or send
    ch.on("broadcast", { event: "typing_stop" }, ({ payload }) => {
      const who = payload?.user;
      if (!who) return;
      setTyping((prev) => prev.filter((n) => n !== who));
    });

    return () => {
      ch.untrack();
      supabase.removeChannel(ch);
    };
  }, [channel.id, username]);

  // helpers passed to <MessageInput/>
  const typingStart = () => {
    const ch = presenceRef.current;
    if (!ch) return;
    ch.send({
      type: "broadcast",
      event: "typing_start",
      payload: { user: username },
      self: false, // <- crucial: don't hear our own typing
    });
  };
  const typingStop = () => {
    const ch = presenceRef.current;
    if (!ch) return;
    ch.send({
      type: "broadcast",
      event: "typing_stop",
      payload: { user: username },
      self: false,
    });
  };

  // autoscroll
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleSend = async (text) => {
    await sendMessage({ channel_id: channel.id, sender: username, body: text });
    // sending a message = you’re no longer typing
    typingStop();
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

          {/* Typing indicator (only others) */}
          {typing.filter((n) => n !== username).length > 0 && (
            <div className="typing-bar">
              <TypingIndicator
                typingUsers={typing.filter((n) => n !== username)}
                currentUser={username}
              />
            </div>
          )}

          <MessageInput onSend={handleSend} onTypingStart={typingStart} onTypingStop={typingStop} />
        </div>
        <UserList users={users} typingUsers={typing} />
      </div>
    </div>
  );
}
