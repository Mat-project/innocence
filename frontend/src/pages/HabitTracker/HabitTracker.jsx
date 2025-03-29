import React, { useState, useEffect } from 'react';
import { Calendar, Check, Trash2, BarChart2, ChevronRight, Plus, X, Calendar as CalendarIcon } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4287f5');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [yearView, setYearView] = useState(false);

  // Load habits from localStorage on initial render
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const colors = [
    '#4338ca', // indigo-700
    '#e11d48', // rose-600
    '#16a34a', // green-600
    '#ca8a04', // yellow-600
    '#9333ea', // purple-600
    '#0891b2', // cyan-600
    '#ea580c', // orange-600
    '#2563eb'  // blue-600
  ];

  const getEmptyYearData = () => {
    // Get current date info
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create month data for the current year
    return Array(12).fill().map((_, monthIndex) => {
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      return {
        name: new Date(currentYear, monthIndex).toLocaleString('default', { month: 'short' }),
        days: Array(daysInMonth).fill(false),
        active: 0,
        maxStreak: 0
      };
    });
  };

  const addHabit = () => {
    if (newHabitName.trim() === '') return;
    
    const today = new Date();
    
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      color: selectedColor,
      monthsData: getEmptyYearData(),
      createdAt: today.toISOString(),
      totalActive: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastUpdate: null,
      streakRatio: 0,
      streakConsistency: 0
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setShowColorPicker(false);
  };

  const calculateStreakMetrics = (days) => {
    let maxStreak = 0;
    let currentStreak = 0;
    let totalStreaks = 0;
    let streakDays = 0;
    
    // Calculate max streak and gather streak information
    let inStreak = false;
    
    for (let i = 0; i < days.length; i++) {
      if (days[i]) {
        if (!inStreak) {
          inStreak = true;
          totalStreaks++;
        }
        currentStreak++;
        streakDays++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
        inStreak = false;
      }
    }
    
    // Calculate streak consistency
    const totalDays = days.length;
    const activeCount = days.filter(day => day).length;
    const streakRatio = totalDays > 0 ? streakDays / totalDays : 0;
    
    // A perfect consistency would be one continuous streak
    const streakConsistency = totalDays > 0 ? 
      (activeCount > 0 ? 
        ((totalStreaks === 1 ? activeCount : maxStreak) / totalDays) * 100 : 0) : 0;
    
    // Check if we're currently in a streak (for current streak calculation)
    let currentActiveStreak = 0;
    
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i]) {
        currentActiveStreak++;
      } else {
        break;
      }
    }
    
    return { 
      maxStreak, 
      currentStreak: currentActiveStreak, 
      totalStreaks,
      streakRatio,
      streakConsistency: Math.round(streakConsistency)
    };
  };

  const toggleDay = (habitId, monthIndex, dayIndex) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newMonthsData = [...habit.monthsData];
        newMonthsData[monthIndex].days[dayIndex] = !newMonthsData[monthIndex].days[dayIndex];
        
        // Calculate active days and streaks
        let totalActive = 0;
        let allDays = [];
        
        // Flatten all days into a single array for streak calculation
        newMonthsData.forEach(month => {
          let monthActive = 0;
          
          month.days.forEach(day => {
            if (day) {
              monthActive++;
            }
            allDays.push(day);
          });
          
          month.active = monthActive;
          totalActive += monthActive;
        });
        
        // Calculate streak metrics from all days
        const { maxStreak, currentStreak, streakRatio, streakConsistency } = calculateStreakMetrics(allDays);
        
        // Calculate month-specific streaks
        newMonthsData.forEach(month => {
          const monthStreaks = calculateStreakMetrics(month.days);
          month.maxStreak = monthStreaks.maxStreak;
        });
        
        return {
          ...habit,
          monthsData: newMonthsData,
          totalActive,
          currentStreak,
          maxStreak,
          lastUpdate: new Date().toISOString(),
          streakRatio,
          streakConsistency
        };
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId) => {
    if (window.confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      setHabits(habits.filter(habit => habit.id !== habitId));
    }
  };

  const getCurrentMonthIndex = () => {
    return new Date().getMonth();
  };

  const getCurrentDateInfo = () => {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate() - 1 // Adjust to 0-based index
    };
  };

  // Calculate streak quality - how much of your active days are part of good streaks
  const calculateStreakQuality = (habit) => {
    if (habit.totalActive === 0) return 0;
    return Math.round((habit.maxStreak / habit.totalActive) * 100);
  };

  // Generate month labels for the calendar view
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months;
  };

  // Format date in a more readable way
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get intensity of the color based on streak 
  const getColorIntensity = (isActive) => {
    return isActive ? 1 : 0.1;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Habit Tracker</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setYearView(!yearView)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              yearView 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
            } transition-colors duration-200`}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            {yearView ? 'Year View' : 'Month View'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 ${
            activeTab === 'all' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Habits
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 ${
            activeTab === 'stats' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      {/* Add new habit form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add a new habit to track..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addHabit();
              }
            }}
          />
          
          <div className="relative">
            <div 
              className="h-10 w-10 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: selectedColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            
            {showColorPicker && (
              <div className="absolute right-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(color => (
                    <div 
                      key={color}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={addHabit}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Habit
          </button>
        </div>
      </div>
      
      {/* Habits list */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No habits tracked yet</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Start building better habits by adding your first habit to track
              </p>
              <button
                onClick={() => document.querySelector('input[type="text"]').focus()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Your First Habit
              </button>
            </div>
          ) : (
            habits.map(habit => {
              const currentMonthIndex = getCurrentMonthIndex();
              const currentMonth = habit.monthsData[currentMonthIndex];
              const { day, month } = getCurrentDateInfo();
              
              return (
                <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="h-5 w-5 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{habit.name}</h3>
                      
                      <div className="hidden sm:flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {habit.currentStreak} day streak
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {habit.streakConsistency}% consistent
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-full"
                      aria-label="Delete habit"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    {!yearView ? (
                      // Month view
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {currentMonth.name} - Active: {currentMonth.active} days - Best Streak: {currentMonth.maxStreak} days
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, i) => (
                            <div key={i} className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                              {dayName}
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {currentMonth.days.map((checked, dayIndex) => {
                            const isToday = dayIndex === day && currentMonthIndex === month;
                            return (
                              <div
                                key={dayIndex}
                                onClick={() => toggleDay(habit.id, currentMonthIndex, dayIndex)}
                                className={`
                                  aspect-square rounded-md cursor-pointer flex items-center justify-center relative
                                  ${isToday && !checked ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                                  ${checked ? 'bg-opacity-90 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                                `}
                                style={{ 
                                  backgroundColor: checked ? habit.color : undefined
                                }}
                              >
                                <span className={`text-xs font-medium ${checked ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {dayIndex + 1}
                                </span>
                                {checked && (
                                  <Check className="absolute right-0 bottom-0 h-3 w-3 text-white" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Year view
                      <div>
                        <div className="flex text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {getMonthLabels().map((month, index) => (
                            <div key={index} className="flex-1 text-center">{month}</div>
                          ))}
                        </div>
                        
                        <div className="grid grid-rows-12 grid-flow-col gap-1 h-48">
                          {habit.monthsData.map((month, monthIndex) => (
                            <div key={monthIndex} className="flex flex-wrap gap-1">
                              {month.days.map((checked, dayIndex) => (
                                <div
                                  key={`${monthIndex}-${dayIndex}`}
                                  className={`h-3 w-3 rounded-sm cursor-pointer transition-colors
                                    ${checked ? 'shadow-sm' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                                  `}
                                  style={{ 
                                    backgroundColor: checked ? habit.color : undefined,
                                  }}
                                  onClick={() => toggleDay(habit.id, monthIndex, dayIndex)}
                                  title={`${month.name} ${dayIndex+1}: ${checked ? 'Completed' : 'Not completed'}`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="inline-block mr-3">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span> {habit.totalActive} days
                        </span>
                        <span className="inline-block mr-3">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Current streak:</span> {habit.currentStreak} days
                        </span>
                        <span className="inline-block">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Max streak:</span> {habit.maxStreak} days
                        </span>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        Last updated: {formatDate(habit.lastUpdate)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      
      {/* Stats view */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-indigo-500" />
              Your Progress
            </h2>
            
            {habits.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Add habits to see your statistics
              </div>
            ) : (
              <>
                {/* Overall Stats */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Overall Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {habits.reduce((sum, habit) => sum + habit.totalActive, 0)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Check-ins</div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {Math.max(...habits.map(habit => habit.maxStreak), 0)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Best Streak</div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {Math.round(habits.reduce((sum, habit) => sum + habit.streakConsistency, 0) / habits.length) || 0}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Consistency</div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {habits.length}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Active Habits</div>
                    </div>
                  </div>
                </div>
                
                {/* Individual Habit Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {habits.map(habit => {
                    const streakQuality = calculateStreakQuality(habit);
                    
                    return (
                      <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          />
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white">{habit.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-xl font-bold text-gray-800 dark:text-white">{habit.totalActive}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Days</div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-xl font-bold text-gray-800 dark:text-white">{habit.maxStreak}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Best Streak</div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                              {habit.streakConsistency}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Consistency</div>
                          </div>
                        </div>
                        
                        {/* Streak metrics */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Streak Analysis</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-800 dark:text-white">{habit.currentStreak}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Current Streak</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-800 dark:text-white">{streakQuality}%</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Streak Quality</div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-700 dark:text-gray-300">Consistency Progress</span>
                              <span className="text-gray-700 dark:text-gray-300">{habit.streakConsistency}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full" 
                                style={{
                                  width:`${habit.streakConsistency}%`,
                                  backgroundColor: habit.color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Monthly activity */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Activity</h4>
                          <div className="grid grid-cols-4 gap-1">
                            {habit.monthsData.slice(0, 12).map((month, index) => (
                              <div key={index} className="text-center">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{month.name}</div>
                                <div className="flex items-end justify-center h-16 mt-1">
                                  <div 
                                    className="w-4 rounded-t-sm" 
                                    style={{ 
                                      height:`${(month.active / 31) * 100}%`,
                                      backgroundColor: habit.color,
                                      minHeight: '2px'
                                    }}
                                  />
                                </div>
                                <div className="text-xxs text-gray-500 dark:text-gray-400 mt-1">{month.active}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;