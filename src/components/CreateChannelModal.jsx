import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createChannel } from "../lib/supabaseClient";
import { sha256 } from "../utils/hash";

export default function CreateChannelModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const canCreate = name.trim().length >= 3 && (!isPrivate || password.length >= 1);

  const submit = async () => {
    if (!canCreate || busy) return;
    setBusy(true);
    const hashed = isPrivate ? await sha256(password) : null;
    const row = await createChannel({ name: name.trim(), is_private: isPrivate, hashed_password: hashed });
    setBusy(false);
    onCreated(row);
    onClose();
    setName(""); setPassword("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div className="modal" initial={{scale:.96,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.96,opacity:0}}>
            <div className="modal-head">
              <h3>Create New Channel</h3>
              <button className="x" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
              <label>Channel Name</label>
              <input placeholder="Enter channel name" value={name} onChange={e=>setName(e.target.value)} />
              <label className="row">
                <input type="checkbox" checked={isPrivate} onChange={e=>setIsPrivate(e.target.checked)} />
                <span>Private Channel (Password Protected)</span>
              </label>
              {isPrivate && (
                <>
                  <label>Password</label>
                  <input type="password" placeholder="Enter password" value={password} onChange={e=>setPassword(e.target.value)} />
                </>
              )}
            </div>
            <div className="modal-foot">
              <button onClick={submit} disabled={!canCreate || busy}>{busy ? "Creating..." : "Create Channel"}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
