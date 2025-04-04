import React, { useState, useEffect } from 'react';
import { Settings, Bell, BellOff, X, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePomodoro } from '../../context/PomodoroContext';
import PomodoroAnalytics from './components/PomodoroAnalytics';

const PomodoroTimer = () => {
  // Use the global Pomodoro context instead of local state
  const {
    mode,
    timeLeft,
    isActive,
    pomodoroCount,
    settings,
    soundEnabled,
    formatTime,
    toggleTimer,
    resetTimer,
    skipToNext,
    handleSettingChange,
    setSoundEnabled,
    getModeColor,
    getModeLabel
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Login reminder component
  const LoginReminder = () => (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
      <p>Sign in to track your pomodoro sessions and view statistics.</p>
      <a href="/login" className="text-blue-500 hover:underline mt-1 inline-block">
        Login now →
      </a>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Pomodoro Timer</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {/* Mode indicator */}
        <div className="mb-6 text-center">
          <div className={`inline-block px-3 py-1 rounded-md text-white ${getModeColor()}`}>
            {getModeLabel()}
          </div>
          {mode === 'focus' && (
            <div className="text-sm text-gray-500 mt-1">
              Session {pomodoroCount + 1} of {settings.cyclesBeforeLongBreak}
            </div>
          )}
        </div>
        
        {/* Timer display */}
        <div className="text-6xl font-mono text-center font-bold mb-8 text-gray-800 dark:text-gray-200">
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center mb-6">
          {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, index) => (
            <div 
              key={index}
              className={`h-3 w-3 rounded-full mx-1 ${
                index < pomodoroCount ? getModeColor() : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        {/* Timer controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              isActive 
                ? "bg-yellow-500 hover:bg-yellow-600" 
                : "bg-green-500 hover:bg-green-600"
            } text-black dark:text-white shadow-md transition-colors`}
            title={isActive ? "Pause" : "Start"}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 text-black dark:text-white shadow-md hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            title="Reset"
          >
            <RotateCcw size={24} />
          </button>
          
          <button
            onClick={skipToNext}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-black dark:text-white shadow-md hover:bg-blue-600 transition-colors"
            title="Skip to next"
          >
            <SkipForward size={24} />
          </button>
        </div>
      </div>
      
      {/* Add the analytics component */}
      <div className="container mx-auto px-4 py-8">
        <PomodoroAnalytics />
      </div>
      
      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Timer Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-gray-600 dark:text-gray-300">Focus Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.focusTime}
                  onChange={(e) => handleSettingChange('focusTime', e.target.value)}
                  className="w-16 p-2 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-gray-600 dark:text-gray-300">Break Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.breakTime}
                  onChange={(e) => handleSettingChange('breakTime', e.target.value)}
                  className="w-16 p-2 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-gray-600 dark:text-gray-300">Long Break Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={settings.longBreakTime}
                  onChange={(e) => handleSettingChange('longBreakTime', e.target.value)}
                  className="w-16 p-2 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-gray-600 dark:text-gray-300">Sessions before Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.cyclesBeforeLongBreak}
                  onChange={(e) => handleSettingChange('cyclesBeforeLongBreak', e.target.value)}
                  className="w-16 p-2 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <label className="text-gray-600 dark:text-gray-300">Sound notification</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-4 py-2 rounded-md ${
                        soundEnabled 
                          ? 'bg-blue-500 text-black dark:text-white' 
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {soundEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-500 text-black dark:text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login reminder */}
      {!isAuthenticated && <LoginReminder />}
    </div>
  );
};

export default PomodoroTimer;