import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassSelect from "./GlassSelect.jsx";
import { settings } from "../state/settingsStore";

export default function SettingsModal({ open, onClose }) {
  const s = settings.use();
  const set = settings.set;
  const [closing, setClosing] = useState(false);

  // Play closing animation, then trigger onClose
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 500);
  };

  // Don't render if fully closed
  if (!open && !closing) return null;

  return (
    <AnimatePresence>
      {(open || closing) && (
        <motion.div
          className={`modal-overlay ${closing ? "fade-out" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`settings-modal glass-modal ${closing ? "closing" : ""}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="macos-header top-right">
              <button
                className="dot red"
                onClick={handleClose}
                aria-label="Close Settings"
              />
              <h3>Settings</h3>
            </div>

            <div className="settings-body spaced">
              <div className="row">
                <label>Theme</label>
                <GlassSelect
                  value={s.theme}
                  onChange={(v) => set({ theme: v })}
                  options={settings.themes}
                />
              </div>

              <div className="row">
                <label>Font Size</label>
                <input
                  type="range"
                  min="16"
                  max="24"
                  value={s.fontSize}
                  onChange={(e) => set({ fontSize: Number(e.target.value) })}
                  className="glass-range"
                />
              </div>

              <div className="row">
                <label>Font Family</label>
                <GlassSelect
                  value={s.fontFamily}
                  onChange={(v) => set({ fontFamily: v })}
                  options={settings.fonts}
                  labelRender={(v) => v.split(",")[0]}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
