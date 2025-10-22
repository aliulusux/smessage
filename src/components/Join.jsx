import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listChannels, getChannelById } from "../lib/supabaseClient";
import CreateChannelModal from "./CreateChannelModal";
import { sha256 } from "../utils/hash";

export default function Join({ username, setUsername, onJoin }) {
  const [channels, setChannels] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({}); // channelId -> text

  const load = async () => {
    setLoading(true);
    setChannels(await listChannels());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const tryJoin = async (ch) => {
    if (!username.trim()) return alert("Please enter a username.");
    if (ch.is_private) {
      const typed = passwords[ch.id] || "";
      const hashed = await sha256(typed);
      if (hashed !== ch.hashed_password) return alert("Wrong password for this private channel.");
    }
    onJoin(ch);
  };

  return (
    <div className="join">
      <motion.h1 initial={{y:8,opacity:0}} animate={{y:0,opacity:1}}>
        Join <span className="brand">sMessage</span>
      </motion.h1>

      <div className="join-bar">
        <input
          placeholder="Enter your username"
          value={username}
          onChange={e=>setUsername(e.target.value)}
        />
        <button onClick={()=>setOpenModal(true)}>Create Channel</button>
      </div>

      <div className="channels">
        <h3>Available Channels</h3>
        <div className="list">
          {loading && <p className="dim">Loading channels…</p>}
          {!loading && channels.length === 0 && <p className="dim">No channels yet. Create one!</p>}
          {channels.map(ch => (
            <div className="card" key={ch.id}>
              <div className="card-main">
                <div className="title">
                  {ch.name}
                  {ch.is_private && <span className="lock" title="Private">🔒</span>}
                </div>
                {ch.is_private && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={passwords[ch.id] || ""}
                    onChange={e=>setPasswords(p=>({ ...p, [ch.id]: e.target.value }))}
                  />
                )}
              </div>
              <button onClick={()=>tryJoin(ch)}>Join</button>
            </div>
          ))}
        </div>
      </div>

      <CreateChannelModal
        open={openModal}
        onClose={()=>setOpenModal(false)}
        onCreated={(row)=>{ setChannels(prev=>[row, ...prev]); }}
      />
    </div>
  );
}
