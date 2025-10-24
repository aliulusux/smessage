import React, { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const typingTimeout = useRef(null);
  const lastTypingTime = useRef(0);

  // Send typing signal while user is typing (throttled)
  const handleTyping = (value) => {
    const now = Date.now();

    // if input is empty, stop typing immediately
    if (!value.trim()) {
      clearTimeout(typingTimeout.current);
      lastTypingTime.current = 0;
      return;
    }

    // send typing update (throttled every 1s)
    if (now - lastTypingTime.current > 1000) {
      onTyping?.();
      lastTypingTime.current = now;
    }

    // reset timeout (keep "is typing" visible for 4s after last keypress)
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      lastTypingTime.current = 0;
    }, 4000);
  };

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    clearTimeout(typingTimeout.current);
    lastTypingTime.current = 0; // stop typing when message sent
    ref.current?.focus();
  };

  return (
    <div className="inputbar">
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
