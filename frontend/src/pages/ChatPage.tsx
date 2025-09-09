// src/pages/ChatPage.tsx
import React, { useState } from "react";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "bot", text: "Привіт! Як я можу допомогти?" },
    { id: 2, sender: "user", text: "Мені цікаві ноутбуки." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now(),
      sender: "user",
      text: newMessage,
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Заголовок */}
      <header className="p-4 bg-blue-600 text-white font-bold text-lg">
        Чат підтримки
      </header>

      {/* Повідомлення */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-xl max-w-xs ${
              msg.sender === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-300 text-black mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Інпут */}
      <footer className="p-4 bg-white flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg p-2"
          placeholder="Напишіть повідомлення..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Відправити
        </button>
      </footer>
    </div>
  );
};

export default ChatPage;
