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
    .insert({ channel_id, sender, body })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// realtime table subscription
export function subscribeMessages(channel_id, onInsert) {
  const channel = supabase.channel(`messages:${channel_id}`);
  channel.on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channel_id}` },
    payload => onInsert(payload.new)
  ).subscribe();
  return () => supabase.removeChannel(channel);
}

// Presence (no DB rows)
export function presenceChannel(room, user) {
  const ch = supabase.channel(`presence:${room}`, { config: { presence: { key: user } } });

  ch.on("presence", { event: "sync" }, () => {
    /* noop; consumer reads via ch.presenceState() */
  });

  ch.on("broadcast", { event: "typing" }, ({ payload }) => {
    /* consumer handles in component by binding onBroadcast */
  });

  ch.subscribe(async (status) => {
    if (status === "SUBSCRIBED") await ch.track({ online_at: new Date().toISOString() });
  });

  return ch;
}
