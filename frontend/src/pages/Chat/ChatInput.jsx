import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Image, FileText, Video, Mic } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import EmojiPicker from "./EmojiPicker";

export default function ChatInput({ chatId }) {
  // Fallback to empty functions if useChat() returns undefined
  const chatContext = useChat() || {};
  const { sendMessage = async () => {}, sendTypingIndicator = () => {} } = chatContext;
  
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message, chatId]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [chatId]);

  // Hide popovers on clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker && !e.target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
      if (
        showAttachmentOptions &&
        !e.target.closest(".attachment-options-container") &&
        !e.target.closest(".attach-btn")
      ) {
        setShowAttachmentOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker, showAttachmentOptions]);

  // Typing indicator debouncing
  useEffect(() => {
    if (!chatId) return;
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      if (sendTypingIndicator) sendTypingIndicator(chatId, true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        if (sendTypingIndicator) sendTypingIndicator(chatId, false);
      }
    }, 800);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [message, chatId, isTyping, sendTypingIndicator]);

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      setShowAttachmentOptions(false);
      textareaRef.current?.focus();
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !attachment) || !chatId || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(chatId, message, attachment);
      setMessage("");
      setAttachment(null);
      setShowEmojiPicker(false);
      setShowAttachmentOptions(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-3 bg-transparent">
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-3 flex items-center bg-gray-100 dark:bg-gray-800 border rounded-lg p-2 shadow-sm">
          <div className="w-10 h-10 flex-shrink-0 mr-2">
            {attachment.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(attachment)}
                alt="attachment"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg text-gray-600">
                {attachment.type.startsWith("video/") ? (
                  <Video size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              {attachment.name}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {Math.round(attachment.size / 1024)} KB
            </p>
          </div>
          <button
            onClick={removeAttachment}
            className="ml-2 p-1 text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Card with reduced size */}
      <div className="max-w-full sm:max-w-full mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type here..."
          className="w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none text-sm p-1"
          rows={2}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Smile size={20} className="text-yellow-500" />
            </button>
            {/* Wrap paperclip button in a relative container */}
            <div className="relative inline-block">
              <button
                onClick={() => setShowAttachmentOptions((prev) => !prev)}
                className="attach-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Paperclip size={20} className="text-blue-500" />
              </button>
              {showAttachmentOptions && (
                <div className="absolute bottom-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 sm:p-3 grid grid-cols-3 gap-1 sm:gap-2 w-40 sm:w-48">
                  <button
                    onClick={() => {
                      fileInputRef.current.accept = "image/*";
                      fileInputRef.current.click();
                    }}
                    className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center mb-1">
                      <Image size={20} className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current.accept = ".pdf,.doc,.docx";
                      fileInputRef.current.click();
                    }}
                    className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 dark:bg-green-900 rounded-full flex items-center justify-center mb-1">
                      <FileText size={20} className="text-green-600 dark:text-green-300" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">Doc</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current.accept = "video/*";
                      fileInputRef.current.click();
                    }}
                    className="flex flex-col items-center p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 dark:bg-red-900 rounded-full flex items-center justify-center mb-1">
                      <Video size={20} className="text-red-600 dark:text-red-300" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">Video</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAttachmentChange} className="hidden" />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={isSending || (!message.trim() && !attachment)}
            className="flex items-center justify-center p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors text-white shadow-sm"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-t-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-24 right-8 z-50 emoji-picker-container">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
}