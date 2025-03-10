//// filepath: /d:/project/innovsence/frontend/src/pages/profile/modals/AvatarEditModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

export default function AvatarEditModal({ isOpen, onClose, onSave }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(avatarFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Edit Profile Picture</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="w-full"
          />
          {previewUrl && (
            <img src={previewUrl} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover" />
          )}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}