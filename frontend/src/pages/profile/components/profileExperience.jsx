"use client"

import { Briefcase, GraduationCap, Calendar, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Separator } from "@components/ui/separator"

export default function ProfileExperience({ experience = [], education = [], onEdit, onItemEdit, isPublicView = false }) {
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Present"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
    }).format(date)
  }

  const handleExperienceClick = (exp) => {
    if (onItemEdit && typeof onItemEdit === 'function') {
      onItemEdit('experience', exp);
    }
  };

  const handleEducationClick = (edu) => {
    if (onItemEdit && typeof onItemEdit === 'function') {
      onItemEdit('education', edu);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Experience & Education</CardTitle>
          {!isPublicView && (
            <Button 
              variant="ghost" 
              className="frontend/src/pages/profile/components/profileExperience.jsx"
              size="icon" 
              onClick={() => onEdit && typeof onEdit === 'function' && onEdit('experience')}
            >
              <Edit className="h-4 w-4 bg-white" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Work Experience */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium">Work Experience</h3>
          </div>

          {experience.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No work experience added yet.</p>
          ) : (
            <div className="space-y-4">
              {experience.map((job) => (
                <div 
                  key={job.id} 
                  className="relative pl-5 border-l-2 border-muted pb-4 last:pb-0 hover:bg-muted/20 p-2 rounded cursor-pointer transition-colors"
                  onClick={() => handleExperienceClick(job)}
                >
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{job.title}</h4>
                      {job.current && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {job.company} • {job.location}
                    </p>

                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {formatDate(job.start_date)} - {formatDate(job.end_date)}
                      </span>
                    </div>

                    {job.description && <p className="text-sm mt-1">{job.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Education */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium">Education</h3>
          </div>

          {education.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No education history added yet.</p>
          ) : (
            <div className="space-y-4">
              {education.map((edu) => (
                <div 
                  key={edu.id} 
                  className="relative pl-5 border-l-2 border-muted pb-4 last:pb-0 hover:bg-muted/20 p-2 rounded cursor-pointer transition-colors"
                  onClick={() => handleEducationClick(edu)}
                >
                  <div className="absolute w-3 h-3 bg-green-600 rounded-full -left-[7px] top-1"></div>

                  <div className="space-y-1">
                    <h4 className="font-medium">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>

                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isPublicView && (
          <div className="pt-2 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-1/2" 
              onClick={() => onEdit && typeof onEdit === 'function' && onEdit('experience')}
            >
              Add Experience
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-1/2" 
              onClick={() => onEdit && typeof onEdit === 'function' && onEdit('education')}
            >
              Add Education
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

