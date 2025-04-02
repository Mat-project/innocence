import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useSkills } from '../../profile/hooks/useProfileSections'; // add this import

export default function AddSectionModal({ 
  sectionType,    // "skills", "experience", "education", "portfolio"
  initialData = {}, 
  onCancel, 
  onSave,
  onDelete  // Add this prop to handle delete operations
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const skillsFunctions = sectionType === "skills" ? useSkills() : null; // initialize hook for skills

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (field, e) => {
    if (e.target.files && e.target.files[0]) {
      handleChange(field, e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    switch(sectionType) {
      case 'skills':
        if (!formData.name?.trim()) {
          newErrors.name = "Skill name is required";
          isValid = false;
        }
        if (!formData.category) {
          newErrors.category = "Category is required";
          isValid = false;
        }
        if (!formData.proficiency) {
          newErrors.proficiency = "Proficiency level is required";
          isValid = false;
        }
        break;
      case 'experience':
        if (!formData.title?.trim()) {
          newErrors.title = "Job title is required";
          isValid = false;
        }
        if (!formData.company?.trim()) {
          newErrors.company = "Company name is required";
          isValid = false;
        }
        if (!formData.start_date) {
          newErrors.start_date = "Start date is required";
          isValid = false;
        } else {
          // Validate date format for start_date
          try {
            const date = new Date(formData.start_date);
            if (isNaN(date.getTime()) || date.getFullYear() > 9999) {
              newErrors.start_date = "Please enter a valid date";
              isValid = false;
            }
          } catch (e) {
            newErrors.start_date = "Invalid date format";
            isValid = false;
          }
        }
        if (formData.end_date && !formData.current) {
          // Validate date format for end_date if provided
          try {
            const date = new Date(formData.end_date);
            if (isNaN(date.getTime()) || date.getFullYear() > 9999) {
              newErrors.end_date = "Please enter a valid date";
              isValid = false;
            }
          } catch (e) {
            newErrors.end_date = "Invalid date format";
            isValid = false;
          }
        }
        break;
      case 'education':
        if (!formData.degree?.trim()) {
          newErrors.degree = "Degree is required";
          isValid = false;
        }
        if (!formData.institution?.trim()) {
          newErrors.institution = "Institution is required";
          isValid = false;
        }
        if (!formData.start_date) {
          newErrors.start_date = "Start date is required";
          isValid = false;
        } else {
          // Validate date format for start_date
          try {
            const date = new Date(formData.start_date);
            if (isNaN(date.getTime()) || date.getFullYear() > 9999) {
              newErrors.start_date = "Please enter a valid date";
              isValid = false;
            }
          } catch (e) {
            newErrors.start_date = "Invalid date format";
            isValid = false;
          }
        }
        if (formData.end_date) {
          // Validate date format for end_date if provided
          try {
            const date = new Date(formData.end_date);
            if (isNaN(date.getTime()) || date.getFullYear() > 9999) {
              newErrors.end_date = "Please enter a valid date";
              isValid = false;
            }
          } catch (e) {
            newErrors.end_date = "Invalid date format";
            isValid = false;
          }
        }
        break;
      case 'portfolio':
        if (!formData.title?.trim()) {
          newErrors.title = "Project title is required";
          isValid = false;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Ensure dates are formatted correctly
      const formattedData = { ...formData };
      
      // Format dates into YYYY-MM-DD
      if (formattedData.start_date) {
        try {
          const date = new Date(formattedData.start_date);
          if (!isNaN(date.getTime())) {
            formattedData.start_date = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error("Error formatting start date:", e);
        }
      }
      
      if (formattedData.end_date && !formattedData.current) {
        try {
          const date = new Date(formattedData.end_date);
          if (!isNaN(date.getTime())) {
            formattedData.end_date = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error("Error formatting end date:", e);
        }
      }
      
      // Set end_date to null if current is true
      if (formattedData.current) {
        formattedData.end_date = null;
      }
      
      // Ensure ID is preserved for updates
      if (initialData && initialData.id) {
        formattedData.id = initialData.id;
      }
      
      console.log("Submitting data:", formattedData);
      handleSectionSave(formattedData);
    }
  };

  const handleSectionSave = async (data) => {
    if (sectionType === "skills" && skillsFunctions) {
      // For skills, use dedicated addSkill/updateSkill calls
      if (data.id) {
        // If editing, call updateSkill (if you need update at all)
        const success = await skillsFunctions.updateSkill(data.id, data);
        if (success) {
          onSave && onSave(data);
        }
      } else {
        // For adding new skill, use addSkill
        const success = await skillsFunctions.addSkill(data);
        if (success) {
          onSave && onSave(data);
        }
      }
      return;
    }
    // ...existing save logic for other sections...
    onSave(data);
  };

  const handleDelete = () => {
    if (initialData && initialData.id && onDelete) {
      onDelete(initialData.id);
    }
  };

  const renderFormFields = () => {
    switch (sectionType) {
      case "skills":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="skillName">Skill Name <span className="text-red-500">*</span></Label>
              <Input
                id="skillName"
                placeholder="Enter skill name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2 mt-4 elative z-30">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.category || ""} 
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="z-50">
                  <SelectItem value="technical">Technical Skill</SelectItem>
                  <SelectItem value="soft">Soft Skill</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="proficiency">Proficiency (1-10) <span className="text-red-500">*</span></Label>
              <Input
                id="proficiency"
                type="number"
                placeholder="Enter level"
                min="1"
                max="10"
                value={formData.proficiency || ""}
                onChange={(e) => handleChange("proficiency", Number(e.target.value))}
                className={errors.proficiency ? "border-red-500" : ""}
              />
              {errors.proficiency && <p className="text-red-500 text-xs mt-1">{errors.proficiency}</p>}
            </div>
          </>
        );
      case "experience":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
              <Input
                id="jobTitle"
                placeholder="Enter job title"
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
              <Input
                id="company"
                placeholder="Enter company name"
                value={formData.company || ""}
                onChange={(e) => handleChange("company", e.target.value)}
                className={errors.company ? "border-red-500" : ""}
              />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location"
                value={formData.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className={errors.start_date ? "border-red-500" : ""}
                />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  disabled={formData.current}
                  value={formData.end_date || ""}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input
                id="currentJob"
                type="checkbox"
                className="h-4 w-4 mr-2"
                checked={formData.current || false}
                onChange={(e) => {
                  const isCurrent = e.target.checked;
                  handleChange("current", isCurrent);
                  if (isCurrent) {
                    handleChange("end_date", null);
                  }
                }}
              />
              <Label htmlFor="currentJob" className="text-sm">I currently work here</Label>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="w-full min-h-[100px]"
                placeholder="Enter description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </>
        );
      case "education":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution <span className="text-red-500">*</span></Label>
              <Input
                id="institution"
                placeholder="Enter institution name"
                value={formData.institution || ""}
                onChange={(e) => handleChange("institution", e.target.value)}
                className={errors.institution ? "border-red-500" : ""}
              />
              {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="degree">Degree <span className="text-red-500">*</span></Label>
              <Input
                id="degree"
                placeholder="Enter degree"
                value={formData.degree || ""}
                onChange={(e) => handleChange("degree", e.target.value)}
                className={errors.degree ? "border-red-500" : ""}
              />
              {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree}</p>}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                placeholder="Enter field of study"
                value={formData.field || ""}
                onChange={(e) => handleChange("field", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="eduStartDate">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="eduStartDate"
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className={errors.start_date ? "border-red-500" : ""}
                />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="eduEndDate">End Date</Label>
                <Input
                  id="eduEndDate"
                  type="date"
                  value={formData.end_date || ""}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="eduDescription">Description</Label>
              <Textarea
                id="eduDescription"
                className="w-full min-h-[100px]"
                placeholder="Enter description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </>
        );
      case "portfolio":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="projectTitle">Project Title <span className="text-red-500">*</span></Label>
              <Input
                id="projectTitle"
                placeholder="Enter project title"
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea
                id="projectDescription"
                className="w-full min-h-[100px]"
                placeholder="Enter project description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="projectLink">Project Link</Label>
              <Input
                id="projectLink"
                type="url"
                placeholder="https://"
                value={formData.project_link || ""}
                onChange={(e) => handleChange("project_link", e.target.value)}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="projectImage">Project Image</Label>
              <Input
                id="projectImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("imageFile", e)}
              />
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="technologies">Technologies (comma separated)</Label>
              <Input
                id="technologies"
                placeholder="React, Node.js, MongoDB"
                value={formData.technologies?.join(", ") || ""}
                onChange={(e) =>
                  handleChange(
                    "technologies",
                    e.target.value.split(",").map(tech => tech.trim()).filter(Boolean)
                  )
                }
              />
            </div>
          </>
        );
      default:
        return <p>No form available for this section.</p>;
    }
  };

  const getSectionTitle = () => {
    switch(sectionType) {
      case "skills": return editingItem ? "Edit Skill" : "Add Skill";
      case "experience": return editingItem ? "Edit Work Experience" : "Add Work Experience";
      case "education": return editingItem ? "Edit Education" : "Add Education";
      case "portfolio": return editingItem ? "Edit Portfolio Project" : "Add Portfolio Project";
      default: return "Add Section";
    }
  };

  const editingItem = Object.keys(initialData).length > 0;
  const isEditing = initialData && initialData.id;

  // Add a guard so that if the section is 'skills', this modal does not do any work
  if (sectionType === "skills") {
    // Skills are handled exclusively via SkillEditModal
    return null;
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {renderFormFields()}
        <DialogFooter className="pt-6 border-t sm:justify-between flex-col sm:flex-row gap-3">
          <div className="flex space-x-2 w-full sm:w-auto justify-start">
            {isEditing && onDelete && (
              <Button 
                variant="destructive" 
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="transition-all duration-200 hover:bg-destructive/90"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onCancel}
              className="transition-all duration-200 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="transition-all duration-200 hover:bg-primary/90"
            >
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </form>

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 border-gray-200 dark:border-slate-800 dark:bg-slate-950">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {sectionType.slice(0, -1)}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setConfirmDelete(false)}
                className="transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDelete();
                  setConfirmDelete(false);
                }}
                className="transition-all duration-200"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}