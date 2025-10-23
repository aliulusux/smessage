import React from "react";
import "../styles.css";

function StatusIcon({ status }) {
  if (status === "pending") return <Check className="icon pending" size={14} />;
  if (status === "delivered") return <CheckCheck className="icon delivered" size={14} />;
  if (status === "seen") return <Eye className="icon seen" size={14} />;
  return null;
}

export default function MessageBubble({ me, msg }) {
  const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});
  return (
    <div className={`bubble ${me ? "me" : ""}`}>
      <div className="sender">{msg.sender}</div>
      <div className="body">{msg.body}</div>
      <div className="time">{new Date(msg.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
        <span className="time">{formattedTime}</span>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <StatusIcon status={msg.status} />
      </motion.div>
    </div>
  );
}
