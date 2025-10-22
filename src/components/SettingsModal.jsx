export default function SettingsModal({ open, onClose }) {
  if (!open) return null
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", justifyContent: "center", alignItems: "center",
      background: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(10px)",
      zIndex: 100
    }}>
      <div style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 20,
        padding: 24,
        width: 420,
        boxShadow: "0 0 30px rgba(0,0,0,0.3)",
        color: "white"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Settings</h2>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            color: "white", fontSize: 20, cursor: "pointer",
            display: "flex", justifyContent: "center", alignItems: "center",
            boxShadow: "0 0 10px rgba(118,75,162,0.6)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }}
            onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseOut={e => e.currentTarget.style.transform = "scale(1.0)"}
          >×</button>
        </div>

        <div style={{ marginTop: 20 }}>
          {["Font Size", "Font Family", "Theme"].map((label, idx) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>{label}</label>
              <select
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 10,
                  background: "rgba(255,255,255,0.12)",
                  color: "white", border: "1px solid rgba(255,255,255,0.25)",
                  appearance: "none", backdropFilter: "blur(6px)",
                  cursor: "pointer"
                }}
              >
                {idx === 0 && ["16px", "18px", "20px", "22px", "24px"].map(s => <option key={s}>{s}</option>)}
                {idx === 1 && ["Inter", "Poppins", "Roboto", "Open Sans", "Montserrat", "Lato"].map(f => <option key={f}>{f}</option>)}
                {idx === 2 && ["sunset", "neon", "dark", "light", "amethyst", "pastel", "iced", "sunrise", "ocean", "midnight"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
