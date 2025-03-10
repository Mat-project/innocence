import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../../service/api";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import ProfileActivity from "./components/ProfileActivity";
import LoadingSkeleton from "./components/LoadingSkeleton";
import DynamicModal from "./modals/DynamicModal";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    modalType: "", // "profileMedia" for editing bio, profile image, cover image; "personal" for editing email, linkedin, github, country, phone
    initialData: {},
  });

  // Fetch profile & productivity data
  const {
    data: profileData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await authAPI.getProfile();
      return res.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutation for PATCH updates
  const mutation = useMutation({
    mutationFn: (updateData) => authAPI.updateProfile(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error("Update failed. Please try again.");
      console.error("Profile update error", error);
    },
  });

  // Open modal based on type
  const openModal = (type) => {
    if (type === "personal") {
      setModalConfig({
        isOpen: true,
        modalType: "personal",
        initialData: {
          email: profileData.email,
          linkedin: profileData.linkedin,
          github: profileData.github,
          phone: profileData.phone,
          country: profileData.country,
        },
      });
    } else if (type === "profileMedia") {
      setModalConfig({
        isOpen: true,
        modalType: "profileMedia",
        initialData: {
          bio: profileData.bio,
        },
      });
    }
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, modalType: "", initialData: {} });
  };

  const handleModalSave = async (data) => {
    await mutation.mutateAsync(data);
    closeModal();
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError)
    return (
      <div className="text-center py-8 text-red-600">
        Error loading profile.
      </div>
    );

  // Destructure profileData with defaults
  const {
    username = "",
    profile_image = "",
    cover_image = "",
    email = "",
    phone = "",
    country = "",
    bio = "",
    linkedin = "",
    github = "",
    task_completion_rate = 0,
    avg_work_hours = 0,
    best_work_time = "",
    skills = "",
    current_projects = "",
    productivity_score = 0,
    activities = [],
  } = profileData || {};

  const profileCompletion = Math.min(
    100,
    20 + (bio ? 20 : 0) + (phone ? 20 : 0) + (country ? 20 : 0)
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* ProfileHeader now provides a top-right edit button for media */}
      <ProfileHeader
        name={username}
        username={username}
        profileImage={profile_image}
        profileCompletion={profileCompletion}
        onCoverEdit={() => openModal("profileMedia")}
        onAvatarEdit={() => openModal("profileMedia")}
        onProfileEdit={() => openModal("profileMedia")}
      />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ProfileInfo displays personal info with an edit option */}
        <ProfileInfo
          email={email}
          phone={phone}
          country={country}
          linkedin={linkedin}
          github={github}
          onEdit={() => openModal("personal")}
        />
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4">Productivity Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Task Completion Rate:</strong> {task_completion_rate}%
            </div>
            <div>
              <strong>Average Work Hours/Day:</strong> {avg_work_hours}
            </div>
            <div>
              <strong>Best Work Time:</strong> {best_work_time || "Not set"}
            </div>
            <div>
              <strong>Role:</strong> {profileData.role || "User"}
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4">Work & Productivity</h2>
          <div className="space-y-2">
            <div>
              <strong>Skills:</strong> {skills || "Not stated"}
            </div>
            <div>
              <strong>Current Projects:</strong> {current_projects || "No active projects"}
            </div>
            <div>
              <strong>Productivity Score:</strong> {productivity_score}
            </div>
          </div>
        </div>
        <ProfileActivity activities={activities} />
      </main>
      {/* DynamicModal for editing */}
      <DynamicModal
        isOpen={modalConfig.isOpen}
        modalType={modalConfig.modalType}
        initialData={modalConfig.initialData}
        onClose={closeModal}
        onSave={handleModalSave}
      />
    </div>
  );
}
