import React from "react";
import { Edit } from "lucide-react";

// Reusable info row component
function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center">
      {icon}
      <span className="ml-2">{text}</span>
    </div>
  );
}

export default function ProfileInfo({ email, phone, country,linkdin,github, onEdit }) {
  return (
    <div id="personal-info" className="border rounded-lg shadow p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <button
          onClick={onEdit}
          className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit className="h-4 w-4 mr-2" /> Edit
        </button>
      </div>
      <div className="space-y-4">
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            </svg>
          }
          text={email || "Add your email"}
        />
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
            </svg>
          }
          text={phone || "Add your mobile number"}
        />
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
          text={country || "Add your country"}
        />
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
          text={linkdin || "Add your linkdin link"}
        />
        <InfoRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
          text={github || "Add your github link"}
        />
      </div>
    </div>
  );
}