import { useState } from "react"

export default function MessageInput({ onSend }){
  const [text,setText] = useState("")
  const send = ()=>{
    const t = text.trim()
    if(!t) return
    onSend?.(t)
    setText("")
  }
  return (
    <div className="msg-input-wrap">
      <input
        className="msg-input"
        placeholder="Type your message…"
        value={text}
        onChange={e=>setText(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") send() }}
      />
      <button className="send-btn" onClick={send}>Send</button>
    </div>
  )
}
