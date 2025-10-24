import React, { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const lastPing = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (!text) return;
      const now = Date.now();
      if (now - lastPing.current > 500) {
        lastPing.current = now;
        onTyping?.();
      }
    }, 400);
    return () => clearInterval(id);
  }, [text, onTyping]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend?.(t);
    setText("");
    ref.current?.focus();
  };

  return (
    <div className="inputbar">
      <input
        ref={ref}
        placeholder="Type a message"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value) onTyping?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          else if (e.currentTarget.value) onTyping?.();
        }}
      />
      <button onClick={submit}>Send</button>
    </div>
  );
}
