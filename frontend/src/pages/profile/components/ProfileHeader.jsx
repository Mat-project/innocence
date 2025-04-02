import React, { useState } from "react";
import { Edit, MessageSquare, Share2, Bell, BellOff } from "lucide-react";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { ThemeToggle } from "@components/ui/ThemeToggle";
import { useTheme } from "../../../providers/ThemeProvider";

// Assuming baseUrl is available from environment variables:
const baseUrl = import.meta.env.VITE_API_URL || '';

export default function ProfileHeader({ 
  user, 
  profileCompletion, 
  onCoverEdit, 
  onAvatarEdit, 
  onProfileEdit,
  isPublicView = false 
}) {
  const [following, setFollowing] = useState(false);
  const [notifications, setNotifications] = useState(false);

  // Ensure user object exists to prevent errors
  const safeUser = user || {};

  // Construct cover and profile image URLs; if relative, prepend baseUrl.
  const getUrl = (img) => {
    if (!img) return "";
    return img.startsWith("http") ? img : `${baseUrl}${img}`;
  };

  const coverUrl = getUrl(safeUser.cover_image);
  const profileUrl = getUrl(safeUser.profile_image);

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative bg-background rounded-b-xl shadow-sm overflow-hidden">
      {/* Cover Image */}
      <div
        className="relative h-48 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverUrl || "/placeholder.svg?height=600&width=1200"})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        <div className="absolute top-4 right-4 flex space-x-2">
          {/* Only show edit button if not in public view */}
          {!isPublicView && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onCoverEdit}
                    size="icon"
                    variant="ghost"
                    className="bg-background/80 hover:bg-background/90 text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Cover Image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 sm:px-6 pb-6 -mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                <AvatarImage src={profileUrl || "/placeholder.svg?height=200&width=200"} alt={safeUser.full_name || "User"} />
                <AvatarFallback className="text-2xl">{getInitials(safeUser.full_name)}</AvatarFallback>
              </Avatar>

              {/* Only show avatar edit button if not in public view */}
              {!isPublicView && (
                <Button
                  onClick={onAvatarEdit}
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full shadow"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Name and Basic Info */}
            <div className="text-center sm:text-left pt-2 sm:pt-0 sm:pb-1">
              <h1 className="text-2xl font-bold text-foreground">{safeUser.full_name || "User"}</h1>
              <p className="text-muted-foreground">@{safeUser.username || "username"}</p>
              {safeUser.tagline && <p className="text-sm text-muted-foreground mt-1 italic">{safeUser.tagline}</p>}
              <div className="flex items-center justify-center sm:justify-start mt-2 space-x-2">
                {safeUser.location && (
                  <Badge variant="outline" className="text-xs">
                    {safeUser.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap mt-4 sm:mt-0 gap-2 justify-center sm:justify-end">
            {/* Show different actions based on view type */}
            {isPublicView ? (
              <>
                {/* Public profile actions */}
                <Button
                  variant={following ? "secondary" : "default"}
                  size="sm"
                  className="flex items-center"
                  onClick={() => setFollowing(!following)}
                >
                  {following ? "Following" : "Follow"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => setNotifications(!notifications)}
                >
                  {notifications ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </Button>

                <Button variant="outline" size="icon" className="flex items-center">
                  <Share2 className="h-4 w-4" />
                </Button>

                <Button variant="default" size="sm" className="flex items-center">
                  <MessageSquare className="mr-1 h-4 w-4" /> Message
                </Button>
              </>
            ) : (
              /* Owner profile actions */
              <Button variant="outline" size="sm" className="flex items-center" onClick={onProfileEdit}>
                <Edit className="mr-1 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Completion - Only show on personal profile */}
        {!isPublicView && (
          <div className="mt-6 bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-muted-foreground">Profile Completion</h2>
              <span className="text-sm font-medium">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2 bg-amber-800" />
            <p className="mt-2 text-xs text-muted-foreground">
              Complete your profile to improve visibility and networking opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

