import { format } from "date-fns"
import { Check, CheckCheck } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useState, useEffect } from "react"

export default function ChatMessage({ message, showAvatar = true }) {
  const { user } = useAuth()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [localUserId, setLocalUserId] = useState(null)

    // Get userId from localStorage if user object is not available
    useEffect(() => {
      if (!user || !user.id) {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          setLocalUserId(storedUserId);
        }
      }
    }, [user]);  

  // Wait for user to be loaded before determining if message is own
  const isOwnMessage = message.sender?.id === 1;
  
  // For debugging
/*   useEffect(() => {
    console.log("Message from:", message.sender?.name, "ID:", message.sender?.id);
    console.log("Is own message:", isOwnMessage);
  }, [message, user]); */

  // Format the timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ""
    return format(date, "h:mm a")
  }

  // Check if message has an attachment and if it's an image
  const hasAttachment = message.attachment || message.file
  const isImage = hasAttachment && 
    (message.attachment?.type?.startsWith('image/') || 
     message.file?.type?.startsWith('image/') ||
     message.attachment?.url?.match(/\.(jpeg|jpg|gif|png)$/) ||
     message.file?.url?.match(/\.(jpeg|jpg|gif|png)$/))
  
  // Get the file URL
  const fileUrl = message.attachment?.url || message.file?.url || ''
  
  // Get file name
  const fileName = message.attachment?.name || message.file?.name || 
    (fileUrl ? fileUrl.split('/').pop() : 'File')

  return (
    <div className={`flex my-0.5 text-xs lg:text-lg md:text-sm ${isOwnMessage ? "justify-end" : "justify-start"} group`}>
      {/* Avatar for non-own messages */}
      {!isOwnMessage && showAvatar ? (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1 mr-1">
          {message.sender.avatar ? (
            <img 
              src={message.sender.avatar} 
              alt={message.sender.name || "User"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-medium">
              {(message.sender.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ) : (!isOwnMessage && (
        <div className="w-8 h-8 flex-shrink-0 mr-1"></div>
      ))}
      
      <div className={`relative max-w-[75%] min-w-[80px]`}>
        {/* Sender name for non-own messages */}
        {!isOwnMessage && showAvatar && (
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-2 mb-0.5">
            {message.sender.name || "User"}
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`px-3 py-2 rounded-lg relative
            ${
              isOwnMessage
                ? "bg-emerald-100 dark:bg-emerald-800 text-gray-800 dark:text-gray-100 rounded-tr-none"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm"
            } ${hasAttachment ? 'overflow-hidden' : ''}`}
        >
          {/* Image attachment */}
          {isImage && (
            <div className="mb-2">
              <div className={`relative rounded overflow-hidden ${imageLoaded ? '' : 'bg-gray-200 dark:bg-gray-600 animate-pulse'}`} style={{ maxWidth: '250px' }}>
                <img 
                  src={fileUrl} 
                  alt={fileName}
                  className="max-w-full rounded"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>
          )}
          
          {/* File attachment (non-image) */}
          {hasAttachment && !isImage && (
            <div className="flex items-center mb-2 p-2 bg-gray-50 dark:bg-gray-600 rounded">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-700 rounded-full flex items-center justify-center mr-2">
                <svg 
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">{fileName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {message.attachment?.size || message.file?.size 
                    ? `${Math.round((message.attachment?.size || message.file?.size) / 1024)} KB` 
                    : "Download"}
                </div>
              </div>
            </div>
          )}

          {/* Message content */}
          {message.content && <div className="whitespace-pre-wrap break-words">{message.content}</div>}

          {/* Time and read status */}
          <div className="ml-2 inline-flex items-center text-[11px] text-gray-500 dark:text-gray-400 absolute bottom-1 right-3">
            <span>{formatMessageTime(message.created_at)}</span>
            {isOwnMessage && (
              <span className="ml-1 inline-flex items-center">
                {message.read_by && message.read_by.length > 0 ? (
                  <CheckCheck size={14} className="text-blue-500" />
                ) : (
                  <Check size={14} />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Message tail */}
        <div
          className={`absolute top-0 w-4 h-4 overflow-hidden
            ${isOwnMessage ? "right-0 -mr-2" : "left-0 -ml-2"} ${!isOwnMessage && !showAvatar ? "hidden" : ""}`}
        >
          <div
            className={`absolute transform rotate-45 w-2 h-2 
              ${
                isOwnMessage
                  ? "bg-emerald-100 dark:bg-emerald-800 -bottom-1 -right-1"
                  : "bg-white dark:bg-gray-700 -bottom-1 -left-1"
              }`}
          ></div>
        </div>
      </div>
    </div>
  )
}