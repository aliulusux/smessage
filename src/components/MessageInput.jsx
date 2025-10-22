import React, { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const id = setInterval(() => { if (text) onTyping(); }, 2500);
    return () => clearInterval(id);
  }, [text, onTyping]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    ref.current?.focus();
  };

  return (
    <div className="inputbar">
      <input
        ref={ref}
        placeholder="Type a message"
        value={text}
        onChange={e=>setText(e.target.value)}
        onKeyDown={e=>{ if (e.key === "Enter") submit(); else onTyping(); }}
      />
      <button onClick={submit}>Send</button>
    </div>
  );
}
