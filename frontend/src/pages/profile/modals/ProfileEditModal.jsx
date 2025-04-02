import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { X, Plus, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { profileAPI } from "../../../service/api"; // Ensure this import exists

export default function ProfileEditModal({ isOpen, type, initialData, userData, onClose, onSave }) {
  const [formData, setFormData] = useState(initialData || {});
  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState({});
  
  // Section-specific state
  const [skillsList, setSkillsList] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: "", category: "technical", level: "Beginner" });
  const [experienceList, setExperienceList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [newExperience, setNewExperience] = useState({ title: "", company: "", location: "", start_date: "", end_date: "", current: false, description: "" });
  const [newEducation, setNewEducation] = useState({ institution: "", degree: "", field: "", start_date: "", end_date: "", description: "" });
  const [portfolioList, setPortfolioList] = useState([]);
  // Note: use key "project_link" instead of "url"
  const [newPortfolio, setNewPortfolio] = useState({ title: "", description: "", project_link: "", technologies: [] });
  const [newTechnology, setNewTechnology] = useState("");

  useEffect(() => {
    setFormData(initialData || {});
    setErrors({});
    if (type === "skills" && Array.isArray(initialData)) {
      setSkillsList(initialData);
    } else if (type === "experience") {
      if (initialData) {
        setExperienceList(Array.isArray(initialData.experience) ? initialData.experience : []);
        setEducationList(Array.isArray(initialData.education) ? initialData.education : []);
      }
    } else if (type === "portfolio" && Array.isArray(initialData)) {
      setPortfolioList(initialData);
    }
  }, [initialData, type, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (field, e) => {
    if (e.target.files?.[0]) {
      handleChange(field, e.target.files[0]);
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      handleChange(`${field}_preview`, previewUrl);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (type === "skills" && !skillsList.length) {
      newErrors.skills = "Add at least one skill";
      isValid = false;
    } else if (type === "portfolio" && !portfolioList.length) {
      newErrors.portfolio = "Add at least one portfolio item";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const submitPortfolioItems = async () => {
    let updatedPortfolio = [];
    for (const item of portfolioList) {
      if (item.id && !(item.image instanceof File)) {
        updatedPortfolio.push(item);
      } else if (item.id && (item.image instanceof File)) {
        const res = await profileAPI.updatePortfolio(item.id, item);
        updatedPortfolio.push(res.data);
      } else {
        const res = await profileAPI.addPortfolio(item);
        updatedPortfolio.push(res.data);
      }
    }
    return updatedPortfolio;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    let dataToSubmit;
    if (type === "avatar" || type === "cover") {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataObj.append(key, value);
        }
      });
      dataToSubmit = formDataObj;
    } else if (type === "portfolio") {
      const updatedPortfolio = await submitPortfolioItems();
      dataToSubmit = { portfolio: updatedPortfolio };
    } else if (type === "skills") {
      dataToSubmit = { skills: skillsList };
    } else if (type === "experience") {
      dataToSubmit = { experience: experienceList, education: educationList };
    } else {
      dataToSubmit = formData;
    }
    
    try {
      await onSave(dataToSubmit);
    } catch (error) {
      console.error("Error in profile update:", error);
      // Show specific error message to user if needed
    }
  };

  // Section handlers (skills, experience, portfolio) remain similar...
  const handleAddSkill = () => {
    if (!newSkill.name) {
      setErrors(prev => ({ ...prev, newSkill: "Skill name is required" }));
      return;
    }
    const skillToAdd = { ...newSkill, id: Date.now().toString() };
    setSkillsList(prev => [...prev, skillToAdd]);
    setNewSkill({ name: "", category: "technical", level: "Beginner" });
    setErrors(prev => ({ ...prev, newSkill: undefined }));
  };

  const handleRemoveSkill = (id) => setSkillsList(prev => prev.filter(skill => skill.id !== id));

  const handleAddExperience = () => {
    if (!newExperience.title || !newExperience.company) {
      setErrors(prev => ({ ...prev, newExperience: "Title and company are required" }));
      return;
    }
    const expToAdd = { ...newExperience, id: Date.now().toString() };
    setExperienceList(prev => [...prev, expToAdd]);
    setNewExperience({ title: "", company: "", location: "", start_date: "", end_date: "", current: false, description: "" });
    setErrors(prev => ({ ...prev, newExperience: undefined }));
  };

  const handleRemoveExperience = (id) => setExperienceList(prev => prev.filter(exp => exp.id !== id));

  const handleAddEducation = () => {
    if (!newEducation.institution || !newEducation.degree) {
      setErrors(prev => ({ ...prev, newEducation: "Institution and degree are required" }));
      return;
    }
    const eduToAdd = { ...newEducation, id: Date.now().toString() };
    setEducationList(prev => [...prev, eduToAdd]);
    setNewEducation({ institution: "", degree: "", field: "", start_date: "", end_date: "", description: "" });
    setErrors(prev => ({ ...prev, newEducation: undefined }));
  };

  const handleRemoveEducation = (id) => setEducationList(prev => prev.filter(edu => edu.id !== id));

  const handleAddPortfolio = () => {
    if (!newPortfolio.title) {
      setErrors(prev => ({ ...prev, newPortfolio: "Project title is required" }));
      return;
    }
    const portToAdd = { ...newPortfolio, id: Date.now().toString() };
    setPortfolioList(prev => [...prev, portToAdd]);
    setNewPortfolio({ title: "", description: "", project_link: "", technologies: [] });
    setErrors(prev => ({ ...prev, newPortfolio: undefined }));
  };

  const handleRemovePortfolio = (id) => setPortfolioList(prev => prev.filter(p => p.id !== id));

  const handleAddTechnology = () => {
    if (newTechnology.trim()) {
      setNewPortfolio(prev => ({ ...prev, technologies: [...(prev.technologies || []), newTechnology.trim()] }));
      setNewTechnology("");
    }
  };

  const handleRemoveTechnology = (tech) => {
    setNewPortfolio(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tech) }));
  };

  const renderModalContent = () => {
    switch (type) {
      case "basic":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="basic" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="bio">Bio & Media</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4">  {/* Changed from grid-cols-2 to grid-cols-1 */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name || userData.full_name || ""}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                    />
                  </div>

                  {/* Username field display - read-only */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (cannot be changed)</Label>
                    <div className="flex items-center">
                      <div className="bg-muted/50 border rounded-md px-3 py-2 w-full text-muted-foreground flex items-center">
                        <span>@{userData.username || ""}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Usernames are unique and cannot be modified after account creation.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="e.g. Full-Stack Developer | AI Enthusiast"
                    value={formData.tagline || userData.tagline || ""}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
{/*                      <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || userData.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || userData.phone || ""}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country || userData.country || ""}
                      onChange={(e) => handleChange("country", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. San Francisco, CA"
                      value={formData.location || userData.location || ""}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bio" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself..."
                    className="min-h-[120px]"
                    value={formData.bio || userData.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                  />
                </div>

{/*                 <div className="space-y-2">
                  <Label htmlFor="profile_image">Profile Image</Label>
                  <Input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("profile_image", e)}
                  />
                  {(formData.profile_image_preview || userData.profile_image) && (
                    <div className="mt-2">
                      <img
                        src={formData.profile_image_preview || userData.profile_image}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image</Label>
                  <Input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("cover_image", e)}
                  />
                  {(formData.cover_image_preview || userData.cover_image) && (
                    <div className="mt-2">
                      <img
                        src={formData.cover_image_preview || userData.cover_image}
                        alt="Cover Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div> */}
              </TabsContent>
            </Tabs>
          </form>
        );

      case "contact":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || userData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || userData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || userData.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedin || userData.linkedin || ""}
                onChange={(e) => handleChange("linkedin", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                type="url"
                value={formData.github || userData.github || ""}
                onChange={(e) => handleChange("github", e.target.value)}
              />
            </div>
          </form>
        );

      case "avatar":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_image">Profile Image</Label>
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("profile_image", e)}
              />
              {(formData.profile_image_preview || userData.profile_image) && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={formData.profile_image_preview || userData.profile_image}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md"
                  />
                </div>
              )}
            </div>
          </form>
        );

      case "cover":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover_image">Cover Image</Label>
              <Input
                id="cover_image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("cover_image", e)}
              />
              {(formData.cover_image_preview || userData.cover_image) && (
                <div className="mt-4">
                  <img
                    src={formData.cover_image_preview || userData.cover_image}
                    alt="Cover Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </form>
        );

      case "skills":
        return (
          <>
            {/* Display list of current skills */}
            {skillsList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              <div className="space-y-2">
                {skillsList.map((skill) => (
                  <div key={skill.id} className="flex justify-between items-center border p-2 rounded">
                    <div>
                      <span className="font-medium">{skill.name}</span> (<span>{skill.level}</span>)
                      <span className="ml-2 text-xs text-muted-foreground">{skill.category}</span>
                    </div>
                    <button onClick={() => handleRemoveSkill(skill.id)} className="text-red-500 text-xs">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* New skill form */}
            <div className="mt-4 space-y-2">
              <Input
                placeholder="Skill Name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              />
              <Select
                value={newSkill.category}
                onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Skill</SelectItem>
                  <SelectItem value="soft">Soft Skill</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newSkill.level}
                onValueChange={(value) => setNewSkill({ ...newSkill, level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddSkill}>Add Skill</Button>
            </div>
          </>
        );
      case "experience":
        return (
          <div className="space-y-6">
            <Tabs defaultValue="experience">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="experience">Work Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
              </TabsList>
              
              <TabsContent value="experience" className="space-y-6">
                {/* Add new experience form */}
                <div className="border rounded-md p-4 space-y-4 bg-muted/20">
                  <h4 className="font-medium text-sm">Add Work Experience</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="expTitle">Job Title</Label>
                      <Input
                        id="expTitle"
                        placeholder="e.g. Software Engineer"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="expCompany">Company</Label>
                      <Input
                        id="expCompany"
                        placeholder="e.g. Google"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="expLocation">Location</Label>
                      <Input
                        id="expLocation"
                        placeholder="e.g. San Francisco, CA"
                        value={newExperience.location}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expStartDate">Start Date</Label>
                        <Input
                          id="expStartDate"
                          type="date"
                          value={newExperience.start_date}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="expEndDate">End Date</Label>
                        <Input
                          id="expEndDate"
                          type="date"
                          value={newExperience.end_date}
                          disabled={newExperience.current}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="currentJob"
                        type="checkbox"
                        className="h-4 w-4 mr-2"
                        checked={newExperience.current}
                        onChange={(e) => {
                          const isCurrent = e.target.checked;
                          setNewExperience(prev => ({ 
                            ...prev, 
                            current: isCurrent,
                            end_date: isCurrent ? "" : prev.end_date
                          }));
                        }}
                      />
                      <Label htmlFor="currentJob" className="text-sm">I currently work here</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="expDescription">Description</Label>
                      <Textarea
                        id="expDescription"
                        placeholder="Describe your role and achievements"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    {errors.newExperience && <p className="text-red-500 text-sm">{errors.newExperience}</p>}
                    
                    <Button type="button" onClick={handleAddExperience} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Experience
                    </Button>
                  </div>
                </div>
                
                {/* Existing experiences list */}
                {experienceList.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Your Work Experience</h4>
                    <div className="space-y-3">
                      {experienceList.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex justify-between rounded-md border p-3"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h5 className="font-medium">{exp.title}</h5>
                              {exp.current && <Badge variant="outline">Current</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{exp.company} • {exp.location}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(exp.start_date).toLocaleDateString()} - {exp.current ? "Present" : exp.end_date ? new Date(exp.end_date).toLocaleDateString() : ""}
                            </p>
                            {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive ml-2 self-start"
                            onClick={() => handleRemoveExperience(exp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No work experience added yet.</p>
                )}
              </TabsContent>
              
              <TabsContent value="education" className="space-y-6">
                {/* Add new education form */}
                <div className="border rounded-md p-4 space-y-4 bg-muted/20">
                  <h4 className="font-medium text-sm">Add Education</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="eduInstitution">Institution</Label>
                      <Input
                        id="eduInstitution"
                        placeholder="e.g. Stanford University"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="eduDegree">Degree</Label>
                      <Input
                        id="eduDegree"
                        placeholder="e.g. Bachelor of Science"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="eduField">Field of Study</Label>
                      <Input
                        id="eduField"
                        placeholder="e.g. Computer Science"
                        value={newEducation.field}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eduStartDate">Start Date</Label>
                        <Input
                          id="eduStartDate"
                          type="date"
                          value={newEducation.start_date}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="eduEndDate">End Date</Label>
                        <Input
                          id="eduEndDate"
                          type="date"
                          value={newEducation.end_date}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="eduDescription">Description</Label>
                      <Textarea
                        id="eduDescription"
                        placeholder="Additional information about your education"
                        value={newEducation.description}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    {errors.newEducation && <p className="text-red-500 text-sm">{errors.newEducation}</p>}
                    
                    <Button type="button" onClick={handleAddEducation} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Education
                    </Button>
                  </div>
                </div>
                
                {/* Existing education list */}
                {educationList.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Your Education</h4>
                    <div className="space-y-3">
                      {educationList.map((edu) => (
                        <div
                          key={edu.id}
                          className="flex justify-between rounded-md border p-3"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium">{edu.degree}</h5>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            {edu.field && <p className="text-sm text-muted-foreground">{edu.field}</p>}
                            <p className="text-sm text-muted-foreground">
                              {new Date(edu.start_date).toLocaleDateString()} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : ""}
                            </p>
                            {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive ml-2 self-start"
                            onClick={() => handleRemoveEducation(edu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No education history added yet.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        );

      case "portfolio":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Manage Portfolio Projects</h3>
            
            {/* Add new portfolio project form */}
            <div className="border rounded-md p-4 space-y-4 bg-muted/20">
              <h4 className="font-medium text-sm">Add New Project</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    placeholder="e.g. E-commerce Website"
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="projectDesc">Description</Label>
                  <Textarea
                    id="projectDesc"
                    placeholder="Describe what the project does and your role in it"
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="projectLink">Project Link</Label>
                  <Input
                    id="projectLink"
                    type="url"
                    placeholder="https://example.com"
                    value={newPortfolio.project_link}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, project_link: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="projectImage">Project Image</Label>
                  <Input
                    id="projectImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNewPortfolio(prev => ({ 
                          ...prev, 
                          imageFile: e.target.files[0],  // Store original File object
                          image_preview: URL.createObjectURL(e.target.files[0])
                        }));
                      }
                    }}
                  />
                  {newPortfolio.image_preview && (
                    <div className="mt-2">
                      <img
                        src={newPortfolio.image_preview}
                        alt="Project Preview"
                        className="h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="projectTech">Technologies</Label>
                  <div className="flex gap-2">
                    <Input
                      id="projectTech"
                      placeholder="Add a technology (e.g. React)"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTechnology();
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={handleAddTechnology}>Add</Button>
                  </div>
                  
                  {newPortfolio.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newPortfolio.technologies.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tech}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTechnology(tech)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {errors.newPortfolio && <p className="text-red-500 text-sm">{errors.newPortfolio}</p>}
                
                <Button type="button" onClick={handleAddPortfolio} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Project
                </Button>
              </div>
            </div>
            
            {/* Existing portfolio projects list */}
            {portfolioList.length > 0 ? (
              <div>
                <h4 className="font-medium text-sm mb-2">Your Portfolio Projects</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioList.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-md border overflow-hidden"
                    >
                      {(project.image_preview || project.image) && (
                        <div className="h-40 bg-muted overflow-hidden">
                          <img
                            src={project.image_preview || project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium">{project.title}</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleRemovePortfolio(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        
                        {project.project_link && (
                          <a
                            href={project.project_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                          >
                            View Project <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                        
                        {project.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No portfolio projects added yet.</p>
            )}
            
            {errors.portfolio && <p className="text-red-500 text-sm">{errors.portfolio}</p>}
          </div>
        );

      default:
        return <p>Unsupported edit type</p>;
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case "basic":
        return activeTab === "basic" ? "Edit Profile Information" : "Edit Bio & Media";
      case "contact":
        return "Edit Contact Information";
      case "avatar":
        return "Change Profile Picture";
      case "cover":
        return "Change Cover Image";
      case "skills":
        return "Manage Skills";
      case "experience":
        return "Edit Experience & Education";
      case "portfolio":
        return "Manage Portfolio Projects";
      default:
        return "Edit Profile";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white border-gray-200 dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900 dark:text-white">{getModalTitle()}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Make changes to your {type} information below.
          </DialogDescription>
        </DialogHeader>

        {renderModalContent()}
        
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto transition-colors duration-200"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="w-full sm:w-auto transition-colors duration-200"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

