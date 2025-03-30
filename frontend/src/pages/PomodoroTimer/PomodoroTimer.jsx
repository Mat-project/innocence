import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  RotateCcw, 
  Settings as SettingsIcon,
  X,
  Volume2,
  VolumeX,
  BarChart2,
  Check
} from 'lucide-react';
import axios from 'axios';

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Default alarm sound URL
const DEFAULT_ALARM_SOUND = "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3";

// Mock statistics data for development/testing
const mockStats = {
  today: { 
    total_minutes: 45, 
    session_count: 3, 
    data_points: [{label: 'Today', minutes: 45}] 
  },
  week: { 
    total_minutes: 180, 
    session_count: 12, 
    data_points: [
      {label: 'Mon', minutes: 25},
      {label: 'Tue', minutes: 50},
      {label: 'Wed', minutes: 30},
      {label: 'Thu', minutes: 45},
      {label: 'Fri', minutes: 15},
      {label: 'Sat', minutes: 0},
      {label: 'Sun', minutes: 15}
    ] 
  },
  month: { 
    total_minutes: 720, 
    session_count: 42, 
    data_points: Array.from({length: 30}, (_, i) => ({
      label: `${i+1}`, 
      minutes: Math.floor(Math.random() * 60)
    }))
  },
  year: { 
    total_minutes: 8640, 
    session_count: 576, 
    data_points: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      label: month,
      minutes: Math.floor(Math.random() * 800)
    }))
  },
  all_time: { total_minutes: 10080, session_count: 672 }
};

// Create empty stats for a new user
const createEmptyStats = () => {
  // Get current date info for labels
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create week data points - last 7 days
  const weekPoints = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    weekPoints.push({
      label: dayNames[date.getDay()],
      minutes: 0
    });
  }
  
  // Create month data points - days of current month
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthPoints = Array.from({length: daysInMonth}, (_, i) => ({
    label: `${i + 1}`,
    minutes: 0
  }));
  
  // Create year data points - all months
  const yearPoints = monthNames.map(month => ({
    label: month,
    minutes: 0
  }));
  
  return {
    today: { 
      total_minutes: 0, 
      session_count: 0, 
      data_points: [{label: 'Today', minutes: 0}] 
    },
    week: { 
      total_minutes: 0, 
      session_count: 0, 
      data_points: weekPoints
    },
    month: { 
      total_minutes: 0, 
      session_count: 0, 
      data_points: monthPoints
    },
    year: { 
      total_minutes: 0, 
      session_count: 0, 
      data_points: yearPoints
    },
    all_time: { 
      total_minutes: 0, 
      session_count: 0 
    }
  };
};

