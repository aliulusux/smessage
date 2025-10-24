import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

// DB helpers
export async function listChannels() {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createChannel({ name, is_private, hashed_password }) {
  const { data, error } = await supabase
    .from("channels")
    .insert({ name, is_private, hashed_password: hashed_password || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getChannelById(id) {
  const { data, error } = await supabase.from("channels").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function listMessages(channel_id, limit = 200) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channel_id)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function sendMessage({ channel_id, sender, body }) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ channel_id, sender, body, status: "delivered" }])
    .select();

  if (error) console.error("SendMessage error:", error);
  return data?.[0];
}

    // insert to supabase
    const { data, error } = await supabase
      .from("messages")
      .insert([{ channel_id, sender, body, status: "delivered" }])
      .select()
      .single();

    if (error) throw error;

    return { ...data, tempId };
  } catch (err) {
    console.error("sendMessage error:", err);
    return null;
  }
}

// realtime table subscription
export function subscribeMessages(channelId, onMessage) {
  const channel = supabase
    .channel(`realtime:messages:${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ✅ Presence Channel: handles join/leave + typing signals
export function presenceChannel(channelId, username) {
  const channel = supabase.channel(channelId, {
    config: {
      presence: {
        key: username,
      },
    },
  });

  // Join the presence channel
  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({
        username,
        last_active: new Date().toISOString(),
      });
    }
  });

  // Auto-remove on close/unload (ensures ghost users disappear)
  const cleanup = () => {
    channel.untrack();
    supabase.removeChannel(channel);
  };
  window.addEventListener("beforeunload", cleanup);
  window.addEventListener("pagehide", cleanup);

  // Return the channel object (so Chat.jsx can attach handlers)
  return channel;
}
