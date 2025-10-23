import React from "react";
import "../styles.css";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, Eye } from "lucide-react";

function StatusIcon({ status }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -2 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="status-icon"
      >
        {status === "pending" && <Check className="icon pending" size={14} />}
        {status === "delivered" && <CheckCheck className="icon delivered" size={14} />}
        {status === "seen" && <Eye className="icon seen" size={14} />}
      </motion.div>
    </AnimatePresence>
  );
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
