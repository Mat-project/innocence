//// filepath: /d:/project/innovsence/frontend/src/pages/profile/modals/DynamicModal.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const personalSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  linkedin: z.string().url("Invalid URL").optional(),
  github: z.string().url("Invalid URL").optional(),
  country: z.string().optional(),
});

// Preprocess file inputs: if the value is a FileList, return its first element.
const filePreprocess = (val) =>
  val instanceof FileList ? val.item(0) : val;

const profileMediaSchema = z.object({
  bio: z.string().optional(),
  profile_image: z.preprocess((val) => filePreprocess(val), z.instanceof(File).optional()),
  cover_image: z.preprocess((val) => filePreprocess(val), z.instanceof(File).optional()),
});

export default function DynamicModal({
  isOpen,
  onClose,
  modalType, // "personal" or "profileMedia"
  initialData,
  onSave,
}) {
  const isMedia = modalType === "profileMedia";
  const schema = isMedia ? profileMediaSchema : personalSchema;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  if (!isOpen) return null;

  // Generate file previews for media editing
  let profilePreview = "";
  let coverPreview = "";
  if (isMedia) {
    const profileFile = watch("profile_image");
    const coverFile = watch("cover_image");
    if (profileFile && profileFile instanceof File) {
      profilePreview = URL.createObjectURL(profileFile);
    }
    if (coverFile && coverFile instanceof File) {
      coverPreview = URL.createObjectURL(coverFile);
    }
  }

  const onFormSubmit = (data) => {
    toast.success("Saved!");
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">
            {isMedia ? "Edit Bio & Media" : "Edit Personal Info"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          {isMedia ? (
            <>
              <div>
                <label className="block text-sm font-medium">Bio</label>
                <textarea
                  {...register("bio")}
                  rows="3"
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
                {errors.bio && (
                  <p className="text-red-500 text-sm">{errors.bio.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("profile_image")}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded object-cover mt-2"
                  />
                )}
                {errors.profile_image && (
                  <p className="text-red-500 text-sm">
                    {errors.profile_image.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("cover_image")}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="w-full h-40 object-cover rounded mt-2"
                  />
                )}
                {errors.cover_image && (
                  <p className="text-red-500 text-sm">
                    {errors.cover_image.message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">LinkedIn</label>
                <input
                  type="url"
                  {...register("linkedin")}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.linkedin && (
                  <p className="text-red-500 text-sm">
                    {errors.linkedin.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">GitHub</label>
                <input
                  type="url"
                  {...register("github")}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.github && (
                  <p className="text-red-500 text-sm">
                    {errors.github.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Country</label>
                <input
                  type="text"
                  {...register("country")}
                  className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded mr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}