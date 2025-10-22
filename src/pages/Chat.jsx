import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";

export default function Chat({ nick, channel, users, messages, sendMessage, sendTyping }) {
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);

  // Auto scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- ✅ USER SYNC FIX ---
  useEffect(() => {
    const username = localStorage.getItem("username") || nick;
    if (!username) return;

    const addUser = async () => {
      await supabase.from("users").upsert({
        username,
        last_active: new Date().toISOString(),
      });
    };

    const removeUser = async () => {
      await supabase.from("users").delete().eq("username", username);
    };

    addUser();

    const userChannel = supabase
      .channel("users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        async () => {
          const { data } = await supabase.from("users").select("*");
          users.setUsers(data || []); // assumes setUsers comes via props
        }
      )
      .subscribe();

    window.addEventListener("beforeunload", removeUser);

    return () => {
      window.removeEventListener("beforeunload", removeUser);
      removeUser();
      supabase.removeChannel(userChannel);
    };
  }, [nick]);

  // --- ✅ TYPING INDICATOR ---
  useEffect(() => {
    const channel = supabase
      .channel("typing")
      .on("postgres_changes", { event: "*", schema: "public", table: "typing" }, async () => {
        const { data } = await supabase.from("typing").select("*");
        const active = data?.filter((t) => t.is_typing && t.username !== nick) || [];
        setTypingUsers(active);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nick]);

  const handleSend = () => {
    if (text.trim() === "") return;
    sendMessage(text);
    setText("");
  };

  const handleTyping = () => {
    sendTyping();
  };

  return (
    <div className="chat-container" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ color: "#fff", fontWeight: 600 }}>sMessage</h2>
        <div>
          <button
            style={{
              marginRight: 10,
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "#fff",
              padding: "6px 14px",
              cursor: "pointer",
            }}
          >
            Settings
          </button>
          <button
            style={{
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "#fff",
              padding: "6px 14px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Messages */}
        <div
          style={{
            flex: 3,
            padding: 20,
            overflowY: "auto",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px 0 0 12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.sender === nick ? "flex-end" : "flex-start",
                background:
                  msg.sender === nick
                    ? "linear-gradient(135deg,#764ba2,#667eea)"
                    : "rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "10px 15px",
                borderRadius: 14,
                marginBottom: 8,
                maxWidth: "70%",
                boxShadow: "0 0 8px rgba(0,0,0,0.15)",
              }}
            >
              <b>{msg.sender}</b>
              <div>{msg.text}</div>
            </div>
          ))}

          {/* ✅ Typing Indicator */}
          {typingUsers.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "6px 0",
                paddingLeft: 10,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  fontStyle: "italic",
                  whiteSpace: "nowrap",
                }}
              >
                {typingUsers.map((u) => u.username).join(", ")}{" "}
                {typingUsers.length > 1 ? "are typing" : "is typing"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  className="dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#667eea,#764ba2)",
                    animation: "typingGradient 1.4s infinite",
                  }}
                ></div>
                <div
                  className="dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#667eea,#764ba2)",
                    animation: "typingGradient 1.4s infinite 0.25s",
                  }}
                ></div>
                <div
                  className="dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#667eea,#764ba2)",
                    animation: "typingGradient 1.4s infinite 0.5s",
                  }}
                ></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* User List */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "0 12px 12px 0",
            padding: 15,
            color: "#fff",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginBottom: 8 }}>Users</h3>
          {users.map((user, index) => (
            <div key={index} style={{ marginBottom: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "limegreen",
                  marginRight: 6,
                }}
              ></span>
              {user.username}
            </div>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div
        style={{
          display: "flex",
          padding: 10,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          onInput={handleTyping}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: 8,
            border: "none",
            borderRadius: 10,
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            color: "#fff",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
