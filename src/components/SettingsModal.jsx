import React, { useState } from "react";
import GlassSelect from "./GlassSelect.jsx";

export default function SettingsModal({ isOpen, onClose, settings, set }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    // wait for CSS animation (500 ms) then unmount
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 500);
  };

  if (!isOpen && !closing) return null;

  return (
    <div className={`settings-modal-backdrop ${closing ? "fade-out" : ""}`}>
      <div
        className={`settings-modal ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="mac-close" onClick={handleClose} />
        <h2>Settings</h2>

        <label>Theme</label>
        <GlassSelect
          value={settings.theme}
          onChange={(v) => set({ theme: v })}
          options={settings.themes}
        />

        <label>Font Size</label>
        <input
          type="range"
          min="16"
          max="24"
          value={settings.fontSize}
          onChange={(e) => set({ fontSize: e.target.value })}
        />

        <label>Font Family</label>
        <GlassSelect
          value={settings.fontFamily}
          onChange={(v) => set({ fontFamily: v })}
          options={settings.fonts}
        />
      </div>
    </div>
  );
}
