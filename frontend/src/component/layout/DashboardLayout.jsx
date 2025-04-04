import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import UserMenu from '../common/UserMenu';
import Navigation from '../dashboard/Navigation';
import NotificationsModal from '../notifications/NotificationsModal';
import MiniPomodoroTimer from '../../pages/PomodoroTimer/MiniPomodoroTimer';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-menu')) setProfileOpen(false);
      if (!event.target.closest('.search-container')) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:flex-shrink-0`}
      >
        <nav className="h-full overflow-y-auto">
          <div className="px-4 py-4">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-xl font-semibold">TaskVerse</span>
            </Link>
          </div>
          <div className="px-4">
            <Navigation />
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-1 items-center justify-between px-4">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              <UserMenu onShowNotifications={() => setShowNotifications(true)} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Render Notifications Modal if toggled */}
      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
      
      {/* Add MiniPomodoroTimer component */}
      <MiniPomodoroTimer />
    </div>
  );
};

export default DashboardLayout;
