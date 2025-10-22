"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CreateChannelModal({ onClose, refresh }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const createChannel = async () => {
    await supabase.from("channels").insert([
      { name, password: isPrivate ? password : null, is_private: isPrivate },
    ]);
    refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
        <h2 className="text-xl font-semibold mb-4">Create New Channel</h2>
        <input
          placeholder="Enter channel name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
          />
          Private Channel (Password Protected)
        </label>
        {isPrivate && (
          <input
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            Cancel
          </button>
          <button
            onClick={createChannel}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
