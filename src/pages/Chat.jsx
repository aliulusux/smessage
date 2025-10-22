import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GlassAlert from "../components/GlassAlert";

export default function Chat() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [text, setText] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // 🧹 Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Validate channel before fetching
  const validateChannel = async () => {
    const { data, error } = await supabase
      .from("channels")
      .select("id")
      .eq("id", channelId)
      .maybeSingle();

    if (error || !data) {
      setAlertMessage("⚠️ Channel not found. Redirecting...");
      setTimeout(() => navigate("/join"), 1500);
      return false;
    }
    return true;
  };

  // 📥 Fetch messages + realtime subscription
  useEffect(() => {
    const fetchMessages = async () => {
      if (!channelId) return;

      const valid = await validateChannel();
      if (!valid) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error.message);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // 👥 Fetch and sync users in real time
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from("users").select("*");
      setUsers(data || []);
    };

    loadUsers();

    const userChannel = supabase
      .channel("users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => loadUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, []);

  // 💬 Send message
  const sendMessage = async () => {
    const username = localStorage.getItem("username");
    if (!text.trim() || !username || !channelId) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender: username,
        text,
        channel_id: channelId,
      },
    ]);

    if (error) console.error("Error sending message:", error);
    setText("");
  };

  // ⌨️ Handle typing
  const sendTyping = async () => {
    const username = localStorage.getItem("username");
    if (!username || !channelId) return;

    await supabase.from("typing").upsert({
      username,
      channel_id: channelId,
      last_typed: new Date().toISOString(),
    });
  };

  // ✉️ Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-page">
      {alertMessage && (
        <GlassAlert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}

      <div className="chat-header">
        <h2>sMessage</h2>
        <div className="chat-actions">
          <button className="btn">Settings</button>
          <button className="btn" onClick={() => navigate("/join")}>
            Logout
          </button>
        </div>
      </div>

      <div className="chat-body">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${
                msg.sender === localStorage.getItem("username")
                  ? "sent"
                  : "received"
              }`}
            >
              <span className="message-sender">{msg.sender}</span>
              <p>{msg.text}</p>
              <small>
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="user-list">
          <h3>
            Users ({users.filter((u) => u.is_online).length} online)
          </h3>
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                <span
                  className={`status-dot ${
                    u.is_online ? "online" : "offline"
                  }`}
                ></span>
                {u.username}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={sendTyping}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
