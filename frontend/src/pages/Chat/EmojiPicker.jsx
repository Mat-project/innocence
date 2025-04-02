import React from "react";
import { motion } from "framer-motion";

export default function EmojiPicker({ onSelect }) {
  const emojis = [
    "😊", "😂", "❤️", "👍", "🎉", "🔥", "😎", "🤔", "😢", "😍",
    "🙏", "👋", "😀", "🤣", "😅", "😇", "🙂", "🙃", "😉", "😌",
    "😋", "😜", "😝", "😏", "👌", "✌️", "🤞", "👏", "🙌", "👀",
    "💪", "🤦‍♂️", "🤷‍♀️", "💯", "⭐", "🔆"
  ];

  return (
    <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-4 w-[90%] max-w-[360px] mx-auto flex flex-col items-center space-y-3">
      {/* Header */}
      <h3 className="text-gray-800 dark:text-gray-200 text-lg sm:text-base font-semibold">
        Pick an Emoji ✨
      </h3>

      {/* Scrollable Emoji Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {emojis.map((emoji, index) => (
          <motion.button
            key={index}
            onClick={() => onSelect(emoji)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center 
              text-lg md:text-xl lg:text-2xl transition-all hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
            aria-label={`Emoji ${emoji}`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
        Tap an emoji to select 🎭
      </p>
    </div>
  );
}
