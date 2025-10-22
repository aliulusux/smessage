import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function GlassSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const btnRef = useRef(null);

  const toggle = () => setOpen((o) => !o);

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

      {open &&
        createPortal(
          <ul className="glass-select-menu fade-in" style={menuStyle}>
            {options.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
