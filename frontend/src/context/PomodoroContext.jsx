import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { savePomodoroSession } from '../services/api/pomodoroApi';  // Fixed import path

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  // Timer states
  const [mode, setMode] = useState('focus'); // 'focus', 'break', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState({
    focusTime: 25,      // minutes
    breakTime: 5,       // minutes
    longBreakTime: 15,  // minutes
    cyclesBeforeLongBreak: 4
  });
  
  // Audio reference
  const audioRef = useRef(null);
  
  // Timer reference
  const timerRef = useRef(null);
  
  // Flag to prevent duplicate session saves
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
  
  // Load settings from localStorage on mount
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

    // Create audio element
    audioRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3");
  }, []);
  
  // Save sound preference
  useEffect(() => {
    localStorage.setItem('pomodoroSoundEnabled', soundEnabled.toString());
  }, [soundEnabled]);
  
  // Handle timer completion
  const handleTimerComplete = async () => {
    // Clear the timer interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Play sound notification
    playSound();
    
    // Check if we need to save a completed focus session
    if (mode === 'focus' && sessionInProgress && !isSavingRef.current) {
      isSavingRef.current = true;
      
      const sessionEndTime = new Date();
      
      try {
        // Create a proper date string in YYYY-MM-DD format
        const dateStr = sessionStartTime.toISOString().split('T')[0];
        
        // Prepare the session data
        const sessionData = {
          focus_time: settings.focusTime,
          break_time: settings.breakTime,
          long_break_time: settings.longBreakTime,
          cycles: settings.cyclesBeforeLongBreak,
          start_time: sessionStartTime.toISOString(),
          end_time: sessionEndTime.toISOString(),
          date: dateStr,
          completed: true
        };
        
        console.log('[Pomodoro] Attempting to save session:', sessionData);
        
        // Important: Wait for the save to complete before proceeding
        const result = await savePomodoroSession(sessionData);
        console.log('[Pomodoro] Session saved successfully!', result);
        
        // Dispatch an event to notify the analytics component to refresh
        window.dispatchEvent(new CustomEvent('pomodoro-session-saved'));
        
      } catch (error) {
        console.error('[Pomodoro] Failed to save session:', error);
      } finally {
        setSessionInProgress(false);
        isSavingRef.current = false;
      }
    }
    
    // Update mode and pomodoro count
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
    
    setIsActive(true); // Automatically start the next timer
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    
    // Record session start time when starting a focus session
    if (newIsActive && mode === 'focus' && !sessionInProgress) {
      setSessionStartTime(new Date());
      setSessionInProgress(true);
    }
  };
  
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
  
  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Error playing sound:', err));
    }
  };
  
  const handleSettingChange = (key, value) => {
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
  
  // Get color theme based on current mode
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

  return (
    <PomodoroContext.Provider value={{
      mode,
      timeLeft,
      isActive,
      settings,
      pomodoroCount,
      soundEnabled,
      formatTime,
      toggleTimer,
      resetTimer,
      skipToNext,
      handleTimerComplete,
      handleSettingChange,
      setSoundEnabled,
      getModeColor,
      getModeLabel,
      sessionInProgress
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
