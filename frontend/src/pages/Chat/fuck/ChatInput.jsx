import React, { useState } from "react";

const ChatInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <div className="flex">
      <input
        type="text"
        className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={() => {
          onSendMessage(text);
          setText("");
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;