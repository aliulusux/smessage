export default function MessageList({ messages, username }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {messages.map((m) => {
        const mine = m.username === username
        const initials = m.username ? m.username.charAt(0).toUpperCase() : "?"
        return (
          <div key={m.id || Math.random()} style={{
            display: "flex",
            justifyContent: mine ? "flex-end" : "flex-start",
            textAlign: mine ? "right" : "left",
            alignItems: "flex-end",
            gap: 8
          }}>
            {!mine && (
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#667eea,#764ba2)",
                color: "#fff", fontWeight: 700,
                display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: 16, boxShadow: "0 0 6px rgba(0,0,0,0.25)"
              }}>{initials}</div>
            )}

            <div style={{
              maxWidth: "70%",
              background: mine
                ? "linear-gradient(135deg,#667eea,#764ba2)"
                : "rgba(255,255,255,0.1)",
              color: mine ? "#fff" : "#eee",
              padding: "10px 14px",
              borderRadius: 18,
              borderTopRightRadius: mine ? 4 : 18,
              borderTopLeftRadius: mine ? 18 : 4,
              boxShadow: "0 0 8px rgba(0,0,0,0.2)"
            }}>
              {!mine && (
                <div style={{ fontWeight: 600, marginBottom: 4, opacity: 0.9 }}>{m.username}</div>
              )}
              <div>{m.content}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>

            {mine && (
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#667eea,#764ba2)",
                color: "#fff", fontWeight: 700,
                display: "flex", justifyContent: "center", alignItems: "center",
                fontSize: 16, boxShadow: "0 0 6px rgba(0,0,0,0.25)"
              }}>{initials}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
