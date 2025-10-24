import React from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function TypingIndicator({ typingUsers = [] }) {
  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : typingUsers.length <= 3
      ? `${typingUsers.join(", ")} are typing...`
      : "Several people are typing...";

  return <div className="typing-indicator">{text}</div>;
    
}
