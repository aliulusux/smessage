import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingIndicator({ typingUsers = [] }) {
  if (typingUsers.length === 0) return null;

  let text = "";
  if (typingUsers.length === 1) text = `${typingUsers[0]} is typing...`;
  else if (typingUsers.length === 2) text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  else text = "Several users are typing...";

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
