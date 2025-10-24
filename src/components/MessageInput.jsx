import React, { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, onTypingStart, onTypingStop }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const typingTimer = useRef(null);
  const lastNonEmpty = useRef(false);

  // fire "start" only when transitioning empty -> non-empty
  useEffect(() => {
    const nonEmpty = text.trim().length > 0;

    if (nonEmpty && !lastNonEmpty.current) {
      // debounce a touch so we don’t spam
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => onTypingStart?.(), 120);
    }
    if (!nonEmpty && lastNonEmpty.current) {
      onTypingStop?.();
    }
    lastNonEmpty.current = nonEmpty;

    return () => clearTimeout(typingTimer.current);
  }, [text, onTypingStart, onTypingStop]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend?.(t);
    setText("");
    onTypingStop?.();
    ref.current?.focus();
  };

  return (
    <div className="inputbar">
      <input
        ref={ref}
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        onBlur={() => {
          if (!text.trim()) onTypingStop?.();
        }}
      />
      <button onClick={submit}>Send</button>
    </div>
  );
}
