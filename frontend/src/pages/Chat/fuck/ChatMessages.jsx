import React from "react";

const ChatMessages = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded ${
              msg.user === 1 ? "bg-blue-100 text-right" : "bg-green-100 text-left"
            }`}
          >
            <div className="text-sm text-gray-700">{msg.message}</div>
            <div className="text-xs text-gray-400">{msg.created}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatMessages;