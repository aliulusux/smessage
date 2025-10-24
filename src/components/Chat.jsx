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

// --- helper to normalize/sanitize a message object
function sanitizeMessage(raw) {
  if (!raw || typeof raw !== "object") return null;

  // normalize created_at to an ISO string
  let createdISO = "";
  if (typeof raw.created_at === "string") {
    createdISO = raw.created_at;
  } else if (raw.created_at instanceof Date) {
    createdISO = raw.created_at.toISOString();
  } else {
    // fallback: generate a timestamp so UI never crashes
    createdISO = new Date().toISOString();
  }

  return {
    id: raw.id ?? crypto.randomUUID(),
    sender: raw.sender ?? "unknown",
    body: raw.body ?? "",
    created_at: createdISO,
    seen: Boolean(raw.seen),
    // status is optional; keep your existing logic
    status:
      raw.status ??
      (raw.seen ? "seen" : raw.delivered ? "delivered" : "sent") ??
      "sent",
    channel_id: raw.channel_id,
  };
}

export default function Chat({ username, channel, onBack, onLogout }) {
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const listRef = useRef(null);

  // load history
  useEffect(() => {
    (async () => {
      const rows = await listMessages(channel.id);
      const safe = (Array.isArray(rows) ? rows : [])
        .map(sanitizeMessage)
        .filter(Boolean);
      setMsgs(safe);
    })();
  }, [channel.id]);

  // realtime messages
  useEffect(() => {
    const unsub = subscribeMessages(channel.id, (payloadRow) => {
      // payload could be {new: row} or the row directly depending on your helper
      const maybeRow = payloadRow?.new ?? payloadRow;
      const safe = sanitizeMessage(maybeRow);
      if (!safe) return;

      setMsgs((prev) => {
        // de-dupe by id and keep order with the new one at the end
        const without = prev.filter((m) => m.id !== safe.id);
        return [...without, safe];
      });

      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
  }, [channel.id]);

// --- mark others' messages as seen and broadcast it ---
useEffect(() => {
  const markSeen = async () => {
    const unseen = msgs.filter(m => m.status !== "seen" && m.sender !== username);
    if (unseen.length === 0) return;

    const ids = unseen.map(m => Number(m.id));
    const { error } = await supabase
      .from("messages")
      .update({ status: "seen" })
      .in("id", ids);

    if (error) {
      console.warn("⚠️ Supabase markSeen error:", error);
      return;
    }

    // update local
    setMsgs(prev =>
      prev.map(m =>
        ids.includes(Number(m.id)) ? { ...m, status: "seen" } : m
      )
    );

    // 🔹 broadcast to channel so sender updates instantly
    if (broadcastSeen.current) {
      ids.forEach(id => {
        broadcastSeen.current({ id, reader: username });
      });
    }
  };
  markSeen();
}, [msgs, username]);

// Real typing broadcast (reuse presence channel)
const broadcastTyping = React.useRef();
const broadcastSeen = React.useRef();

useEffect(() => {
  const typingCh = presenceChannel(channel.id + ":typing-signal", username);
  const seenCh = presenceChannel(channel.id + ":seen-signal", username);

  // typing broadcaster
  broadcastTyping.current = () =>
    typingCh.send({
      type: "broadcast",
      event: "typing",
      payload: { user: username },
    });

  // seen broadcaster
  broadcastSeen.current = ({ id, reader }) =>
    seenCh.send({
      type: "broadcast",
      event: "seen",
      payload: { id, reader },
    });

  // listen for remote seen events
  seenCh.on("broadcast", { event: "seen" }, ({ payload }) => {
    const { id } = payload;
    setMsgs(prev =>
      prev.map(m =>
        Number(m.id) === Number(id) ? { ...m, status: "seen" } : m
      )
    );
  });

  return () => {
    typingCh.untrack();
    seenCh.untrack();
  };
}, [channel.id, username]);

  // presence + typing
  useEffect(() => {
    const ch = presenceChannel(channel.id, username);

    const updateUsers = () => {
      const state = ch.presenceState() || {};
      const names = Object.keys(state);
      setUsers(names.sort((a, b) => a.localeCompare(b)));
    };

    ch.on("presence", { event: "sync" }, updateUsers);
    ch.on("presence", { event: "leave" }, updateUsers);
    ch.on("presence", { event: "join" }, updateUsers);

    ch.on("broadcast", { event: "typing" }, ({ payload }) => {
      const name = payload?.user;
      if (!name || name === username) return;
      setTyping((t) => Array.from(new Set([...t, name])));
      setTimeout(() => setTyping((t) => t.filter((n) => n !== name)), 1500);
    });

    // cleanup
    return () => {
      try {
        ch.untrack();
      } catch {}
      try {
        supabase.removeChannel(ch);
      } catch {}
    };
  }, [channel.id, username]);

  // keep autoscroll on new messages (safe)
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleSend = async (text) => {
    await sendMessage({ channel_id: channel.id, sender: username, body: text });
  };

  // typing signal (reuse presence channel via key)
  const broadcastTyping = React.useRef();
  useEffect(() => {
    const ch = presenceChannel(channel.id + ":typing-signal", username);
    broadcastTyping.current = () =>
      ch.send({
        type: "broadcast",
        event: "typing",
        payload: { user: username },
      });
    return () => {
      try {
        ch.untrack();
      } catch {}
    };
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
            {msgs
              .filter(Boolean)
              .map((m) => (
                <MessageBubble key={m.id} me={m.sender === username} msg={m} />
              ))}

            {typing.length > 0 && <TypingIndicator typingUsers={typing} />}
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
