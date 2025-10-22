"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CreateChannelPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Please enter a username.");
    if (!name.trim()) return alert("Please enter a channel name.");

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("channels")
        .insert([
          {
            name,
            is_private: isPrivate,
            password: isPrivate ? password || null : null,
          },
        ])
        .select("id")
        .single();

      if (error) throw error;

      // Go straight to chat in the new channel
      router.push(`/chat?channel=${data.id}&user=${encodeURIComponent(username)}`);
    } catch (err) {
      console.error(err);
      alert("Could not create channel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 to-pink-100">
      <form
        onSubmit={handleCreate}
        className="w-[520px] bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-2 text-purple-700">
          Create a Channel
        </h1>
        <p className="text-center mb-6 text-gray-600">
          Pick a name, choose privacy, and jump in.
        </p>

        {/* Username (who will enter after create) */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Username
        </label>
        <input
          type="text"
          placeholder="e.g. ali_ulusu"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* Channel name */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Channel Name
        </label>
        <input
          type="text"
          placeholder="e.g. general, tech-talk"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* Privacy */}
        <label className="flex items-center gap-2 mb-3 select-none">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate((v) => !v)}
          />
          Private channel (password-protected)
        </label>

        {isPrivate && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-purple-400"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Channel & Enter Chat"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/join")}
          className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
        >
          Back to Join
        </button>
      </form>
    </div>
  );
}
