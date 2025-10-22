"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CreateChannelModal from "@/components/CreateChannelModal";

export default function JoinPage() {
  const [username, setUsername] = useState("");
  const [channels, setChannels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    const { data } = await supabase.from("channels").select("*");
    setChannels(data || []);
  };

  const joinChannel = (id) => {
    if (!username) return alert("Enter a username first!");
    router.push(`/chat?channel=${id}&user=${username}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-100 to-pink-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[480px]">
        <h1 className="text-3xl font-bold text-center mb-2 text-purple-700">
          Join sMessage
        </h1>
        <p className="text-center mb-6 text-gray-600">
          Enter your username and select a channel
        </p>

        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6 outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-purple-600 text-white py-2 rounded-lg mb-6 hover:bg-purple-700 transition"
        >
          Create Channel
        </button>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {channels.map((c) => (
            <div
              key={c.id}
              className="flex justify-between items-center p-3 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-500">{c.is_private ? "🔒 Private" : "🌐 Public"}</p>
              </div>
              <button
                onClick={() => joinChannel(c.id)}
                className="bg-purple-500 text-white px-4 py-1.5 rounded-lg hover:bg-purple-600"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && <CreateChannelModal onClose={() => setShowModal(false)} refresh={fetchChannels} />}
    </div>
  );
}
