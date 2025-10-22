import { useState } from "react"

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("")
  const send = () => {
    if (!text.trim()) return
    onSend(text)
    setText("")
  }

  const handleChange = (e) => {
    setText(e.target.value)
    if (onTyping) onTyping()
  }

  return (
    <div className="row" style={{
      marginTop: 12, background: "rgba(255,255,255,0.1)",
      borderRadius: 12, padding: 4, alignItems: "center"
    }}>
      <input
        value={text}
        onChange={handleChange}
        onKeyDown={e => e.key === "Enter" && send()}
        placeholder="Type your message..."
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          padding: "10px 12px", color: "white", fontSize: 15,
        }}
      />
      <button
        onClick={send}
        className="btn"
        style={{
          borderRadius: 10,
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          color: "#fff", padding: "6px 16px", fontWeight: 600
        }}
      >Send</button>
    </div>
  )
}
