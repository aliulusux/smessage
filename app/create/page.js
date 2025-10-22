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
      router.push(`/chat?channel=${dat
