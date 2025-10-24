import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function TypingIndicator({ typingUsers = [], currentUser }) {
  const others = typingUsers.filter((n) => n && n !== currentUser);
  if (others.length === 0) return null;

  let label = "";
  if (others.length === 1) label = `${others[0]} is typing`;
  else if (others.length <= 3) label = `${others.join(", ")} are typing`;
  else label = "Several people are typing";

  return (
    <div className="typing-bar">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key="typing"
          className="typing-inline"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <span className="typing-text">{label}</span>
          <span className="ti-dots" aria-hidden="true">
            <i className="ti-dot" />
            <i className="ti-dot" />
            <i className="ti-dot" />
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
