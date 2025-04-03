import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Settings,
  Bell,
  BellOff,
  X
} from 'lucide-react';
import { savePomodoroSession } from '../../services/api/pomodoroApi';
import { useAuth } from '../../context/AuthContext'; // Assuming you have auth context
import PomodoroAnalytics from './components/PomodoroAnalytics';

const PomodoroTimer = () => {
  // Timer states
  const [mode, setMode] = useState('focus'); // 'focus', 'break', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Settings
  const [settings, setSettings] = useState({
    focusTime: 25,      // minutes
    breakTime: 5,       // minutes
    longBreakTime: 15,  // minutes
    cyclesBeforeLongBreak: 4
  });
  
  // Audio reference for timer completion sound
  const audioRef = useRef(null);
  
  // Timer interval reference
  const timerRef = useRef(null);

  // New state variables for session tracking
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const { isAuthenticated } = useAuth(); // Get authentication status

  // Add a ref to track if saving is in progress
  const isSavingRef = useRef(false);
  
  // Effect to handle timer countdown
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);
  
  // Effect to set initial time when mode changes
  useEffect(() => {
    resetTimer();
  }, [mode, settings]);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    const savedSound = localStorage.getItem('pomodoroSoundEnabled');
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);
  
  // Save sound preference
  useEffect(() => {
    localStorage.setItem('pomodoroSoundEnabled', soundEnabled.toString());
  }, [soundEnabled]);
  
  // Handle timer completion
  const handleTimerComplete = async () => {
    console.log('Timer complete called at:', new Date().toISOString());
    // Clear the timer interval first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Play the sound notification
    playSound();
    
    // Save session data only once
    if (mode === 'focus' && sessionInProgress && isAuthenticated && !isSavingRef.current) {
      isSavingRef.current = true; // Set flag to prevent duplicate saves
      
      const sessionEndTime = new Date();
      
      try {
        const sessionData = {
          focus_time: settings.focusTime,
          break_time: settings.breakTime,
          long_break_time: settings.longBreakTime,
          cycles: settings.cyclesBeforeLongBreak,
          start_time: sessionStartTime.toISOString(),
          end_time: sessionEndTime.toISOString(),
          date: sessionStartTime.toISOString().split('T')[0],
          completed: true
        };
        
        await savePomodoroSession(sessionData);
        console.log('Pomodoro session saved successfully');
      } catch (error) {
        console.error('Failed to save session:', error);
      }
      
      setSessionInProgress(false);
      isSavingRef.current = false; // Reset the flag
    }
    
    // Rest of your mode switching logic
    if (mode === 'focus') {
      // Increment pomodoro count
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      
      // Check if we need a long break
      if (newCount >= settings.cyclesBeforeLongBreak) {
        setMode('longBreak');
        setPomodoroCount(0);
      } else {
        setMode('break');
      }
    } else {
      // After any break, switch to focus mode
      setMode('focus');
    }
  };
  
  // Format time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle timer active state
  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    
    // Record session start time when starting a focus session
    if (newIsActive && mode === 'focus' && !sessionInProgress) {
      setSessionStartTime(new Date());
      setSessionInProgress(true);
    }
  };
  
  // Reset the timer to initial values based on current mode
  const resetTimer = () => {
    setIsActive(false);
    
    switch (mode) {
      case 'focus':
        setTimeLeft(settings.focusTime * 60);
        break;
      case 'break':
        setTimeLeft(settings.breakTime * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreakTime * 60);
        break;
      default:
        setTimeLeft(settings.focusTime * 60);
    }
  };
  
  // Skip to next mode
  const skipToNext = () => {
    if (mode === 'focus') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      
      if (newCount >= settings.cyclesBeforeLongBreak) {
        setMode('longBreak');
        setPomodoroCount(0);
      } else {
        setMode('break');
      }
    } else {
      setMode('focus');
    }
  };
  
  // Play completion sound
  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Error playing sound:', err));
    }
  };
  
  // Handle settings input changes
  const handleSettingChange = (key, value) => {
    // Convert to number and validate
    const numValue = parseInt(value);
    
    if (isNaN(numValue) || numValue <= 0) return;
    
    const maxValues = {
      focusTime: 60,
      breakTime: 30,
      longBreakTime: 45,
      cyclesBeforeLongBreak: 10
    };
    
    if (numValue > maxValues[key]) return;
    
    setSettings({
      ...settings,
      [key]: numValue
    });
  };
  
  // Get the color theme based on current mode
  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return 'bg-red-500';
      case 'break':
        return 'bg-green-500';
      case 'longBreak':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };
  
  // Get display label for current mode
  const getModeLabel = () => {
    switch (mode) {
      case 'focus':
        return 'Focus Time';
      case 'break':
        return 'Break Time';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

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
      {/* Hidden audio element */}
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />
      
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
          {!isActive ? (
            <button
              onClick={toggleTimer}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-black dark:text-white shadow-md hover:bg-green-600 transition-colors"
              title="Start"
            >
              <Play size={24} />
            </button>
          ) : (
            <button
              onClick={toggleTimer}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-black dark:text-white shadow-md hover:bg-yellow-600 transition-colors"
              title="Pause"
            >
              <Pause size={24} />
            </button>
          )}
          
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
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        if (!soundEnabled) {
                          playSound();
                        }
                      }}
                      className={`px-4 py-2 rounded-md ${
                        soundEnabled 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {soundEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                    {soundEnabled && (
                      <button
                        onClick={playSound}
                        className="ml-2 p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        title="Test sound"
                      >
                        <Bell size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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