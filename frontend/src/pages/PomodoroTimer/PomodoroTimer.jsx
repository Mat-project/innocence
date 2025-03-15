import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../component/ui/button';
import { Switch } from '../../component/ui/switch';
import { Progress } from '../../component/ui/progress';
import { Bell, PauseCircle, PlayCircle, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';

const PomodoroTimer = () => {
  // Timer states
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [time, setTime] = useState(25 * 60); // default 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Settings
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    notifications: true,
    alarmSound: 'digital', // 'digital', 'bell', 'soft'
  });

  // Task tracking
  const [currentTask, setCurrentTask] = useState('');
  const [taskHistory, setTaskHistory] = useState([]);

  // Refs
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  
  // Theme colors
  const themeColors = {
    pomodoro: {
      light: { bg: 'bg-red-100', indicator: 'bg-red-500', button: 'bg-red-500 hover:bg-red-600' },
      dark: { bg: 'bg-red-900/30', indicator: 'bg-red-500', button: 'bg-red-500 hover:bg-red-600' }
    },
    shortBreak: {
      light: { bg: 'bg-green-100', indicator: 'bg-green-500', button: 'bg-green-500 hover:bg-green-600' },
      dark: { bg: 'bg-green-900/30', indicator: 'bg-green-500', button: 'bg-green-500 hover:bg-green-600' }
    },
    longBreak: {
      light: { bg: 'bg-blue-100', indicator: 'bg-blue-500', button: 'bg-blue-500 hover:bg-blue-600' },
      dark: { bg: 'bg-blue-900/30', indicator: 'bg-blue-500', button: 'bg-blue-500 hover:bg-blue-600' }
    }
  };

  // Sound effects
  const soundEffects = {
    digital: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
    bell: 'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3',
    soft: 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3'
  };

  // Effects
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(soundEffects[settings.alarmSound]);
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    
    // Add listener for system theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    try {
      // Modern API (addEventListener)
      darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    } catch (e) {
      // Fallback for older browsers that don't support addEventListener
      try {
        darkModeMediaQuery.addListener(handleDarkModeChange);
      } catch (e2) {
        console.warn('Could not add dark mode listener', e2);
      }
    }
    
    // Set document title
    updateDocumentTitle();
    
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    
    // Load session data if available
    const savedSessions = localStorage.getItem('pomodoroSessions');
    if (savedSessions) {
      try {
        setSessions(parseInt(savedSessions, 10) || 0);
      } catch (e) {
        console.error('Error loading sessions:', e);
      }
    }
    
    // Load task history if available
    const savedTaskHistory = localStorage.getItem('pomodoroTaskHistory');
    if (savedTaskHistory) {
      try {
        setTaskHistory(JSON.parse(savedTaskHistory));
      } catch (e) {
        console.error('Error loading task history:', e);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      try {
        // Modern API (removeEventListener)
        darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
      } catch (e) {
        // Fallback for older browsers
        try {
          darkModeMediaQuery.removeListener(handleDarkModeChange);
        } catch (e2) {
          console.warn('Could not remove dark mode listener', e2);
        }
      }
      
      document.title = 'Pomodoro Timer'; // Reset document title
    };
  }, []);

  // Update document title based on current timer
  const updateDocumentTitle = () => {
    const formattedTime = formatTime(time);
    const modeEmoji = mode === 'pomodoro' ? '🍅' : mode === 'shortBreak' ? '☕' : '🌴';
    document.title = `${formattedTime} ${modeEmoji} Pomodoro`;
  };

  useEffect(() => {
    // Save settings to localStorage when they change
    try {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }, [settings]);

  useEffect(() => {
    // Save sessions to localStorage when they change
    try {
      localStorage.setItem('pomodoroSessions', sessions.toString());
    } catch (e) {
      console.error('Error saving sessions to localStorage:', e);
    }
  }, [sessions]);

  useEffect(() => {
    // Save task history to localStorage when it changes
    try {
      localStorage.setItem('pomodoroTaskHistory', JSON.stringify(taskHistory));
    } catch (e) {
      console.error('Error saving task history to localStorage:', e);
    }
  }, [taskHistory]);

  useEffect(() => {
    // Change timer based on mode
    switch (mode) {
      case 'pomodoro':
        setTime(settings.pomodoro * 60);
        break;
      case 'shortBreak':
        setTime(settings.shortBreak * 60);
        break;
      case 'longBreak':
        setTime(settings.longBreak * 60);
        break;
      default:
        setTime(settings.pomodoro * 60);
    }
    
    // Update audio source when alarm sound setting changes
    if (audioRef.current) {
      audioRef.current.src = soundEffects[settings.alarmSound];
    }
  }, [mode, settings]);

  useEffect(() => {
    // Timer logic
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          const newTime = prevTime - 1;
          // Update document title
          updateDocumentTitle();
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Update document title when timer starts/stops
    updateDocumentTitle();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Timer functions
  const handleTimerComplete = () => {
    // Play notification sound if not muted
    if (settings.notifications && !soundMuted && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        // Try to recover by creating a new audio element
        audioRef.current = new Audio(soundEffects[settings.alarmSound]);
        audioRef.current.play().catch(e => console.error('Still cannot play audio:', e));
      });
    }
    
    // Show browser notifications
    if (settings.notifications) {
      // Browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        let notificationTitle = 'Pomodoro Timer';
        let notificationBody = '';
        
        if (mode === 'pomodoro') {
          notificationTitle = '🍅 Pomodoro Complete!';
          notificationBody = currentTask 
            ? `You've completed your pomodoro for: ${currentTask}. Time for a break!` 
            : 'Time for a break!';
        } else {
          notificationTitle = mode === 'shortBreak' ? '☕ Break Complete!' : '🌴 Long Break Complete!';
          notificationBody = 'Break finished. Back to work!';
        }
        
        try {
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/favicon.ico'
          });
        } catch (e) {
          console.error('Error showing notification:', e);
        }
      }
    }

    if (mode === 'pomodoro') {
      // Record completed pomodoro in task history if there's a current task
      if (currentTask.trim()) {
        const timestamp = new Date().toISOString();
        const newTaskEntry = {
          task: currentTask,
          timestamp,
          duration: settings.pomodoro
        };
        
        setTaskHistory(prev => [newTaskEntry, ...prev].slice(0, 50)); // Limit history to 50 items
      }
      
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      if (newSessions % settings.longBreakInterval === 0) {
        setMode('longBreak');
        if (settings.autoStartBreaks) setIsActive(true);
        else setIsActive(false);
      } else {
        setMode('shortBreak');
        if (settings.autoStartBreaks) setIsActive(true);
        else setIsActive(false);
      }
    } else {
      setMode('pomodoro');
      if (settings.autoStartPomodoros) setIsActive(true);
      else setIsActive(false);
    }
  };

  const handleStart = () => {
    setIsActive(true);
    // Vibration feedback on mobile (if supported)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        console.warn('Vibration API not supported or disabled', e);
      }
    }
  };

  const handlePause = () => {
    setIsActive(false);
    // Vibration feedback on mobile (if supported)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([30, 30, 30]);
      } catch (e) {
        console.warn('Vibration API not supported or disabled', e);
      }
    }
  };

  const handleReset = () => {
    setIsActive(false);
    switch (mode) {
      case 'pomodoro':
        setTime(settings.pomodoro * 60);
        break;
      case 'shortBreak':
        setTime(settings.shortBreak * 60);
        break;
      case 'longBreak':
        setTime(settings.longBreak * 60);
        break;
      default:
        setTime(settings.pomodoro * 60);
    }
    // Vibration feedback on mobile (if supported)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([20, 20, 20, 20]);
      } catch (e) {
        console.warn('Vibration API not supported or disabled', e);
      }
    }
  };

  const handleModeChange = (newMode) => {
    // Only change if the mode is different to avoid unnecessary resets
    if (newMode !== mode) {
      setIsActive(false);
      setMode(newMode);
    }
  };

  const handleSettingsChange = (setting, value) => {
    // Validate input values to prevent errors
    if (typeof value === 'number' && (isNaN(value) || value <= 0)) {
      return; // Don't update with invalid values
    }
    
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const toggleSound = () => {
    setSoundMuted(!soundMuted);
  };

  // Formatting functions
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    let totalTime;
    switch (mode) {
      case 'pomodoro':
        totalTime = settings.pomodoro * 60;
        break;
      case 'shortBreak':
        totalTime = settings.shortBreak * 60;
        break;
      case 'longBreak':
        totalTime = settings.longBreak * 60;
        break;
      default:
        totalTime = settings.pomodoro * 60;
    }
    
    // Guard against division by zero
    if (totalTime <= 0) totalTime = 1;
    
    const progress = 100 - (time / totalTime * 100);
    // Ensure progress is between 0 and 100
    return Math.min(100, Math.max(0, progress));
  };

  // Format date for display
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().catch(e => {
        console.error('Error requesting notification permission:', e);
      });
    }
  };

  useEffect(() => {
    if (settings.notifications && 'Notification' in window) {
      requestNotificationPermission();
    }
  }, [settings.notifications]);

  // Reset sessions counter
  const handleResetSessions = () => {
    if (window.confirm('Are you sure you want to reset your sessions count?')) {
      setSessions(0);
    }
  };

  // Clear task history
  const handleClearTaskHistory = () => {
    if (window.confirm('Are you sure you want to clear your task history?')) {
      setTaskHistory([]);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md`}>
      <h2 className="text-2xl font-bold text-center mb-6">Pomodoro Timer</h2>
      
      {/* Current Task Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="What are you working on?"
          value={currentTask}
          onChange={(e) => setCurrentTask(e.target.value)}
          className={`w-full p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
        />
      </div>
      
      {/* Timer Tabs */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`py-2 rounded-md transition-colors ${mode === 'pomodoro' 
              ? themeColors.pomodoro[theme].button + ' text-white' 
              : (theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700')}`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`py-2 rounded-md transition-colors ${mode === 'shortBreak' 
              ? themeColors.shortBreak[theme].button + ' text-white' 
              : (theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700')}`}
          >
            Short Break
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`py-2 rounded-md transition-colors ${mode === 'longBreak' 
              ? themeColors.longBreak[theme].button + ' text-white' 
              : (theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700')}`}
          >
            Long Break
          </button>
        </div>
      </div>
      
      {/* Timer Display */}
      <div className="mb-6">
        <div className="text-6xl font-bold text-center mb-4">
          {formatTime(time)}
        </div>
        <Progress 
          value={calculateProgress()} 
          className={`h-2 ${themeColors[mode][theme].bg}`}
          indicatorClassName={themeColors[mode][theme].indicator}
        />
      </div>
      
      {/* Timer Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isActive ? (
          <Button onClick={handleStart} className={`flex items-center space-x-1 ${themeColors[mode][theme].button}`}>
            <PlayCircle className="w-5 h-5" />
            <span>Start</span>
          </Button>
        ) : (
          <Button onClick={handlePause} className="flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600">
            <PauseCircle className="w-5 h-5" />
            <span>Pause</span>
          </Button>
        )}
        <Button onClick={handleReset} className="flex items-center space-x-1">
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </Button>
        <Button onClick={toggleSound} className="p-2">
          {soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <Button onClick={() => setShowSettings(!showSettings)} className="flex items-center space-x-1">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Button>
      </div>
      
      {/* Session Counter */}
      <div className="flex justify-between items-center mb-4 text-gray-600 dark:text-gray-300">
        <span>Sessions completed: {sessions}</span>
        {sessions > 0 && (
          <Button onClick={handleResetSessions} size="sm" variant="ghost" className="text-xs">
            Reset
          </Button>
        )}
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className={`mt-6 p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="font-semibold mb-4">Settings</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Pomodoro (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.pomodoro}
                onChange={(e) => handleSettingsChange('pomodoro', parseInt(e.target.value) || 25)}
                className={`w-16 p-1 border rounded ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreak}
                onChange={(e) => handleSettingsChange('shortBreak', parseInt(e.target.value) || 5)}
                className={`w-16 p-1 border rounded ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreak}
                onChange={(e) => handleSettingsChange('longBreak', parseInt(e.target.value) || 15)}
                className={`w-16 p-1 border rounded ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Long Break Interval</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) => handleSettingsChange('longBreakInterval', parseInt(e.target.value) || 4)}
                className={`w-16 p-1 border rounded ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Auto-start Breaks</label>
              <Switch
                checked={settings.autoStartBreaks}
                onCheckedChange={(checked) => handleSettingsChange('autoStartBreaks', checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Auto-start Pomodoros</label>
              <Switch
                checked={settings.autoStartPomodoros}
                onCheckedChange={(checked) => handleSettingsChange('autoStartPomodoros', checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Notifications</label>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingsChange('notifications', checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Alarm Sound</label>
              <select
                value={settings.alarmSound}
                onChange={(e) => handleSettingsChange('alarmSound', e.target.value)}
                className={`p-1 border rounded ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="digital">Digital</option>
                <option value="bell">Bell</option>
                <option value="soft">Soft</option>
              </select>
            </div>

            {'Notification' in window && settings.notifications && Notification.permission !== 'granted' && (
              <Button onClick={requestNotificationPermission} className="w-full mt-2 flex items-center justify-center space-x-1">
                <Bell className="w-4 h-4" />
                <span>Enable Notifications</span>
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Task History */}
      {taskHistory.length > 0 && (
        <div className={`mt-6 p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Task History</h3>
            <Button onClick={handleClearTaskHistory} size="sm" variant="ghost" className="text-xs">
              Clear History
            </Button>
          </div>
          
          <div className={`max-h-40 overflow-y-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {taskHistory.map((task, index) => (
              <div key={index} className={`p-2 mb-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="font-medium">{task.task}</div>
                <div className="text-xs flex justify-between">
                  <span>{formatDate(task.timestamp)}</span>
                  <span>{task.duration} minutes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;