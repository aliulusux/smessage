import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ typingUsers = [], currentUser }) {
  const others = typingUsers.filter((n) => n && n !== currentUser);
  if (others.length === 0) return null;

  // dynamic text based on number of users typing
  let text = "";
  if (others.length === 1) text = `${others[0]} is typing`;
  else if (others.length <= 3) text = `${others.join(", ")} are typing`;
  else text = `Several people are typing`;

  return (
    <AnimatePresence>
      <motion.div
        key="typing"
        className="typing-inline"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <span className="typing-text">{text}</span>
        <span className="typing-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
