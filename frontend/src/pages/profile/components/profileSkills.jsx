import { Code, Brain, Edit, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Separator } from "@components/ui/separator"
import { toast } from "sonner"

export default function ProfileSkills({ skills = [], onEdit, onItemEdit, onDeleteSkill }) {
  // Group skills by category
  const technicalSkills = skills.filter((skill) => skill.category === "technical")
  const softSkills = skills.filter((skill) => skill.category === "soft")

  const handleDeleteSkill = (e, skill) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    // If onDeleteSkill prop is provided, call it, otherwise use onItemEdit to open modal
    if (onDeleteSkill) {
      const skillName = typeof skill.name === 'string' ? skill.name : 'selected skill';
      
      onDeleteSkill(skill.id)
        .then(() => {
          // Make sure we're using a string for the toast message
          toast.success(`Skill "${skillName}" deleted successfully`);
        })
        .catch((error) => {
          console.error("Error deleting skill:", error);
          toast.error("Failed to delete skill");
        });
    } else if (onItemEdit) {
      onItemEdit(skill); // Fallback to edit modal where user can delete
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Skills & Expertise</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onEdit()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No skills added yet. Add your skills to showcase your expertise.
          </p>
        ) : (
          <>
            {technicalSkills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium">Technical Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technicalSkills.map((skill) => (
                    <Badge 
                      key={skill.id} 
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>{skill.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 rounded-full hover:bg-destructive/20"
                        onClick={(e) => handleDeleteSkill(e, skill)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Delete {skill.name}</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {technicalSkills.length > 0 && softSkills.length > 0 && <Separator />}

            {softSkills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-medium">Soft Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill) => (
                    <Badge 
                      key={skill.id} 
                      variant="outline"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>{skill.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 rounded-full hover:bg-destructive/20"
                        onClick={(e) => handleDeleteSkill(e, skill)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Delete {skill.name}</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Separator />

        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
            {skills.length > 0 ? "Manage Skills" : "Add Skills"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

