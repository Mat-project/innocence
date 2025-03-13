import React, { useState, useEffect } from 'react';

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
    '#4287f5', // blue
    '#f54242', // red
    '#42f56f', // green
    '#f5d142', // yellow
    '#f542f2', // pink
    '#42f5f5', // cyan
    '#f5a142', // orange
    '#9442f5'  // purple
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
    setHabits(habits.filter(habit => habit.id !== habitId));
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
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">HabitTracker</h1>
            <span className="bg-indigo-800 px-3 py-1 rounded text-xs ml-3">PRO</span>
          </div>
          <div className="flex space-x-4">
            <button 
              className="px-4 py-2 rounded-md transition-all ${yearView ? 'bg-indigo-500' : 'bg-transparent border border-white'}"
              onClick={() => setYearView(!yearView)}
            >
              Year View
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className="flex-1 py-4 text-lg ${activeTab === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}"
            onClick={() => setActiveTab('all')}
          >
            All Habits
          </button>
          <button 
            className="flex-1 py-4 text-lg ${activeTab === 'stats' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}"
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
        </div>
        
        {/* Add new habit form */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Add a new habit..."
              className="flex-1 p-3 border rounded-md text-lg"
            />
            
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-md cursor-pointer"
                style={{ backgroundColor: selectedColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              
              {showColorPicker && (
                <div className="absolute right-0 mt-2 p-3 bg-white border rounded-lg shadow-lg z-10">
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <div 
                        key={color}
                        className="w-8 h-8 rounded cursor-pointer border"
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
              className="bg-indigo-600 text-white p-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Habit
            </button>
          </div>
        </div>
        
        {/* Habits list */}
        {activeTab === 'all' && (
          <div className="divide-y">
            {habits.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-lg">
                No habits yet. Add one to get started!
              </div>
            ) : (
              habits.map(habit => {
                const currentMonthIndex = getCurrentMonthIndex();
                const currentMonth = habit.monthsData[currentMonthIndex];
                const { day, month } = getCurrentDateInfo();
                
                return (
                  <div key={habit.id} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <h3 className="text-xl font-semibold">{habit.name}</h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <span className="bg-gray-200 px-2 py-1 rounded">
                            {habit.currentStreak} day streak
                          </span>
                          <span className="bg-gray-200 px-2 py-1 rounded">
                            {habit.streakConsistency}% consistent
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteHabit(habit.id)}
                        className="text-gray-400 hover:text-red-500 text-xl"
                      >
                        ×
                      </button>
                    </div>
                    
                    {!yearView ? (
                      // Month view
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm text-gray-600 font-medium">
                            {currentMonth.name} - Active: {currentMonth.active} days - Best Streak: {currentMonth.maxStreak} days
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mb-3">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="text-xs text-center text-gray-500 font-medium">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {currentMonth.days.map((checked, dayIndex) => {
                            const isToday = dayIndex === day && currentMonthIndex === month;
                            return (
                              <div
                                key={dayIndex}
                                className={`aspect-square rounded-sm cursor-pointer flex items-center justify-center ${
                                  isToday && !checked ? 'border-2 border-indigo-400' : ''
                                }`}
                                style={{ 
                                  backgroundColor: checked ? habit.color : '#f0f0f0',
                                  opacity: getColorIntensity(checked)
                                }}
                                onClick={() => toggleDay(habit.id, currentMonthIndex, dayIndex)}
                              >
                                <span className="text-xs font-medium text-gray-700">
                                  {dayIndex + 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Year view (like the LeetCode contribution chart)
                      <div className="mb-4">
                        <div className="flex text-sm text-gray-600 mb-2">
                          {getMonthLabels().map((month, index) => (
                            <div key={index} className="flex-1 text-center">{month}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-52 gap-1 h-40">
                          {habit.monthsData.map((month, monthIndex) => (
                            <div key={monthIndex} className="grid grid-cols-1 gap-1">
                              {month.days.map((checked, dayIndex) => (
                                <div
                                  key={`${monthIndex}-${dayIndex}`}
                                  className="aspect-square rounded-sm cursor-pointer"
                                  style={{ 
                                    backgroundColor: checked ? habit.color : '#f0f0f0',
                                    opacity: getColorIntensity(checked)
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
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>
                        Total: {habit.totalActive} days · Current streak: {habit.currentStreak} days · Max streak: {habit.maxStreak} days
                      </div>
                      <div>
                        Last updated: {formatDate(habit.lastUpdate)}
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
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
            
            {habits.length === 0 ? (
              <div className="text-center text-gray-500 text-lg p-12">
                Add habits to see your stats
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {habits.map(habit => {
                  const streakQuality = calculateStreakQuality(habit);
                  
                  return (
                    <div key={habit.id} className="bg-gray-50 p-5 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <h3 className="text-xl font-medium">{habit.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-4 rounded border text-center">
                          <div className="text-3xl font-bold">{habit.totalActive}</div>
                          <div className="text-sm text-gray-500">Total Days</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded border text-center">
                          <div className="text-3xl font-bold">{habit.maxStreak}</div>
                          <div className="text-sm text-gray-500">Best Streak</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded border text-center">
                          <div className="text-3xl font-bold">
                            {habit.streakConsistency}%
                          </div>
                          <div className="text-sm text-gray-500">Consistency</div>
                        </div>
                      </div>
                      
                      {/* Additional streak metrics */}
                      <div className="bg-white p-4 rounded border mb-4">
                        <h4 className="font-medium mb-3">Streak Analysis</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{habit.currentStreak}</div>
                            <div className="text-sm text-gray-500">Current Streak</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold">{streakQuality}%</div>
                            <div className="text-sm text-gray-500">Streak Quality</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Consistency Progress</span>
                            <span>{habit.streakConsistency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{
                                width:`${habit.streakConsistency}%`,
                                backgroundColor: habit.color
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Monthly breakdown */}
                      <div className="bg-white p-4 rounded border">
                        <h4 className="font-medium mb-3">Monthly Activity</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {habit.monthsData.map((month, index) => (
                            <div key={index} className="text-center">
                              <div className="text-sm font-medium">{month.name}</div>
                              <div className="flex items-end justify-center h-24 mt-2">
                                <div 
                                  className="w-6 rounded-t-sm" 
                                  style={{ 
                                    height:`${(month.active / 31) * 100}%`,
                                    backgroundColor: habit.color,
                                    minHeight: '2px'
                                  }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{month.active} days</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Overall Stats */}
                <div className="bg-indigo-50 p-5 rounded-lg md:col-span-2">
                  <h3 className="text-xl font-medium mb-4">Overall Stats</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded border text-center">
                      <div className="text-3xl font-bold">
                        {habits.reduce((sum, habit) => sum + habit.totalActive, 0)}
                      </div>
                      <div className="text-sm text-gray-500">Total Check-ins</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border text-center">
                      <div className="text-3xl font-bold">
                        {Math.max(...habits.map(habit => habit.maxStreak), 0)}
                      </div>
                      <div className="text-sm text-gray-500">Best Streak</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border text-center">
                      <div className="text-3xl font-bold">
                        {Math.round(habits.reduce((sum, habit) => sum + habit.streakConsistency, 0) / habits.length) || 0}%
                      </div>
                      <div className="text-sm text-gray-500">Avg. Consistency</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded border text-center">
                      <div className="text-3xl font-bold">
                        {habits.length}
                      </div>
                      <div className="text-sm text-gray-500">Active Habits</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <div className="text-gray-500 text-sm">
            HabitStreak from TaskVerse - Track your progress, build consistency
          </div>
          <div className="text-indigo-600 text-sm font-medium">
            v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;