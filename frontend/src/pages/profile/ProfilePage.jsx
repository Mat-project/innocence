import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import ProfileActivity from "./components/ProfileActivity";
import ProfileSkills from "./components/profileSkills";
import ProfileExperience from "./components/profileExperience";
import ProfilePortfolio from "./components/profilePortfolio"; 
import ProfileSkeleton from "./components/profileSkeleton";
import ProfileEditModal from "./modals/ProfileEditModal";
import AddSectionModal from "./modals/AddSectionModal";
import { authAPI } from "../../service/api";
import { useSkills, useExperience, useEducation, usePortfolio } from "./hooks/useProfileSections.jsx"; 
import { ThemeProvider } from "../../providers/ThemeProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@components/ui/dialog";
import SkillEditModal from './modals/SkillEditModal';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionType, setSectionType] = useState("");
  const [sectionInitialData, setSectionInitialData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  // Use hooks for sections so updates are reflected directly
  const {
    skills,
    loading: skillsLoading,
    addSkill,
    updateSkill,
    deleteSkill,
    fetchSkills,
  } = useSkills();
  
  const {
    experience,
    loading: expLoading,
    addExperience,
    updateExperience,
    deleteExperience,
    fetchExperience,
  } = useExperience();
  
  const {
    education,
    loading: eduLoading,
    addEducation,
    updateEducation,
    deleteEducation,
    fetchEducation,
  } = useEducation();
  
  const {
    portfolio,
    loading: portfolioLoading,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    fetchPortfolio,
  } = usePortfolio();

  // Fetch profile data from backend (for basic info only)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await authAPI.getProfile();
      return res.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // New effect: whenever main profile data updates, refetch section data
  useEffect(() => {
    if (data) {
      fetchSkills();
      fetchExperience();
      fetchEducation();
      fetchPortfolio();
    }
  }, [data, fetchSkills, fetchExperience, fetchEducation, fetchPortfolio]);

  const mutation = useMutation({
    mutationFn: (updateData) => {
      console.log("Updating profile with data:", updateData);
      return authAPI.updateProfile(updateData);
    },
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      queryClient.invalidateQueries({ queryKey: ["education"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Profile update error", error);
      
      // Improved error handling with specific messages based on field errors
      if (error.response?.data) {
        console.error("Error response data:", error.response.data);
        
        // Check for specific field errors
        if (error.response.data.profile_image) {
          toast.error(`Profile image error: ${error.response.data.profile_image[0]}`);
        } else if (error.response.data.cover_image) {
          toast.error(`Cover image error: ${error.response.data.cover_image[0]}`);
        } else if (error.response.data.error) {
          toast.error(`Update failed: ${error.response.data.error}`);
        } else if (typeof error.response.data === 'object') {
          // Try to extract first error from the response
          const firstErrorField = Object.keys(error.response.data)[0];
          const firstError = error.response.data[firstErrorField];
          toast.error(`Error in ${firstErrorField}: ${Array.isArray(firstError) ? firstError[0] : firstError}`);
        } else {
          toast.error("Failed to update profile. Please check your data and try again.");
        }
      } else if (error.request) {
        toast.error("No response from server. Check your connection and try again.");
      } else {
        toast.error(`Request error: ${error.message}`);
      }
    },
  });

  const handleModalSave = async (updatedData) => {
    try {
      await mutation.mutateAsync(updatedData);
      setModalOpen(false);
    } catch (error) {
      // Error is already handled in mutation.onError
      console.log("Error caught in handleModalSave:", error.message);
    }
  };

  if (isLoading) return (
    <ThemeProvider>
      <ProfileSkeleton />
    </ThemeProvider>
  );
  
  if (isError)
    return (
      <ThemeProvider>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center p-8 rounded-lg bg-destructive/10 max-w-md">
            <h3 className="text-xl font-semibold text-destructive mb-2">Error Loading Profile</h3>
            <p className="text-muted-foreground">
              We couldn't load your profile information. Please try refreshing the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </ThemeProvider>
    );

  // Safely calculate profile completion from fields in the profile data
  const calculateProfileCompletion = () => {
    if (!data) return 0;
    
    const fields = [
      data.bio,
      data.profile_image,
      data.location,
      data.phone,
      data.linkedin,
      data.github,
      data.country,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setModalOpen(true);
  };

  const openSectionModal = (type, initialData = {}) => {
    setSectionType(type);
    setSectionInitialData(initialData);
    setEditingItem(initialData); // Set the editing item here
    setSectionModalOpen(true);
  };
  
  // Add a new delete handler function
  const handleSectionDelete = async (id) => {
    try {
      let success = false;
      
      switch(sectionType) {
        case 'skills':
          success = await deleteSkill(id);
          break;
        case 'experience':
          success = await deleteExperience(id);
          break;
        case 'education':
          success = await deleteEducation(id);
          break;
        case 'portfolio':
          success = await deletePortfolio(id);
          break;
        default:
          break;
      }
      
      if (success) {
        setSectionModalOpen(false);
        setEditingItem(null);
        toast.success(`${sectionType} item deleted successfully`);
      }
    } catch (error) {
      console.error(`Error deleting ${sectionType}:`, error);
      toast.error(`Failed to delete ${sectionType}`);
    }
  };

  const handleSectionSave = async (data) => {
    // Generate a unique ID for new items if needed
    if (!data.id) {
      data.id = uuidv4();
    }

    try {
      let success = false;
      console.log(`Saving ${sectionType} data:`, data);
      
      // First, determine if we're updating or adding
      const isUpdate = !!data.id && editingItem && editingItem.id === data.id;
      console.log(`Operation: ${isUpdate ? 'Updating' : 'Adding'} ${sectionType}`);
      
      // Determine which section to update based on sectionType
      switch (sectionType) {
        case "skills":
          if (isUpdate) {
            success = await updateSkill(data.id, data);
          } else {
            success = await addSkill(data);
          }
          break;
          
        case "experience":
          if (isUpdate) {
            success = await updateExperience(data.id, data);
          } else {
            success = await addExperience(data);
          }
          break;
          
        case "education":
          if (isUpdate) {
            success = await updateEducation(data.id, data);
          } else {
            success = await addEducation(data);
          }
          break;
          
        case "portfolio":
          if (isUpdate) {
            success = await updatePortfolio(data.id, data);
          } else {
            success = await addPortfolio(data);
          }
          break;
          
        default:
          break;
      }

      if (success) {
        setSectionModalOpen(false);
        setEditingItem(null);
        
        // Refetch data to ensure UI is up to date
        if (sectionType === "skills") fetchSkills();
        else if (sectionType === "experience") fetchExperience();
        else if (sectionType === "education") fetchEducation();
        else if (sectionType === "portfolio") fetchPortfolio();
        
        toast.success(`${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} ${isUpdate ? 'updated' : 'added'} successfully!`);
      } else {
        toast.error(`Failed to ${isUpdate ? 'update' : 'add'} ${sectionType}`);
      }
    } catch (error) {
      console.error(`Error ${editingItem ? 'updating' : 'adding'} ${sectionType}:`, error);
      toast.error(`Failed to ${editingItem ? 'update' : 'add'} ${sectionType}`);
    }
  };

  const handleSaveItem = async (data) => {
    let success = false;
    if (editingItem) {
      // Update existing item
      switch(modalType) {
        case 'skills':
          success = await updateSkill(editingItem.id, data);
          break;
        case 'experience':
          success = await updateExperience(editingItem.id, data);
          break;
        case 'education':
          success = await updateEducation(editingItem.id, data);
          break;
        case 'portfolio':
          success = await updatePortfolio(editingItem.id, data);
          break;
        default:
          break;
      }
    } else {
      // Add new item
      switch(modalType) {
        case 'skills':
          success = await addSkill(data);
          break;
        case 'experience':
          success = await addExperience(data);
          break;
        case 'education':
          success = await addEducation(data);
          break;
        case 'portfolio':
          success = await addPortfolio(data);
          break;
        default:
          break;
      }
    }

    if (success) {
      setModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleItemEdit = (section, item) => {
    // Special case for skills - use the old modal approach
    if (section === "skills") {
      setModalType("skills");
      setModalData(skills || []);
      setModalOpen(true);
      return;
    }
    
    // For other sections, use the new approach
    setSectionType(section || "");
    setSectionInitialData(item || {});
    setEditingItem(item);
    setSectionModalOpen(true);
  };

  const handleSkillSave = async (data) => {
    // After a successful add/update, refresh the skills list.
    await fetchSkills();
  };

  const handleSkillEdit = (skill) => {
    setEditingSkill(skill);
    setIsSkillModalOpen(true);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-7xl mx-auto">
          {/* Add ApiTester at the top for debugging */}
          
          <ProfileHeader
            user={data}
            profileCompletion={calculateProfileCompletion()}
            onCoverEdit={() => openModal("cover")}
            onAvatarEdit={() => openModal("avatar")}
            onProfileEdit={() => openModal("basic")}
          />

          <div className="container px-4 py-8 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left sidebar */}
              <div className="space-y-6">
                <ProfileInfo
                  bio={data.bio}
                  email={data.email}
                  phone={data.phone}
                  country={data.country}
                  linkedin={data.linkedin}
                  github={data.github}
                  onEdit={() => openModal("contact")}
                />
                {/* <section>
                  <h2 className="text-xl font-bold mb-4">Skills & Expertise</h2>
                  <div className="mb-4">
                    <button 
                      className="btn btn-default" 
                      onClick={() => { setEditingSkill({}); setIsSkillModalOpen(true); }}>
                      Add Skill
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {skills && skills.length > 0 ? (
                      skills.map(skill => (
                        <li key={skill.id} className="flex justify-between items-center border p-2 rounded">
                          <span>{skill.name} — {skill.category} — {skill.level}</span>
                          <div className="space-x-2">
                            <button 
                              className="btn btn-outline text-sm" 
                              onClick={() => handleSkillEdit(skill)}>
                              Edit
                            </button>
                            <button 
                              className="btn btn-destructive text-sm" 
                              onClick={() => {
                                deleteSkill(skill.id);
                                // Optionally refresh skills after deletion.
                                fetchSkills();
                              }}>
                              Delete
                            </button>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p>No skills have been added yet.</p>
                    )}
                  </ul>
                </section> */}
              </div>

              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                <ProfileActivity
                  taskCompletionRate={data.task_completion_rate}
                  totalTasks={data.total_tasks}
                  projectsCount={data.projects_count}
                  pomodoroTime={data.pomodoro_time}
                  habitStreak={data.habit_streak}
                  activities={data.activities || []}
                />

                <ProfileExperience
                  experience={experience || []}
                  education={education || []}
                  onEdit={(type) => handleItemEdit(type || "experience")}
                  onItemEdit={handleItemEdit}
                />

{/*                <ProfilePortfolio
                  portfolio={portfolio || []}
                  onEdit={() => handleItemEdit("portfolio")}
                  onItemEdit={(item) => handleItemEdit("portfolio", item)}
                />  */} 
                {/* <ProfileSkills />*/}
              </div>
            </div>
          </div>

           {modalOpen && (
            <ProfileEditModal
              isOpen={modalOpen}
              type={modalType}
              initialData={modalData}
              userData={data}
              onClose={() => setModalOpen(false)}
              onSave={handleModalSave}
            />
          )} 
          
          {/* Only show section modal for non-skills sections */}
          {sectionModalOpen && sectionType !== "skills" && (
            <Dialog open={sectionModalOpen} onOpenChange={(open) => {
              if (!open) {
                setSectionModalOpen(false);
                setEditingItem(null);
              }
            }}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dark:border-slate-800 dark:bg-slate-950">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {editingItem ? `Edit ${sectionType}` : `Add ${sectionType}`}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {editingItem ? "Update existing information" : "Add new information"} to your profile.
                  </DialogDescription>
                </DialogHeader>
                
                <AddSectionModal
                  sectionType={sectionType}
                  initialData={sectionInitialData}
                  onCancel={() => {
                    setSectionModalOpen(false);
                    setEditingItem(null);
                  }}
                  onSave={handleSectionSave}
                  onDelete={handleSectionDelete}
                  isOpen={true} // Force the modal to think it's open
                />
              </DialogContent>
            </Dialog>
          )} 
          
          <SkillEditModal 
            isOpen={isSkillModalOpen}
            onOpenChange={setIsSkillModalOpen}
            initialData={editingSkill || {}}
            onSave={handleSkillSave}
            onDelete={(id) => { 
              deleteSkill(id);
              setIsSkillModalOpen(false);
              fetchSkills();
            }}
          />

          <Toaster position="top-right" />
        </div>
      </div>
    </ThemeProvider>
  );
}

