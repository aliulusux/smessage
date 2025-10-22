// src/pages/Chat.jsx
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import HeaderBar from "../components/HeaderBar.jsx"
import SettingsModal from "../components/SettingsModal.jsx"
import MessageList from "../components/MessageList.jsx"
import MessageInput from "../components/MessageInput.jsx"

const ONLINE_WINDOW_MS = 45_000   // considered online if active within last 45s
const ACTIVE_UPDATE_MS = 30_000   // how often we bump last_active
const SPAM_COOLDOWN_MS = 2_000    // message rate limit per user

export default function Chat() {
  const { channelId } = useParams()
  const nav = useNavigate()

  // UI state
  const [channel, setChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([]) // [{username, last_active}]
  const [openSettings, setOpenSettings] = useState(false)
  const listRef = useRef(null)

  // Username must be defined BEFORE any effects use it
  const username = useMemo(() => localStorage.getItem("username") || "", [])

  // If someone opens /chat directly without username, send them back
  useEffect(() => {
    if (!username) nav("/join")
  }, [username, nav])

  // Load channel & initial messages
  useEffect(() => {
    let alive = true
    const run = async () => {
      const { data: ch, error: e1 } = await supabase
        .from("channels")
        .select("*")
        .eq("id", channelId)
        .single()

      if (e1 || !ch) {
        alert("Channel not found.")
        nav("/join")
        return
      }
      if (!alive) return
      setChannel(ch)

      const { data: initial, error: e2 } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(500)

      if (!alive) return
      if (e2) console.error(e2)
      setMessages(initial || [])

      // scroll to bottom after initial load
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "auto",
        })
      }, 0)
    }
    run()
    return () => {
      alive = false
    }
  }, [channelId, nav])

  // Realtime messages (INSERT)
  useEffect(() => {
    if (!channelId) return
    const sub = supabase
      .channel(`messages-${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          // smooth scroll down on new message
          setTimeout(() => {
            listRef.current?.scrollTo({
              top: listRef.current.scrollHeight,
              behavior: "smooth",
            })
          }, 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [channelId])

  // Presence: update our last_active regularly, and keep a realtime user list
  useEffect(() => {
    if (!username) return

    const updateSelfActive = async () => {
      await supabase
        .from("users")
        .update({ last_active: new Date().toISOString() })
        .eq("username", username)
    }

    // initial bump + interval
    updateSelfActive()
    const interval = setInterval(updateSelfActive, ACTIVE_UPDATE_MS)

    // function to load all users (username + last_active)
    const loadUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("username, last_active")
      if (!error && data) {
        setUsers(data)
      }
    }
    loadUsers()

    // subscribe to any change in users table to refresh list
    const usersSub = supabase
      .channel("users-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadUsers)
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(usersSub)
    }
  }, [username])

  // Message sender with spam protection
  const lastSentRef = useRef(0)
  const sendMessage = async (content) => {
    const text = (content || "").trim()
    if (!text) return

    const now = Date.now()
    if (now - lastSentRef.current < SPAM_COOLDOWN_MS) {
      alert("You're sending messages too quickly. Please wait a moment.")
      return
    }
    lastSentRef.current = now

    const { error } = await supabase.from("messages").insert({
      channel_id: channelId,
      username,
      content: text,
    })
    if (error) alert(error.message)
  }

  const logout = () => {
    localStorage.removeItem("username")
    nav("/join")
  }

  // Helpers
  const isOnline = (iso) =>
    Date.now() - new Date(iso).getTime() < ONLINE_WINDOW_MS

  const lastSeenText = (iso) => {
    const diffMs = Date.now() - new Date(iso).getTime()
    const minutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(minutes / 60)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hr ago`
    return `${Math.floor(hours / 24)} day(s) ago`
  }

  const sortedUsers = [...users].sort((a, b) => {
    const ao = isOnline(a.last_active)
    const bo = isOnline(b.last_active)
    if (ao !== bo) return ao ? -1 : 1 // online first
    return a.username.localeCompare(b.username)
  })

  const onlineCount = users.filter((u) => isOnline(u.last_active)).length

  return (
    <div className="container" style={{ maxWidth: 1080 }}>
      <HeaderBar onSettings={() => setOpenSettings(true)} onLogout={logout} />

      <div className="chat-shell">
        {/* Chat column */}
        <div className="chat-box">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <div className="glow" style={{ fontSize: 20, fontWeight: 800 }}>
              {channel ? channel.name : "…"}
            </div>
          </div>

          <div className="msgs" ref={listRef}>
            <MessageList messages={messages} />
          </div>

          <MessageInput onSend={sendMessage} />
        </div>

        {/* Users column */}
        <div className="users">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Users <span style={{ fontWeight: 400, opacity: 0.8 }}>({onlineCount} online)</span>
          </div>

          {sortedUsers.length > 0 ? (
            sortedUsers.map((u) => {
              const online = isOnline(u.last_active)
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
                        background: online ? "#32cd32" : "#888",
                      }}
                    />
                    <span>{u.username}</span>
                  </div>
                  {!online && (
                    <div style={{ marginLeft: 18, fontSize: 12, opacity: 0.7 }}>
                      last seen {lastSeenText(u.last_active)}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div style={{ opacity: 0.8 }}>No users yet</div>
          )}
        </div>
      </div>

      <SettingsModal open={openSettings} onClose={() => setOpenSettings(false)} />
    </div>
  )
}
