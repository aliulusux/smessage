"use client";

export default function ChatWindow({ messages, username }) {
  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.username === username ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-2xl max-w-[70%] shadow ${
              msg.username === username
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <p className="text-sm font-semibold">{msg.username}</p>
            <p>{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
