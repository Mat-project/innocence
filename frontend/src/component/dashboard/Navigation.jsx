import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center px-4 py-2 rounded-lg
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white dark:hover:text-blue-200 ' 
          : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-white'
        }
      `}
    >
      <span className="inline-flex items-center justify-center w-5 h-5 mr-2">
        {icon}
      </span>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};

const Navigation = () => {
  const [isProductivityOpen, setIsProductivityOpen] = useState(false);
  const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(false);
  const [isFileToolsOpen, setIsFileToolsOpen] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  return (
    <nav className="flex flex-col space-y-1 p-2">
      <NavItem
        to="/dashboard"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
      >
        Dashboard
      </NavItem>

      {/* Dropdown for Productivity Tools */}
      <div>
        <button
          onClick={() => setIsProductivityOpen(!isProductivityOpen)}
          className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 ease-in-out w-full"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="text-sm font-medium">Productivity Tools</span>
        </button>
        {isProductivityOpen && (
          <div className="ml-6 mt-2 space-y-1">
            <NavItem
              to="/tasks"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              Tasks
            </NavItem>
            <NavItem
              to="/pomodoro-timer"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              Pomodoro Timer
            </NavItem>
            <NavItem
              to="/habit-tracker"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              Habit Tracker
            </NavItem>
          </div>
        )}
      </div>

      {/* Dropdown for Project Section */}
      <div>
        <button
          onClick={() => setIsProjectSectionOpen(!isProjectSectionOpen)}
          className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 ease-in-out w-full"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="text-sm font-medium">Team Collab</span>
        </button>
        {isProjectSectionOpen && (
          <div className="ml-6 mt-2 space-y-1">
            <NavItem
              to="/chat"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              }
            >
              Chat
            </NavItem>
          </div>
        )}
      </div>

      {/* Dropdown for File Tools */}
      <div>
        <button
          onClick={() => setIsFileToolsOpen(!isFileToolsOpen)}
          className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 ease-in-out w-full"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="text-sm font-medium">File Tools</span>
        </button>
        {isFileToolsOpen && (
          <div className="ml-6 mt-2 space-y-1">
            <NavItem
              to="/file-convertor"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            >
              File Converter
            </NavItem>
          </div>
        )}
      </div>

      {/* Dropdown for Development Tools */}
      <div>
        <button
          onClick={() => setIsDevToolsOpen(!isDevToolsOpen)}
          className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-white transition-all duration-200 ease-in-out w-full"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="text-sm font-medium">Development Tools</span>
        </button>
        {isDevToolsOpen && (
          <div className="ml-6 mt-2 space-y-1">
            <NavItem
              to="/code-editor"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              Code Editor
            </NavItem>
            <NavItem
              to="/notepad"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              Note Pad
            </NavItem>
          </div>
          
        )}
      </div>
    </nav>
  );
};

export default Navigation;