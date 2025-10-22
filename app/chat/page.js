"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ChatWindow from "@/components/ChatWindow";
import SettingsModal from "@/components/SettingsModal";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channel");
  const username = searchParams.get("user");

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [text, setText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [channel, setChannel] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load chat + subscribe
  useEffect(() => {
    if (!channelId || !username) {
      router.push("/join");
      return;
    }

    // Fetch channel + messages
    fetchMessages();

    // Setup Supabase Realtime channel with presence
    const chatChannel = supabase.channel(`room-${channelId}`, {
      config: {
        presence: { key: username },
      },
    });

    // Presence: track online users
    chatChannel
      .on("presence", { event: "sync" }, () => {
        const state = chatChannel.presenceState();
        const onlineUsers = Object.keys(state);
        setUsers(onlineUsers);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setUsers((prev) => [...new Set([...prev, key])]);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setUsers((prev) => prev.filter((u) => u !== key));
      });

    // Typing indicator
    chatChannel.on("broadcast", { event: "typing" }, ({ payload }) => {
      const { user, isTyping } = payload;
      if (user === username) return; // ignore self

      if (isTyping) {
        setTypingUsers((prev) => [...new Set([...prev, user])]);
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== user));
        }, 2500);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== user));
      }
    });

    // Messages
    chatChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new?.channel_id === channelId) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await chatChannel.track({ online: true });
          setChannel(chatChannel);
        }
      });

    // Cleanup
    return () => {
      chatChannel.untrack();
      supabase.removeChannel(chatChannel);
    };
  }, [channelId]);

  // Fetch messages
  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  // Typing broadcast
  const sendTyping = () => {
    if (!channel) return;
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { user: username, isTyping: true },
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: { user: username, isTyping: false },
      });
    }, 2000);
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;
    await supabase.from("messages").insert([
      {
        username,
        content: text,
        channel_id: channelId,
      },
    ]);
    setText("");
  };

  const logout = async () => {
    if (channel) await channel.untrack();
    router.push("/join");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-purple-700">sMessage</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
          >
            ⎋ Logout
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto p-6">
            <ChatWindow messages={messages} username={username} />
            {typingUsers.length > 0 && (
              <p className="text-sm italic text-gray-500 mt-2">
                {typingUsers.join(", ")} typing...
              </p>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t flex">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                sendTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 text-white px-5 py-2 rounded-r-lg hover:bg-purple-700"
            >
              Send
            </button>
          </div>
        </div>

        {/* User List */}
        <aside className="w-64 border-l bg-white p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3 text-purple-700">
            Online Users
          </h2>
          <ul className="space-y-1">
            {users.length === 0 ? (
              <p className="text-gray-500 text-sm">No users online</p>
            ) : (
              users.map((u) => (
                <li
                  key={u}
                  className={`p-2 rounded text-gray-800 ${
                    u === username ? "bg-purple-100 font-semibold" : "hover:bg-purple-50"
                  }`}
                >
                  {u}
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
