import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import SettingsModal from "../components/SettingsModal.jsx"
import MessageList from "../components/MessageList.jsx"
import MessageInput from "../components/MessageInput.jsx"

const ONLINE_WINDOW_MS = 45000
const ACTIVE_UPDATE_MS = 15000
const SPAM_COOLDOWN_MS = 2000
const TYPING_TIMEOUT_MS = 4000

export default function Chat() {
  const { channelId } = useParams()
  const nav = useNavigate()
  const [channel, setChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [openSettings, setOpenSettings] = useState(false)
  const listRef = useRef(null)
  const username = useMemo(() => localStorage.getItem("username") || "", [])

  useEffect(() => { if (!username) nav("/join") }, [username, nav])

  // ✅ Load channel & messages
  useEffect(() => {
    const load = async () => {
      const { data: ch } = await supabase.from("channels").select("*").eq("id", channelId).single()
      if (!ch) return nav("/join")
      setChannel(ch)
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
      setMessages(msgs || [])
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 0)
    }
    load()
  }, [channelId, nav])

  // ✅ Realtime new messages
  useEffect(() => {
    const sub = supabase.channel(`messages-${channelId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        payload => {
          setMessages(m => [...m, payload.new])
          setTimeout(() => listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth"
          }), 80)
        })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [channelId])

  // ✅ Typing realtime (unchanged)
  useEffect(() => {
    const typingSub = supabase.channel(`typing-${channelId}`)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.username === username) return
        setTypingUsers(prev => {
          const exists = prev.find(u => u.username === payload.username)
          if (exists) return prev
          return [...prev, { username: payload.username, timeout: Date.now() + TYPING_TIMEOUT_MS }]
        })
      })
      .subscribe()

    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => u.timeout > Date.now()))
    }, 1000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(typingSub)
    }
  }, [username, channelId])

  // ✅ Fix presence sync + new tab detection
  useEffect(() => {
    if (!username) return

    const refreshUsers = async () => {
      const { data } = await supabase.from("users").select("username,last_active")
      setUsers(data || [])
    }

    const markActive = async () => {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from("users")
        .upsert({ username, last_active: now })
      if (error) console.error("User update failed:", error)
    }

    refreshUsers()
    markActive()

    const interval = setInterval(markActive, ACTIVE_UPDATE_MS)

    const sub = supabase.channel("users-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, refreshUsers)
      .subscribe()

    const cleanup = async () => {
      await supabase.from("users").delete().eq("username", username)
    }

    window.addEventListener("beforeunload", cleanup)
    return () => {
      clearInterval(interval)
      supabase.removeChannel(sub)
      window.removeEventListener("beforeunload", cleanup)
      cleanup()
    }
  }, [username])

  const lastSent = useRef(0)
  const sendMessage = async (content) => {
    const now = Date.now()
    if (now - lastSent.current < SPAM_COOLDOWN_MS) return alert("Slow down 😊")
    lastSent.current = now
    if (!content.trim()) return
    const { error } = await supabase.from("messages").insert({ channel_id: channelId, username, content })
    if (error) alert(error.message)
  }

  const sendTyping = async () => {
    await supabase.channel(`typing-${channelId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { username }
    })
  }

  const logout = async () => {
    await supabase.from("users").delete().eq("username", username)
    localStorage.removeItem("username")
    nav("/join")
  }

  const isOnline = (u) => Date.now() - new Date(u.last_active).getTime() < ONLINE_WINDOW_MS
  const lastSeen = (u) => {
    const diff = Date.now() - new Date(u.last_active).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return "just now"
    if (min < 60) return `${min} min ago`
    return `${Math.floor(min / 60)} hr ago`
  }

  const onlineCount = users.filter(isOnline).length
  const sortedUsers = [...users].sort((a, b) => (isOnline(b) - isOnline(a)) || a.username.localeCompare(b.username))

  return (
    <div className="container" style={{ maxWidth: 1100 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h1 className="glow" style={{ fontSize: 28, fontWeight: 800 }}>sMessage</h1>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn" onClick={() => setOpenSettings(true)}>Settings</button>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="chat-shell">
        <div className="chat-box">
          <div className="glow" style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
            {channel?.name || "Channel"}
          </div>

          <div className="msgs" ref={listRef}>
            <MessageList messages={messages} username={username} />
          </div>

          {/* Typing indicator with gradient dots */}
          {typingUsers.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              margin: "6px 0", paddingLeft: 10
            }}>
              <div style={{
                fontSize: 13, color: "rgba(255,255,255,0.85)",
                fontStyle: "italic", whiteSpace: "nowrap"
              }}>
                {typingUsers.map(u => u.username).join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {[0, 0.25, 0.5].map((d, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "linear-gradient(135deg,#667eea,#764ba2)",
                    animation: `typingGradient 1.4s infinite ${d}s`
                  }} />
                ))}
              </div>
            </div>
          )}

          <MessageInput onSend={sendMessage} onTyping={sendTyping} />
        </div>

        <div className="users">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Users <span style={{ opacity: 0.8 }}>({onlineCount} online)</span>
          </div>
          {sortedUsers.map(u => {
            const online = isOnline(u)
            return (
              <div key={u.username} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: online ? "#32cd32" : "#888"
                  }}></div>
                  <span>{u.username}</span>
                </div>
                {!online && <div style={{ marginLeft: 18, fontSize: 12, opacity: 0.7 }}>last seen {lastSeen(u)}</div>}
              </div>
            )
          })}
        </div>
      </div>

      <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />
    </div>
  )
}
