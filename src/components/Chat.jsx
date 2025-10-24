import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ typingUsers = [] }) {
  if (typingUsers.length === 0) return null;

  // determine message text
  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : typingUsers.length <= 3
      ? `${typingUsers.join(", ")} are typing...`
      : "Several people are typing...";

  return (
    <AnimatePresence>
      <motion.div
        key="typing"
        className="typing-indicator"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <em>{text}</em>
      </motion.div>
    </AnimatePresence>
  );
}
