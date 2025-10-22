import React from "react";
import { settings } from "../state/settingsStore";
import { motion, AnimatePresence } from "framer-motion";
import GlassSelect from "./GlassSelect.jsx";

export default function SettingsModal({ open, onClose }) {
  const s = settings.use();
  const set = settings.set;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div className="settings-modal glass-modal"
            initial={{scale:0.9, opacity:0, y:20}}
            animate={{scale:1, opacity:1, y:0}}
            exit={{scale:0.9, opacity:0, y:20}}
            transition={{duration:.25, ease:"easeOut"}}
          >
            <div className="macos-header top-right">
              <button className="dot red" onClick={onClose} aria-label="Close"></button>
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
