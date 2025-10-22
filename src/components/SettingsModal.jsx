import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles.css";

const themeColors = {
  sunset: "#ff6b6b",
  neon: "#00e6ff",
  dark: "#222",
  light: "#ddd",
  amethyst: "#9b5de5",
  pastel: "#cdb4db",
  iced: "#a2d2ff",
  ocean: "#00b4d8",
  forest: "#3a5a40",
  sand: "#f4a261",
};

export default function SettingsModal({ open, onClose }) {
  const [theme, setTheme] = useState("ocean");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Inter");

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="settings-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="close-dot" onClick={onClose}></div>
            <h2 className="modal-title">Settings</h2>

            <div className="setting-row">
              <label>Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="glass-select"
              >
                {Object.entries(themeColors).map(([key, color]) => (
                  <option key={key} value={key}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: color,
                        marginRight: "8px",
                      }}
                    ></span>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-row">
              <label>Font Size</label>
              <input
                type="range"
                min="14"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="glass-slider"
              />
            </div>

            <div className="setting-row">
              <label>Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="glass-select"
              >
                <option>Inter</option>
                <option>Poppins</option>
                <option>Nunito</option>
                <option>Roboto Mono</option>
                <option>Merriweather</option>
                <option>Montserrat</option>
              </select>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
