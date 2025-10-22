import React from "react";

export default function MessageBubble({ me, msg }) {
  return (
    <div className={`bubble ${me ? "me" : ""}`}>
      <div className="sender">{msg.sender}</div>
      <div className="body">{msg.body}</div>
      <div className="time">{new Date(msg.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
    </div>
  );
}
