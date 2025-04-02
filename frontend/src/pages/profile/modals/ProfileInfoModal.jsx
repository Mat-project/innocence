import React, { useState } from "react";
import { X } from "lucide-react";

export default function ProfileInfoModal({ isOpen, onClose, initialData, onSave }) {
  const defaultData = {
    email: "",
    country: "",
    phone: "",
    visibility: "only-me",
    bio: "",
  };

  const [formData, setFormData] = useState({ ...defaultData, ...initialData });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Personal Information</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block">Country</label>
              <select
                value={formData.country}

                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select country</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>
            <div>
              <label className="block">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block">Current country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => handleChange("visibility", e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="only-me">Only Me</option>
                <option value="connections">My Connections</option>
                <option value="public">Everyone</option>
              </select>
            </div>
            <div>
              <label className="block">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows="3"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
