//// filepath: /d:/project/innovsence/frontend/src/pages/profile/components/LoadingSkeleton.jsx
import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="flex space-x-4">
        <div className="h-24 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  );
}