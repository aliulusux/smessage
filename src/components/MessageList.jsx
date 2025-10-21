export default function MessageList({ messages }){
  return (
    <div className="msgs">
      {messages.map(m=>(
        <div key={m.id} style={{marginBottom:10}}>
          <div style={{fontWeight:700}}>{m.username}</div>
          <div>{m.content}</div>
          <div style={{opacity:.6, fontSize:12}}>{new Date(m.created_at).toLocaleString()}</div>
        </div>
      ))}
      {messages.length===0 && <div style={{opacity:.8}}>No messages yet. Say hi 👋</div>}
    </div>
  )
}
