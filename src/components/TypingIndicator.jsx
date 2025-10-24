import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ names = [] }) {
 if (names.length === 0) return null;

  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length <= 3
      ? `${names.join(", ")} are typing...`
      : `Several users are typing...`;

  return (
    <AnimatePresence>
      <motion.div
        className="typing-inline"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.25 }}
      >
        <span className="typing-text">{text}</span>
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
