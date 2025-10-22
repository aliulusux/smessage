export default function SettingsModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="overlay" style={{
      position: "fixed", inset: 0, backdropFilter: "blur(12px)",
      background: "rgba(0,0,0,0.35)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50
    }}>
      <div className="card" style={{
        width: 420, padding: 24, borderRadius: 20,
        background: "rgba(255,255,255,0.1)",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)", color: "white"
      }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Settings</h2>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%", border: "none",
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "white", fontSize: 20, cursor: "pointer",
              boxShadow: "0 0 8px rgba(118,75,162,0.6)"
            }}
          >×</button>
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Font Size</label>
          <select className="input" style={{ width: "100%", padding: 8, background: "rgba(255,255,255,0.08)", color: "white" }}>
            <option>16px</option><option>18px</option><option>20px</option><option>22px</option><option>24px</option>
          </select>

          <label style={{ display: "block", margin: "14px 0 6px" }}>Font Family</label>
          <select className="input" style={{ width: "100%", padding: 8, background: "rgba(255,255,255,0.08)", color: "white" }}>
            <option>Inter</option><option>Poppins</option><option>Roboto</option><option>Open Sans</option><option>Montserrat</option><option>Lato</option>
          </select>

          <label style={{ display: "block", margin: "14px 0 6px" }}>Theme</label>
          <select className="input" style={{
            width: "100%", padding: 8, color: "white",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <option>sunset</option><option>neon</option><option>dark</option><option>light</option>
            <option>amethyst</option><option>pastel</option><option>iced</option>
            <option>sunrise</option><option>ocean</option><option>midnight</option>
          </select>
        </div>
      </div>
    </div>
  )
}
