import React from "react";
import { Edit } from "lucide-react";
import { Button } from "../../../component/ui/button";
import { Progress } from "../../../component/ui/progress";

export default function ProfileHeader({
  name,
  username,
  profileImage,
  profileCompletion,
  onCoverEdit,
  onAvatarEdit,
  onProfileEdit,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Cover Section */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white"
          onClick={onCoverEdit} // or combine with onProfileEdit if desired
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Cover</span>
        </Button>
      </div>
      {/* Avatar & Basic Info */}
      <div className="px-4 pb-5 pt-0 sm:px-6">
        <div className="flex items-end -mt-12 sm:flex-row sm:space-x-5 sm:items-center">
          <div className="relative h-24 w-24 rounded-full ring-4 ring-white dark:ring-gray-800 overflow-hidden bg-gray-200">
            <img
              src={profileImage || "/placeholder.svg"}
              alt={name}
              width={96}
              height={96}
              className="h-24 w-24 object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-0 right-0 h-6 w-6 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
              onClick={onAvatarEdit}
            >
              <Edit className="h-3 w-3" />
              <span className="sr-only">Change Profile Picture</span>
            </Button>
          </div>
          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:pb-1">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
            </div>
            {/* Top-right Edit button for media editing */}
            <Button
              variant="outline"
              size="sm"
              onClick={onProfileEdit}
              className="hidden sm:flex"
            >
              <Edit className="mr-1 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>
        {/* Profile Completion */}
        <div className="mt-6 grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Complete your profile</h2>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A complete profile helps you stand out for job applications
          </p>
        </div>
      </div>
    </div>
  );
}
