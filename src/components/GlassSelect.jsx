import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export const THEME_SWATCH = {
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

export default function GlassSelect({ value, onChange, options, labelRender, showDot=true, }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});
   
  const label = labelRender ? labelRender(value) : value;
  const toggle = () => setOpen((o) => !o);

  // position menu under button
  const placeMenu = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setMenuStyle({
      position: "absolute",
      top: `${r.bottom + window.scrollY + 6}px`,
      left: `${r.left + window.scrollX}px`,
      width: `${r.width}px`,
    });
  };

  // Calculate dropdown position
  useEffect(() => {
    if (!open) return;
    placeMenu();
    const closeOnOutside = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onResize = () => placeMenu();
    document.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className="glass-select-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="glass-select-value">
          {showDot && THEME_SWATCH[value] && (
            <span
              className="theme-dot"
              style={{ background: THEME_SWATCH[value] }}
            />
          )}
          {label}
        </span>
        <span className="glass-select-caret">▾</span>
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            className="glass-select-menu"
            style={menuStyle}
            role="listbox"
          >
            {options.map((opt) => {
              const text = labelRender ? labelRender(opt) : opt;
              const active = opt === value;
              return (
                <li
                  key={String(opt)}
                  role="option"
                  aria-selected={active}
                  className={`glass-select-item ${active ? "active" : ""}`}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {showDot && THEME_SWATCH[opt] && (
                    <span
                      className="theme-dot"
                      style={{ background: THEME_SWATCH[opt] }}
                    />
                  )}
                  <span className="item-text">{text}</span>
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
