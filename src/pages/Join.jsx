import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import GlassAlert from "../components/GlassAlert";

export default function Join() {
  const [username, setUsername] = useState("");
  const [channels, setChannels] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  // 🔹 Load channels
  useEffect(() => {
    const fetchChannels = async () => {
      const { data, error } = await supabase.from("channels").select("*");
      if (error) console.error(error);
      else setChannels(data || []);
    };
    fetchChannels();
  }, []);

  // 🔹 Join channel
  const joinChannel = async (id) => {
    if (!username.trim()) {
      setAlertMessage("Please enter a username first!");
      return;
    }

    const { data: channel } = await supabase
      .from("channels")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!channel) {
      setAlertMessage("❌ This channel no longer exists!");
      return;
    }

    localStorage.setItem("username", username);

    // Mark user online
    await supabase
      .from("users")
      .upsert({ username, is_online: true, last_active: new Date().toISOString() });

    navigate(`/chat/${id}`);
  };

  // 🔹 Create channel
  const createChannel = async () => {
    if (!username.trim()) {
      setAlertMessage("Please enter a username first!");
      return;
    }

    const channelName = prompt("Enter a new channel name:");
    if (!channelName) return;

    const { data, error } = await supabase
      .from("channels")
      .insert({ name: channelName })
      .select();

    if (error) {
      console.error(error);
      setAlertMessage("Error creating channel.");
      return;
    }

    localStorage.setItem("username", username);
    navigate(`/chat/${data[0].id}`);
  };

  return (
    <div className="join-page">
      {alertMessage && (
        <GlassAlert message={alertMessage} onClose={() => setAlertMessage("")} />
      )}

      <div className="join-box glass">
        <h1>sMessage</h1>

        <input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
