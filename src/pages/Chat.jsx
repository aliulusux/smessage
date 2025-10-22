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

  // ✅ Define username here — before any useEffect
  const username = useMemo(
    () => localStorage.getItem("username") || `guest-${Math.floor(Math.random() * 9999)}`,
    []
  )

  useEffect(() => {
    if (!username) {
      nav("/join")
    }
  }, [username, nav])

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

// Presence tracking + realtime user list
useEffect(() => {
  const updateSelfActive = async () => {
    await supabase
      .from("users")
      .update({ last_active: new Date().toISOString() })
      .eq("username", username);
  };

  // Presence tracking + realtime user list (last_active system)
  useEffect(() => {
    const updateSelfActive = async () => {
      await supabase
        .from("users")
        .update({ last_active: new Date().toISOString() })
        .eq("username", username)
    }

    // update every 30s
    updateSelfActive()
    const interval = setInterval(updateSelfActive, 30000)

    // load all users
    const loadUsers = async () => {
      const { data } = await supabase.from("users").select("username, last_active")
      if (data) setUsers(data)
    }
    loadUsers()

    // listen for DB updates
    const sub = supabase
      .channel("users-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadUsers)
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(sub)
    }
  }, [username])

  // Realtime sync
  const sub = supabase
    .channel("users-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadUsers)
    .subscribe();

  return () => {
    clearInterval(interval);
    supabase.removeChannel(sub);
  };
}, [username]);

  // Load all users (optional display)
  useEffect(()=>{
    const loadUsers = async ()=>{
      const { data } = await supabase.from("users").select("username")
      if(data) setUsers(data.map(u=>u.username))
    }
    loadUsers()
    const sub = supabase.channel("users-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadUsers)
      .subscribe()
    return ()=> supabase.removeChannel(sub)
  },[])

  // Message Spam blocker
  const lastSent = useRef(0)
  const sendMessage = async (content)=>{
    const now = Date.now()
    if(now - lastSent.current < 3000){ // 2 seconds cooldown
      alert("You're sending messages too quickly. Please wait a moment.")
      return
    }
    lastSent.current = now

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
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Users{" "}
            {(() => {
              const onlineCount = users.filter(
                (u) => Date.now() - new Date(u.last_active).getTime() < 45000
              ).length;
              return (
                <span style={{ fontWeight: 400, opacity: 0.8 }}>
                  ({onlineCount} online)
                </span>
              );
            })()}
          </div>

          {users.length > 0 ? (
            users.map((u) => {
              const lastActive = new Date(u.last_active).getTime();
              const diffMs = Date.now() - lastActive;
              const isOnline = diffMs < 45000; // active within last 45s

              // convert ms to human readable time
              let lastSeen = "";
              if (!isOnline) {
                const minutes = Math.floor(diffMs / 60000);
                const hours = Math.floor(minutes / 60);
                if (minutes < 1) lastSeen = "just now";
                else if (minutes < 60) lastSeen = `${minutes} min ago`;
                else if (hours < 24) lastSeen = `${hours} hr ago`;
                else lastSeen = `${Math.floor(hours / 24)} day(s) ago`;
              }

              return (
                <div
                  key={u.username}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: isOnline ? "#32cd32" : "#888",
                      }}
                    ></div>
                    <span>{u.username}</span>
                  </div>
                  {!isOnline && (
                    <div style={{ marginLeft: 18, fontSize: 12, opacity: 0.7 }}>
                      last seen {lastSeen}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ opacity: 0.8 }}>No users yet</div>
          )}
        </div>
      </div>

      <SettingsModal open={openSettings} onClose={()=>setOpenSettings(false)}/>
    </div>
  )
}
