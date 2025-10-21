import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import HeaderBar from "../components/HeaderBar.jsx"
import SettingsModal from "../components/SettingsModal.jsx"
import MessageList from "../components/MessageList.jsx"
import MessageInput from "../components/MessageInput.jsx"

export default function Chat(){
  const { channelId } = useParams()
  const nav = useNavigate()
  const [channel,setChannel] = useState(null)
  const [messages,setMessages] = useState([])
  const [users,setUsers] = useState([])
  const [openSettings,setOpenSettings] = useState(false)
  const listRef = useRef(null)

  //user 
  useEffect(()=>{
    const updateActive = async ()=>{
      await supabase.from("users")
        .update({ last_active: new Date().toISOString() })
        .eq("username", username)
    }
    updateActive()
    const interval = setInterval(updateActive, 30000) // every 30s
    return ()=> clearInterval(interval)
  },[username])

  // Load channel + initial messages
  useEffect(()=>{
    ;(async ()=>{
      const { data: ch, error: e1 } = await supabase.from("channels").select("*").eq("id", channelId).single()
      if(e1){ alert("Channel not found."); nav("/join"); return }
      setChannel(ch)

      const { data: initial, error:e2 } = await supabase.from("messages")
        .select("*").eq("channel_id", channelId).order("created_at", { ascending: true }).limit(200)
      if(e2) console.error(e2)
      setMessages(initial || [])
    })()
  },[channelId,nav])

  // Realtime: postgres changes
  useEffect(()=>{
    const pg = supabase.channel(`messages-${channelId}`)
      .on("postgres_changes", {
        event: "INSERT", schema:"public", table:"messages", filter:`channel_id=eq.${channelId}`
      }, (payload)=>{
        setMessages(m=>[...m, payload.new])
        // scroll
        setTimeout(()=>{
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
        }, 50)
      })
      .subscribe()
    return ()=> supabase.removeChannel(pg)
  },[channelId])

  // Presence on realtime channel (user list)
  useEffect(()=>{
    const rc = supabase.channel(`presence-${channelId}`, {
      config: { presence: { key: username } }
    })

    rc.on("presence", { event: "sync" }, ()=>{
      const state = rc.presenceState()
      const all = Object.values(state).flat().map(p=>p.key)
      setUsers(Array.from(new Set(all)))
    })
    rc.subscribe(status=>{
      if(status === "SUBSCRIBED"){
        rc.track({ key: username })
      }
    })
    return ()=> supabase.removeChannel(rc)
  },[channelId, username])

  const sendMessage = async (content)=>{
    const { error } = await supabase.from("messages").insert({
      channel_id: channelId, username, content
    })
    if(error) alert(error.message)
  }

  const logout = ()=>{
    localStorage.removeItem("username")
    nav("/join")
  }

  return (
    <div className="container" style={{maxWidth:1080}}>
      <HeaderBar onSettings={()=>setOpenSettings(true)} onLogout={logout}/>
      <div className="chat-shell">
        <div className="chat-box">
          <div className="row" style={{justifyContent:"space-between", marginBottom:8}}>
            <div className="glow" style={{fontSize:20, fontWeight:800}}>
              {channel ? channel.name : "…"}
            </div>
          </div>

          <div className="msgs" ref={listRef}>
            <MessageList messages={messages}/>
          </div>

          <MessageInput onSend={sendMessage}/>
        </div>

        <div className="users">
          <div style={{fontWeight:700, marginBottom:10}}>Users online</div>
          {users.map(u=>(
            <div key={u} style={{marginBottom:6}}>{u}</div>
          ))}
          {users.length===0 && <div style={{opacity:.8}}>No one yet</div>}
        </div>
      </div>

      <SettingsModal open={openSettings} onClose={()=>setOpenSettings(false)}/>
    </div>
  )
}
