import React from "react";
import { motion } from "framer-motion";
import "../styles.css";

export default function TypingIndicator({ typingUsers = [] }) {
  if (!typingUsers.length) return null;

  // Generate message text
  let text = "";
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else if (typingUsers.length === 3) {
    text = `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers[2]} are typing...`;
  } else {
    text = "Users are typing...";
  }

  return (
    <motion.div
      className="typing-indicator"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-typing-box">
        <span className="typing-text">{text}</span>
        <div className="typing-dots">
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
          />
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
          />
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
