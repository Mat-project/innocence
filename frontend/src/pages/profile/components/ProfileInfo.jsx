import React from "react";
import { Edit, Mail, Phone, Globe, Linkedin, Github, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";

function InfoRow({ icon, text, label, link, copyable }) {
  // Don't render empty rows
  if (!text || text === "Not specified" || text === "No phone number" || text === "No email provided") {
    return null;
  }
  
  const content = link ? (
    <a 
      href={link}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center text-sm hover:underline text-primary hover:text-primary/80 transition-colors"
    >
      {text} <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  ) : (
    <span className="text-sm">{text}</span>
  );
  
  return (
    <div className="flex items-center space-x-2 group">
      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        {content}
      </div>
      {copyable && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => navigator.clipboard.writeText(text)}
        >
          <span className="sr-only">Copy {label}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16V4a2 2 0 0 1 2-2h10"/></svg>
        </Button>
      )}
    </div>
  );
}

export default function ProfileInfo({ bio, email, phone, country, location, linkedin, github, onEdit, isPublicView = false }) {
  // Format links properly if they don't include protocol
  const formatLink = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `https://${url}`;
  };
  
  // Format LinkedIn URL
  const linkedinUrl = formatLink(linkedin);
  // Format GitHub URL
  const githubUrl = formatLink(github);
  
  const hasContactInfo = email || phone || country || location || linkedin || github;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">About Me</CardTitle>
          {!isPublicView && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit && typeof onEdit === 'function' && onEdit()}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Bio section */}
        <div>
          {bio ? (
            <p className="text-sm leading-relaxed">{bio}</p>
          ) : (
            <div className="bg-muted/30 rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground italic">No bio available yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Tell others about yourself by adding a bio.</p>
            </div>
          )}
        </div>

        {/* Only show separator if there's a bio and contact info */}
        {bio && hasContactInfo && <Separator />}
        
        {/* Contact Information */}
        {hasContactInfo ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="space-y-3">
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                text={email}
                label="Email"
                copyable={true}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                text={phone}
                label="Phone"
                copyable={true}
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                text={location}
                label="Location"
              />
              <InfoRow
                icon={<Globe className="h-4 w-4" />}
                text={country}
                label="Country"
              />
              <InfoRow
                icon={<Linkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                text="LinkedIn Profile"
                label="LinkedIn"
                link={linkedinUrl}
              />
              <InfoRow
                icon={<Github className="h-4 w-4" />}
                text="GitHub Profile"
                label="GitHub"
                link={githubUrl}
              />
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground italic">No contact information available yet.</p>
          </div>
        )}

        {!isPublicView && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2" 
            onClick={() => onEdit && typeof onEdit === 'function' && onEdit()}
          >
            {hasContactInfo ? "Edit Contact Info" : "Add Contact Info"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}