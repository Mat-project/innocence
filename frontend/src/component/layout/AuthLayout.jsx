//// filepath: /d:/project/innovsence/frontend/src/layout/AuthLayout.jsx
import React from 'react';
import Navbar from '../LandingComponent/Navbar';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Navbar />
      <hr className="border-t border-gray-200 dark:border-gray-700 my-2" />
      <main className="flex flex-grow items-center justify-center from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 ">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;