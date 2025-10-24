import React from "react";

// Simple, themed, and animated. Names are colored by CSS variables.
export default function TypingIndicator({ typingUsers = [], currentUser }) {
  const others = typingUsers.filter((n) => n && n !== currentUser);
  if (others.length === 0) return null;

  let label = "";
  if (others.length === 1) label = `${others[0]} is typing`;
  else if (others.length === 2) label = `${others[0]} and ${others[1]} are typing`;
  else label = `Several people are typing`;

  return (
    <div className="typing-inline" aria-live="polite">
      <span className="typing-text">{label}</span>
      <span className="typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
