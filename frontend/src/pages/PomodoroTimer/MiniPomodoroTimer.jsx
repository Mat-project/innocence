import React, { useEffect } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { usePomodoro } from '../../context/PomodoroContext';
import { Link } from 'react-router-dom';

const MiniPomodoroTimer = () => {
  const { 
    isActive, 
    timeLeft, 
    mode, 
    formatTime, 
    toggleTimer,
    skipToNext,
    getModeColor,
    getModeLabel
  } = usePomodoro();

  // Debug log to check if component is rendering and timer is active
  useEffect(() => {
    console.log('MiniPomodoroTimer rendered, isActive:', isActive);
  }, [isActive]);

  // Restore the conditional return to only show when timer is active
  if (!isActive) return null;

  return (
    <div className="fixed bottom-0 right-0 mb-4 mr-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center space-x-3">
        <Link 
          to="/pomodoro-timer"
          className={`flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium text-white ${getModeColor()}`}
        >
          {getModeLabel()}
        </Link>
        
        <span className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200">
          {formatTime(timeLeft)}
        </span>
        
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTimer();
            }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipToNext();
            }}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPomodoroTimer;
