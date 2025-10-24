import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef(null);
  const typingTimeout = useRef(null);
  const lastTypingTime = useRef(0);

  // 🔹 Handle typing with instant trigger and persistence
  const handleTyping = (value) => {
    const now = Date.now();

    // Instantly trigger when typing starts
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    // If input is empty, stop typing smoothly
    if (!value.trim()) {
      clearTimeout(typingTimeout.current);
      lastTypingTime.current = 0;
      setIsTyping(false);
      return;
    }

    // Throttle typing broadcasts (1s)
    if (now - lastTypingTime.current > 1000) {
      onTyping?.();
      lastTypingTime.current = now;
    }

    // Reset timeout (keep typing visible for 4s after stop)
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      lastTypingTime.current = 0;
    }, 4000);
  };

  // 🔹 Submit message
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    clearTimeout(typingTimeout.current);
    lastTypingTime.current = 0;
    setIsTyping(false);
    ref.current?.focus();
  };

  return (
    <div className="inputbar">
      {/* ✨ Smooth typing fade animation */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="typing-indicator"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5, transition: { duration: 0.3 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            typing...
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={ref}
        placeholder="Type a message"
        value={text}
        onChange={(e) => {
          const value = e.target.value;
          setText(value);
          handleTyping(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          else handleTyping(e.target.value);
        }}
      />
      <button onClick={submit}>Send</button>
    </div>
  );
}
