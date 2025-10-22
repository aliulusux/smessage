"use client";
import { useState } from "react";

export default function SettingsModal({ onClose }) {
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [theme, setTheme] = useState("light");

  const fontOptions = ["Inter", "Roboto", "Poppins", "Montserrat", "Lora", "Courier New"];
  const themeOptions = [
    "light",
    "dark",
    "sunset",
    "neon",
    "amethyst",
    "pastel",
    "iced",
    "mint",
    "sand",
    "midnight",
  ];

  const applySettings = () => {
    document.documentElement.style.fontSize = fontSize;
    document.body.style.fontFamily = fontFamily;
    document.body.setAttribute("data-theme", theme);

    // Persist in localStorage
    localStorage.setItem("chatTheme", theme);
    localStorage.setItem("chatFontSize", fontSize);
    localStorage.setItem("chatFontFamily", fontFamily);

    onClose();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("chatTheme");
    const savedFontSize = localStorage.getItem("chatFontSize");
    const savedFontFamily = localStorage.getItem("chatFontFamily");
    if (savedTheme) document.body.setAttribute("data-theme", savedTheme);
    if (savedFontSize) document.documentElement.style.fontSize = savedFontSize;
    if (savedFontFamily) document.body.style.fontFamily = savedFontFamily;
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-2xl">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Font Size
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="border rounded-lg w-full p-2"
          >
            <option>16px</option>
            <option>18px</option>
            <option>20px</option>
            <option>22px</option>
            <option>24px</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="border rounded-lg w-full p-2"
          >
            {fontOptions.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="border rounded-lg w-full p-2"
          >
            {themeOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            Cancel
          </button>
          <button
            onClick={applySettings}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
