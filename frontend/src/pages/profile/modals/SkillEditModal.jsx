import React, { useState, useEffect } from "react";
import { SectionDialog } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useSkills } from "../../../pages/profile/hooks/useProfileSections"; // dedicated skills hook

export default function SkillEditModal({ isOpen, onOpenChange, initialData = {}, onDelete }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "technical",
    level: "Beginner",
    ...initialData,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        category: "technical",
        level: "Beginner",
        ...initialData,
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const { addSkill, updateSkill } = useSkills(); // use dedicated functions

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

    if (initialData.id) {
      // Editing existing skill using correct endpoint:
      const success = await updateSkill(initialData.id, formData);
      if (success) onOpenChange(false);
    } else {
      // Adding a new skill via dedicated addSkill endpoint:
      const success = await addSkill(formData);
      if (success) onOpenChange(false);
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
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Select
              value={formData.category || "technical"}
              onValueChange={(value) => handleChange("category", value)}
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
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" onClick={() => onDelete(initialData.id)}>
                Delete
              </Button>
            )}
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </SectionDialog>
  );
}
