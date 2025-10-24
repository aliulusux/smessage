import React from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * TypingIndicator
 * props:
 *  - typingUsers: string[]  (all users currently typing in this room)
 *  - currentUser: string
 *
 * It renders nothing if there are no "other" users typing.
 */
export default function TypingIndicator({ typingUsers = [], currentUser }) {
  const others = typingUsers.filter((n) => n && n !== currentUser);
  if (others.length === 0) return null;

  let text = "";
  if (others.length === 1) text = `${others[0]} is typing`;
  else if (others.length <= 3) text = `${others.join(", ")} are typing`;
  else text = `Several people are typing`;

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
          <span className="typing-text">{text}</span>
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
