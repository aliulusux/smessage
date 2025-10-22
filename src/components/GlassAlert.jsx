import React, { useEffect } from "react";

export default function GlassAlert({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          padding: "20px 28px",
          borderRadius: 14,
          boxShadow: "0 0 15px rgba(118,75,162,0.4)",
          color: "#fff",
          textAlign: "center",
          fontSize: 16,
          backdropFilter: "blur(10px)",
          animation: "popUp 0.25s ease",
          maxWidth: 320,
          lineHeight: 1.4,
        }}
      >
        {message}
      </div>
    </div>
  );
}
