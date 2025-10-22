import React from "react";

export default function GlassSelect({ value, onChange, options, labelRender }) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);

  // close when clicking outside
  React.useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // place menu under button
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 });
  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX, width: r.width });
  };
  React.useEffect(() => { place(); }, [open]);
  React.useEffect(() => {
    const onRes = () => open && place();
    window.addEventListener("resize", onRes);
    window.addEventListener("scroll", onRes, true);
    return () => {
      window.removeEventListener("resize", onRes);
      window.removeEventListener("scroll", onRes, true);
    };
  }, [open]);

  const currentLabel = labelRender ? labelRender(value) : value;

  return (
    <>
      <button
        ref={btnRef}
        className="glass-select-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="glass-select-label">{currentLabel}</span>
        <span className="glass-select-caret">▾</span>
      </button>

      {open && (
        <ul
          ref={menuRef}
          className="glass-select-menu"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          role="listbox"
        >
          {options.map((opt) => {
            const label = labelRender ? labelRender(opt) : opt;
            return (
              <li
                key={String(opt)}
                className={`glass-select-item ${opt === value ? "active" : ""}`}
                role="option"
                aria-selected={opt === value}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
