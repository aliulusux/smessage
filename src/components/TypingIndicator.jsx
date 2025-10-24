import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles.css";

export default function TypingIndicator({ typingUsers = [] }) {
  const [visible, setVisible] = useState(false);

  // control fade in/out
  useEffect(() => {
    if (typingUsers.length > 0) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [typingUsers]);

  if (!visible) return null;

  // text logic
  let text = "";
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else if (typingUsers.length > 2) {
    text = "Several users are typing...";
  } else {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="typing-indicator-bottom"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="glass-typing-box"
          animate={{
            boxShadow: [
              "0 0 6px var(--typing-accent-color)",
              "0 0 12px var(--typing-accent-color)",
              "0 0 6px var(--typing-accent-color)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="typing-text">{text}</span>
          <div className="typing-dots">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
