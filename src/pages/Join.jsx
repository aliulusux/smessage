import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Join() {
  const [username, setUsername] = useState("");
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch available channels
  useEffect(() => {
    const fetchChannels = async () => {
      const { data, error } = await supabase.from("channels").select("*");
      if (!error) setChannels(data);
      setLoading(false);
    };
    fetchChannels();
  }, []);

  const handleCreateChannel = async () => {
    if (!username.trim()) {
      showAlert("Please enter a username first.");
      return;
    }

    const name = prompt("Enter new channel name:");
    if (!name) return;

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name }])
      .select()
      .single();

    if (!error && data) navigate(`/chat/${data.id}?user=${username}`);
  };

  const handleJoin = (channelId) => {
    if (!username.trim()) {
      showAlert("Please enter a username first.");
      return;
    }
    navigate(`/chat/${channelId}?user=${username}`);
  };

  // Modern popup alert (centered glass style)
  const showAlert = (msg) => {
    const existing = document.querySelector(".popup-alert");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.className = "popup-alert";
    el.innerHTML = `
      <div class="popup-content">
        <p>${msg}</p>
        <button id="closePopup">OK</button>
      </div>
    `;
    document.body.appendChild(el);
    document.getElementById("closePopup").onclick = () => el.remove();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff7aa2, #ff9ca5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 40 }}>
        sMessage
      </h1>

      <div
        style={{
          width: "340px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: 20,
          padding: "30px 25px",
          backdropFilter: "blur(16px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            outline: "none",
            marginBottom: 25,
          }}
        />

        <h3 style={{ marginBottom: 10 }}>Available Channels</h3>
        {loading ? (
          <p style={{ opacity: 0.8 }}>Loading channels...</p>
        ) : channels.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleJoin(ch.id)}
                style={{
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "transform 0.15s ease, opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {ch.name}
              </button>
            ))}
          </div>
        ) : (
          <p style={{ opacity: 0.8 }}>No channels yet.</p>
        )}

        <button
          onClick={handleCreateChannel}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 0",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Create Channel
        </button>
      </div>

      {/* popup style */}
      <style>
        {`
        .popup-alert {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .popup-content {
          background: rgba(255,255,255,0.15);
          padding: 25px 30px;
          border-radius: 16px;
          color: #fff;
          text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          animation: fadeIn 0.25s ease-in-out;
        }
        .popup-content p {
          margin-bottom: 15px;
          font-size: 15px;
        }
        .popup-content button {
          border: none;
          background: linear-gradient(135deg,#667eea,#764ba2);
          color: #fff;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        `}
      </style>
    </div>
  );
}
