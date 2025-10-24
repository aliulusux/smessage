import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ typingUsers = [], currentUser }) {
  // filter out self just in case
  const others = typingUsers.filter((u) => u !== currentUser);
  if (others.length === 0) return null;

  const text =
    others.length === 1
      ? `${others[0]} is typing...`
      : others.length <= 3
      ? `${others.join(", ")} are typing...`
      : "Several people are typing...";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="typing"
        className="typing-indicator"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.25 }}
      >
        <em>{text}</em>
        <span className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
