import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import GlassAlert from "../components/GlassAlert";


export default function Chat({ username, channelId, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // Fetch and listen to users
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from("users").select("*");
      setUsers(data || []);
    };
    loadUsers();

    const channel = supabase
      .channel("users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add user on join
  useEffect(() => {
    const addUser = async () => {
      if (!username) return;
      await supabase.from("users").upsert({ username, last_active: new Date().toISOString() });
    };
    addUser();
  }, [username]);

  // Remove user on exit
  useEffect(() => {
    const removeUserOnExit = async () => {
      if (username) {
        await supabase.from("users").delete().eq("username", username);
      }
    };
    window.addEventListener("beforeunload", removeUserOnExit);
    return () => window.removeEventListener("beforeunload", removeUserOnExit);
  }, [username]);

  // Typing indicator
  const handleTyping = async () => {
    await supabase
      .from("typing")
      .upsert({ username, channel_id: channelId, is_typing: true });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(async () => {
      await supabase
        .from("typing")
        .update({ is_typing: false })
        .eq("username", username);
    }, 2500);
  };

  useEffect(() => {
    const channel = supabase
      .channel("typing")
      .on("postgres_changes", { event: "*", schema: "public", table: "typing" }, async () => {
        const { data } = await supabase.from("typing").select("*").eq("channel_id", channelId);
        const active = data?.find((t) => t.is_typing && t.username !== username);
        setTypingUser(active ? active.username : "");
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [channelId, username]);

  // Send message
  const sendMessage = async () => {
    if (!messageText.trim()) return;
    const { error } = await supabase.from("messages").insert({
      username,
      channel_id: channelId,
      content: messageText.trim(),
    });
    if (error) setAlertMessage("Failed to send message.");
    setMessageText("");
  };

  // UI return
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--theme-bg)",
        padding: 20,
        transition: "0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <h1
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            textShadow: "0 0 10px rgba(255,255,255,0.3)",
          }}
        >
          sMessage
        </h1>
        <div>
          <button
            onClick={() => setAlertMessage("Settings coming soon")}
            style={{
              marginRight: 10,
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 15,
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            Settings
          </button>
          <button
            onClick={onLogout}
            style={{
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 15,
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat container */}
      <div style={{ display: "flex", flex: 1, gap: 15 }}>
        {/* Messages */}
        <div
          style={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: 15,
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.username === username ? "flex-end" : "flex-start",
                background:
                  msg.username === username
                    ? "linear-gradient(135deg,#764ba2,#667eea)"
                    : "rgba(255,255,255,0.15)",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 14,
                marginBottom: 8,
                maxWidth: "70%",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <b>{msg.username}</b>
              <div>{msg.content}</div>
            </div>
          ))}
          {typingUser && (
            <div
              style={{
                fontStyle: "italic",
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {typingUser} is typing{" "}
              <div className="typing-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Users */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: 15,
            color: "#fff",
          }}
        >
          <h3>Users ({users.filter(u => u.online).length} online)</h3>
          {users.map((u, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: u.online ? "#3f0" : "#888",
                  marginRight: 8,
                }}
              ></div>
              {u.username}
            </div>
          ))}
        </div>
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

      {/* Message input */}
      <div style={{ marginTop: 10, display: "flex" }}>
        <input
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping();
          }}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            outline: "none",
            fontSize: 15,
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: 8,
            padding: "10px 20px",
            border: "none",
            borderRadius: 10,
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>

      {alertMessage && (
        <GlassAlert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}
    </div>
  );
}
