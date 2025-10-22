import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";



export default function GlassSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const btnRef = useRef(null);

  const toggle = () => setOpen((o) => !o);

  const themeColors = {
    sunset: "linear-gradient(135deg, #ff9966, #ff5e62)",
    neon: "linear-gradient(135deg, #00ffe0, #0078ff)",
    dark: "linear-gradient(135deg, #111, #333)",
    light: "linear-gradient(135deg, #eee, #ccc)",
    amethyst: "linear-gradient(135deg, #9D50BB, #6E48AA)",
    pastel: "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
    iced: "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
    ocean: "linear-gradient(135deg, #2E3192, #1BFFFF)",
    forest: "linear-gradient(135deg, #134E5E, #71B280)",
    sand: "linear-gradient(135deg, #FBD786, #f7797d)"
  };

  // Calculate dropdown position
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "absolute",
        top: `${rect.bottom + window.scrollY + 6}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
      });
    }
  }, [open]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="glass-select-btn"
        type="button"
      >
        {value}
        <span className="arrow">▾</span>
      </button>

      {open && (
        <div className="glass-select-menu">
            {options.map((opt) => (
            <div
                key={opt}
                className={`glass-option ${opt === value ? "selected" : ""}`}
                onClick={() => handleSelect(opt)}
            >
                <span className="theme-dot" style={{ background: themeColors[opt] }} />
                <span>{opt}</span>
            </div>
            ))}
        </div>
      )}
    </>
  );
}
