import { ArrowLeft, MoreVertical, Search, Phone, Video, X } from 'lucide-react'
import { useState } from 'react'

export default function ChatHeader({ conversation, onBack, isMobile = false }) {
  const [showOptions, setShowOptions] = useState(false)

  if (!conversation) return null

  const recipient = conversation.participants?.find(p => !p.is_current_user) || {}
  const isOnline = recipient.is_online
  const lastSeen = recipient.last_seen

  // Format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen recently"
    
    const now = new Date()
    const lastSeenDate = new Date(timestamp)
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))
    
    if (diffMinutes < 1) return "Online now"
    if (diffMinutes < 60) return `Last seen ${diffMinutes} min ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return "Last seen recently"
  }

  return (
    <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center shadow-sm">
      {isMobile && (
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2 text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
        {recipient.avatar ? (
          <img 
            src={recipient.avatar} 
            alt={recipient.name || "User"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-medium">
            {(recipient.name || "U").charAt(0).toUpperCase()}
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        )}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-base sm:text-lg text-gray-900 dark:text-white truncate">
          {recipient.name || conversation.name || "Chat"}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
          {isOnline ? "Online" : formatLastSeen(lastSeen)}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-1">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Video size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Phone size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Search size={20} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 w-40 sm:w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
              <ul>
                <li>
                  <button className="w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center">
                    View Profile
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center">
                    Mute Notifications
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center">
                    Block User
                  </button>
                </li>
              </ul>
              <button
                onClick={() => setShowOptions(false)}
                className="absolute top-1 right-1 p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


