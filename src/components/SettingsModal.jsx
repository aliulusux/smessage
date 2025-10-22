import React from "react";
import { settings } from "../state/settingsStore";

export default function SettingsModal({ open, onClose }) {
  const s = settings.use();
  const set = settings.set;

  if (!open) return null;
  return (
    <div className="modal-backdrop glass">
      <div className="modal glass-modal">
        <div className="modal-head macos-head">
          <div className="macos-dots">
            <button className="dot red" onClick={onClose}></button>
          </div>
          <h3>Settings</h3>
        </div>

        <div className="modal-body grid2">
          <label>Theme</label>
          <select value={s.theme} onChange={e => set({ theme: e.target.value })}>
            {settings.themes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label>Font Size</label>
          <input
            type="range"
            min="16"
            max="24"
            value={s.fontSize}
            onChange={e => set({ fontSize: Number(e.target.value) })}
          />

          <label>Font Family</label>
          <select
            value={s.fontFamily}
            onChange={e => set({ fontFamily: e.target.value })}
          >
            {settings.fonts.map((f, i) => (
              <option key={i} value={f}>{f.split(",")[0]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
