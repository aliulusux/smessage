import React from "react";
import { settings } from "../state/settingsStore";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsModal({ open, onClose }) {
  const s = settings.use();
  const set = settings.set;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="settings-modal glass-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="macos-header top-right">
              <button className="dot red" onClick={onClose}></button>
              <h3>Settings</h3>
            </div>

            <div className="settings-body spaced">
              <div className="row">
                <label>Theme</label>
                <select value={s.theme} onChange={(e) => set({ theme: e.target.value })}>
                  {settings.themes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="row">
                <label>Font Size</label>
                <input
                  type="range"
                  min="16"
                  max="24"
                  value={s.fontSize}
                  onChange={(e) => set({ fontSize: Number(e.target.value) })}
                />
              </div>

              <div className="row">
                <label>Font Family</label>
                <select
                  value={s.fontFamily}
                  onChange={(e) => set({ fontFamily: e.target.value })}
                >
                  {settings.fonts.map((f, i) => (
                    <option key={i} value={f}>
                      {f.split(",")[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