const PomodoroTimer = () => {
  // Core timer states
  const [mode, setMode] = useState('pomodoro');
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [initialTime, setInitialTime] = useState(25 * 60); // Track the initial time for progress calculation
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  // Simple settings
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  
  // Refs
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Authentication and statistics
  const isAuthenticated = false; // Will implement real auth once context is fixed
  const user = null;
  const [stats, setStats] = useState(createEmptyStats());
  const [activeStatsTab, setActiveStatsTab] = useState('week');
  
  // Load settings from localStorage when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        // Also update initial time based on loaded settings
        if (mode === 'pomodoro') {
          const newTime = parsedSettings.pomodoro * 60;
          setTime(newTime);
          setInitialTime(newTime);
        }
        else if (mode === 'shortBreak') {
          const newTime = parsedSettings.shortBreak * 60;
          setTime(newTime);
          setInitialTime(newTime);
        }
        else if (mode === 'longBreak') {
          const newTime = parsedSettings.longBreak * 60;
          setTime(newTime);
          setInitialTime(newTime);
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    
    // Load sound setting
    const savedSoundEnabled = localStorage.getItem('pomodoroSoundEnabled');
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === 'true');
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Save sound setting when it changes
  useEffect(() => {
    localStorage.setItem('pomodoroSoundEnabled', soundEnabled);
  }, [soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Update time when mode changes
  useEffect(() => {
    handleReset();
  }, [mode, settings]);

  // Load stats from localStorage when component mounts
  useEffect(() => {
    // Try to load saved stats from localStorage
    const savedStats = localStorage.getItem('pomodoroStats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      } catch (e) {
        console.error('Error loading stats:', e);
        setStats(createEmptyStats());
      }
    } else {
      // Initialize with empty stats
      setStats(createEmptyStats());
    }

    // If authenticated, also try to fetch real data from server
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Save stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
  }, [stats]);

  // Fetch statistics - integrates with backend when auth is set up
  const fetchStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await axios.get('/api/pomodoro/sessions/statistics/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching pomodoro statistics:', error);
      // Don't revert to mock data on error, keep current stats
    }
  };

  // Timer functions
  const handleTimerComplete = async () => {
    setIsActive(false);
    setShowCompletionMessage(true);
    
    // Play alarm sound if enabled
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Error playing sound:', err));
    }
    
    // Only update stats for pomodoro sessions, not breaks
    if (mode === 'pomodoro') {
      // Calculate minutes completed
      const sessionDuration = initialTime; // Use the actual initial time
      const sessionMinutes = Math.floor(sessionDuration / 60);
      
      if (sessionMinutes > 0) {
        // Create a copy of current stats to update
        const updatedStats = {...stats};
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0-6, starting with Sunday
        const dayOfMonth = today.getDate() - 1; // 0-30
        const monthOfYear = today.getMonth(); // 0-11
        
        // Update today's stats
        updatedStats.today.total_minutes += sessionMinutes;
        updatedStats.today.session_count += 1;
        updatedStats.today.data_points[0].minutes += sessionMinutes;
        
        // Update week stats
        updatedStats.week.total_minutes += sessionMinutes;
        updatedStats.week.session_count += 1;
        updatedStats.week.data_points[6].minutes += sessionMinutes; // Today is always the last day in the week view
        
        // Update month stats
        updatedStats.month.total_minutes += sessionMinutes;
        updatedStats.month.session_count += 1;
        if (updatedStats.month.data_points[dayOfMonth]) {
          updatedStats.month.data_points[dayOfMonth].minutes += sessionMinutes;
        }
        
        // Update year stats
        updatedStats.year.total_minutes += sessionMinutes;
        updatedStats.year.session_count += 1;
        updatedStats.year.data_points[monthOfYear].minutes += sessionMinutes;
        
        // Update all-time stats
        updatedStats.all_time.total_minutes += sessionMinutes;
        updatedStats.all_time.session_count += 1;
        
        // Update state
        setStats(updatedStats);
        
        // If authenticated, send to server
        if (isAuthenticated) {
          try {
            await axios.post('/api/pomodoro/sessions/', {
              duration: sessionDuration,
              mode: mode,
              completed: true,
              completed_at: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error recording pomodoro session:', error);
          }
        }
      }
    }
    
    // Auto switch modes
    if (mode === 'pomodoro') {
      setMode('shortBreak');
    } else {
      setMode('pomodoro');
    }
    
    // Hide completion message after 3 seconds
    setTimeout(() => {
      setShowCompletionMessage(false);
    }, 3000);
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    let newTime;
    
    switch (mode) {
      case 'pomodoro':
        newTime = settings.pomodoro * 60;
        break;
      case 'shortBreak':
        newTime = settings.shortBreak * 60;
        break;
      case 'longBreak':
        newTime = settings.longBreak * 60;
        break;
      default:
        newTime = settings.pomodoro * 60;
    }
    
    setTime(newTime);
    setInitialTime(newTime); // Store initial time for progress calculation
  };

  const handleModeChange = (newMode) => {
    // Only change if the mode is different
    if (newMode !== mode) {
      setIsActive(false);
      setMode(newMode);
    }
  };

  const handleSettingsChange = (setting, value) => {
    // Validate input values to prevent errors with appropriate maximums
    const maxValues = {
      pomodoro: 120,
      shortBreak: 30,
      longBreak: 120
    };
    
    if (value <= 0 || value > maxValues[setting]) return;
    
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const applyCustomTime = () => {
    if (customMinutes === 0 && customSeconds === 0) return;
    
    const totalSeconds = (parseInt(customMinutes) || 0) * 60 + (parseInt(customSeconds) || 0);
    if (totalSeconds > 0) {
      setIsActive(false);
      setTime(totalSeconds);
      setInitialTime(totalSeconds); // Store initial time for proper progress calculation
      
      // Reset the custom input
      setCustomMinutes(0);
      setCustomSeconds(0);
    }
  };

  // Helper functions
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    // Use initialTime instead of preset based on mode to handle custom times
    if (initialTime <= 0) return 0;
    
    const progress = 100 - (time / initialTime * 100);
    return Math.min(100, Math.max(0, progress));
  };

  // Get the color scheme for current mode
  const getModeColor = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          accent: 'bg-red-500',
          button: 'bg-red-500 hover:bg-red-600'
        };
      case 'shortBreak':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          accent: 'bg-green-500',
          button: 'bg-green-500 hover:bg-green-600'
        };
      case 'longBreak':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          accent: 'bg-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600'
        };
    }
  };

  const colors = getModeColor();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="h-6 w-6 mr-2 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pomodoro Timer</h1>
        </div>
        
        {/* Sound toggle button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          title={soundEnabled ? "Mute alarm" : "Enable alarm"}
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>
      
      {/* Hidden audio element for alarm */}
      <audio ref={audioRef} src={DEFAULT_ALARM_SOUND} />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-4 md:p-6">
        {/* Timer Tabs */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-3 gap-2 w-full max-w-lg">
            <button
              onClick={() => handleModeChange('pomodoro')}
              className={`py-2 px-3 md:px-4 rounded-md transition-colors ${
                mode === 'pomodoro' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`py-2 px-3 md:px-4 rounded-md transition-colors ${
                mode === 'shortBreak' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`py-2 px-3 md:px-4 rounded-md transition-colors ${
                mode === 'longBreak' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Long Break
            </button>
          </div>
        </div>

        {/* Custom Timer Input */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-wrap space-x-2 items-center">
            <input
              type="number"
              min="0"
              max="120"
              placeholder="min"
              value={customMinutes || ''}
              onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
              className="w-16 text-center p-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
            />
            <span className="text-gray-600 dark:text-gray-300">:</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="sec"
              value={customSeconds || ''}
              onChange={(e) => setCustomSeconds(parseInt(e.target.value) || 0)}
              className="w-16 text-center p-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={applyCustomTime}
              className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
            >
              Set Custom Time
            </button>
          </div>
        </div>

        {/* Session Completion Message */}
        {showCompletionMessage && (
          <div className="my-4 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-center animate-pulse flex items-center justify-center">
            <Check className="w-5 h-5 mr-2" />
            <span>Session completed! Great job.</span>
          </div>
        )}

        {/* Timer Display */}
        <div className="mb-8">
          <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-center mb-6 text-gray-800 dark:text-white font-mono">
            {formatTime(time)}
          </div>
          <div className={`h-3 w-full rounded-full ${colors.bg}`}>
            <div 
              className={`h-3 rounded-full ${colors.accent} transition-all duration-1000 ease-linear`} 
              style={{ width: `${calculateProgress()}%` }} 
            />
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {!isActive ? (
            <button 
              onClick={handleStart} 
              className={`flex items-center space-x-2 px-6 py-3 rounded-md ${colors.button} text-white transition-colors`}
            >
              <PlayCircle className="w-5 h-5" />
              <span>Start</span>
            </button>
          ) : (
            <button 
              onClick={handlePause} 
              className="flex items-center space-x-2 px-6 py-3 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
            >
              <PauseCircle className="w-5 h-5" />
              <span>Pause</span>
            </button>
          )}
          <button 
            onClick={handleReset} 
            className="flex items-center space-x-2 px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="flex items-center space-x-2 px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Timer Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-gray-700 dark:text-gray-300">Pomodoro (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.pomodoro}
                  onChange={(e) => handleSettingsChange('pomodoro', parseInt(e.target.value))}
                  className="w-24 p-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-gray-700 dark:text-gray-300">Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreak}
                  onChange={(e) => handleSettingsChange('shortBreak', parseInt(e.target.value))}
                  className="w-24 p-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-gray-700 dark:text-gray-300">Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.longBreak}
                  onChange={(e) => handleSettingsChange('longBreak', parseInt(e.target.value))}
                  className="w-24 p-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">Alarm Sound</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-4 py-2 rounded-md ${
                        soundEnabled
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {soundEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                    {soundEnabled && (
                      <button
                        onClick={() => audioRef.current?.play()}
                        className="ml-2 p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
                        title="Test alarm sound"
                      >
                        <Volume2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-indigo-500" />
          Focus Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.today.total_minutes} mins
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.week.total_minutes} mins
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">This Week</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.month.total_minutes} mins
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">This Month</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.all_time.session_count}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Sessions Completed</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            {['week', 'month', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setActiveStatsTab(period)}
                className={`px-3 py-1 rounded ${
                  activeStatsTab === period
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            {stats[activeStatsTab]?.data_points?.length > 0 ? (
              <Bar
                data={{
                  labels: stats[activeStatsTab].data_points.map(d => d.label),
                  datasets: [
                    {
                      label: 'Minutes',
                      data: stats[activeStatsTab].data_points.map(d => d.minutes),
                      backgroundColor: 
                        mode === 'pomodoro' ? 'rgba(239, 68, 68, 0.6)' : 
                        mode === 'shortBreak' ? 'rgba(34, 197, 94, 0.6)' : 
                        'rgba(59, 130, 246, 0.6)',
                      borderColor: 
                        mode === 'pomodoro' ? 'rgb(239, 68, 68)' : 
                        mode === 'shortBreak' ? 'rgb(34, 197, 94)' : 
                        'rgb(59, 130, 246)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Minutes',
                      },
                      grid: {
                        color: 'rgba(156, 163, 175, 0.1)',
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: activeStatsTab === 'year' ? 'Month' : 'Date',
                      },
                      grid: {
                        display: false
                      }
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.raw} minutes`;
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Start completing Pomodoro sessions to see your statistics.
              </div>
            )}
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Your focus statistics are being saved to your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;