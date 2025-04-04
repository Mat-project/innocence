import React, { useState, useEffect } from "react";
import { SectionDialog } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useSkills } from "../../../pages/profile/hooks/useProfileSections"; 
import { toast } from "sonner";

export default function SkillEditModal({ isOpen, onOpenChange, initialData = {}, onDelete }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "technical",
    level: "Beginner",
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the useSkills hook directly in the component
  const { addSkill, updateSkill, deleteSkill, fetchSkills } = useSkills();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        category: "technical",
        level: "Beginner",
        ...initialData,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Skill name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.level) {
      newErrors.level = "Proficiency level is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (initialData.id) {
        // Update existing skill
        console.log("Updating skill with ID:", initialData.id);
        const success = await updateSkill(initialData.id, {
          name: formData.name,
          category: formData.category,
          level: formData.level
        });
        
        if (success) {
          onOpenChange(false);
          // Refresh the skills list
          await fetchSkills();
          if (typeof onSave === 'function') onSave();
        }
      } else {
        // Add new skill
        console.log("Adding new skill", formData);
        const success = await addSkill({
          name: formData.name,
          category: formData.category,
          level: formData.level
        });
        
        if (success) {
          onOpenChange(false);
          // Refresh the skills list
          await fetchSkills();
          if (typeof onSave === 'function') onSave();
        }
      }
    } catch (error) {
      console.error("Error saving skill:", error);
      toast.error("Failed to save skill: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData.id) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteSkill(initialData.id);
      if (success) {
        onOpenChange(false);
        // Refresh the skills list
        await fetchSkills();
        if (typeof onDelete === 'function') onDelete(initialData.id);
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData.id);

  return (
    <SectionDialog isOpen={isOpen} onOpenChange={onOpenChange} sectionType="skill">
      <div className="p-6">
        <h2 className="text-lg font-bold mb-4">{isEditing ? "Edit Skill" : "Add Skill"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="skillName">Skill Name <span className="text-red-500">*</span></Label>
            <Input
              id="skillName"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter skill name"
              className={errors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Select
              value={formData.category || "technical"}
              onValueChange={(value) => handleChange("category", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Skill</SelectItem>
                <SelectItem value="soft">Soft Skill</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="level">Proficiency Level <span className="text-red-500">*</span></Label>
            <Select
              value={formData.level || "Beginner"}
              onValueChange={(value) => handleChange("level", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between pt-4">
            {isEditing && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            )}
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update" : "Save")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </SectionDialog>
  );
}
