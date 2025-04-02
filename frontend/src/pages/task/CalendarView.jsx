import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import { taskAPI } from "../../service/api";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Tag,
  User,
  Loader,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Priority colors with enhanced contrast for both modes
const priorityColors = {
  low: {
    light: "#10B981",      // Green
    dark: "#34D399"        // Lighter green for dark mode
  },
  medium: {
    light: "#F59E0B",      // Amber
    dark: "#FBBF24"        // Brighter amber for dark mode
  },
  high: {
    light: "#EF4444",      // Red
    dark: "#F87171"        // Lighter red for dark mode
  }
};

// Enhanced priority classes with better contrast
const priorityClasses = {
  low: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
  medium: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
  high: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50",
};

// Improved status icons with consistent sizing
const statusIcons = {
  todo: <Clock className="w-4 h-4" />,
  inprogress: <ArrowRight className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />
};

// Enhanced status classes with better contrast
const statusClasses = {
  todo: "bg-gray-100 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300",
  inprogress: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  completed: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
};

// Formatted status display text
const getStatusText = (status) => {
  switch (status) {
    case 'todo': return 'To Do';
    case 'inprogress': return 'In Progress';
    case 'completed': return 'Completed';
    default: return status;
  }
};

// Enhanced EventDetailModal with centered positioning for all screen sizes
const EventDetailModal = ({ event, onClose, onEdit }) => {
  const task = event.extendedProps;
  const dueDate = event.start ? moment(event.start).format("LLL") : "No due date";
  const isPastDue = task.due_date && moment(task.due_date).isBefore(moment(), 'day') && task.status !== 'completed';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      {/* Modal content - centered on all screen sizes with proper max-height */}
      <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full sm:max-w-md animate-scaleIn 
                    flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        {/* Header - fixed at top */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 rounded-t-lg">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex-1">
            Task Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - now scrollable with better spacing for mobile */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-800 overflow-y-auto flex-grow">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h2>
            
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses[task.status]}`}>
                {statusIcons[task.status]}
                {getStatusText(task.status)}
              </span>
              
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priorityClasses[task.priority]}`}>
                <AlertCircle className="w-4 h-4" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>
          </div>
          
          {/* Due date with better mobile spacing */}
          <div className="mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</div>
            <div className={`text-sm sm:text-base ${isPastDue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-gray-100'}`}>
              <Clock className="w-4 h-4 inline-block mr-1 opacity-70" />
              {dueDate}
              {isPastDue && " (Overdue)"}
            </div>
          </div>
          
          {/* Description - now will scroll if too long */}
          {task.description && (
            <div className="mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</div>
              <p className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}
          
          {/* Additional metadata in single column for mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
            {task.category && (
              <div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</div>
                <div className="flex items-center text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 opacity-70" />
                  {task.category}
                </div>
              </div>
            )}
            
            {task.assigned_to && (
              <div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned To</div>
                <div className="flex items-center text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 opacity-70" />
                  {task.assigned_to}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions - fixed at bottom with larger touch targets */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md mr-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(task);
              onClose();
            }}
            className="px-4 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            Edit Task
          </button>
        </div>
      </div>

      {/* Update animation styles */}
      <style jsx global>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default function CalendarView({ tasks = [], onEdit, refreshFlag }) {
  const [allTasks, setAllTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const calendarRef = useRef(null);

  // Detect system theme and handle theme changes automatically
  useEffect(() => {
    // Function to check system dark mode preference
    const checkSystemTheme = () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    // Initialize dark mode state based on system preference
    const isDark = checkSystemTheme();
    setDarkMode(isDark);
    updateDocumentClass(isDark);
    
    // Watch for system theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (event) => {
      const newDarkMode = event.matches;
      setDarkMode(newDarkMode);
      updateDocumentClass(newDarkMode);
      
      // Update calendar when theme changes
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        setTimeout(() => {
          calendarApi.updateSize();
        }, 100);
      }
    };

    // Add event listener for theme changes
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleThemeChange);
    } else {
      // Fallback for older browsers
      darkModeMediaQuery.addListener(handleThemeChange);
    }
    
    return () => {
      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        darkModeMediaQuery.removeListener(handleThemeChange);
      }
    };
  }, []);

  // Helper function to update document class
  const updateDocumentClass = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks();
      setAllTasks(response.data || []);
    } catch (err) {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Process tasks from props or fetch them if not provided
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setAllTasks(tasks);
    } else {
      fetchTasks();
    }
  }, [tasks, refreshFlag]);

  // Apply filters and map tasks to calendar events with theme-aware colors
  useEffect(() => {
    if (allTasks.length) {
      const today = moment();
      const filtered = allTasks.filter((task) => {
        const statusMatch = filterStatus === "all" ? true : task.status === filterStatus;
        const priorityMatch = filterPriority === "all" ? true : task.priority === filterPriority;
        return statusMatch && priorityMatch;
      });
      
      const events = filtered.map((task) => {
        let start;
        if (task.status === "completed" && task.updated_at) {
          start = moment(task.updated_at).toDate();
        } else {
          start = task.due_date
            ? moment(task.due_date).toDate()
            : today.toDate();
        }
        
        // Get the appropriate color based on current theme
        const themeMode = darkMode ? 'dark' : 'light';
        let backgroundColor = priorityColors[task.priority][themeMode] || "#6366F1";
        let textColor = "#FFFFFF";
        let borderColor = backgroundColor;
        
        // Adjust opacity for completed tasks
        if (task.status === "completed") {
          backgroundColor = `${backgroundColor}80`;
          borderColor = `${backgroundColor}A0`;
        }

        return {
          id: task.id,
          title: task.title,
          start,
          backgroundColor,
          borderColor,
          textColor,
          classNames: [`task-${task.status}`, `priority-${task.priority}`],
          extendedProps: { ...task },
        };
      });
      
      setCalendarEvents(events);

      // Calculate upcoming tasks (next 7 days and not completed)
      const upcoming = allTasks.filter(task => {
        if (task.status === "completed") return false;
        if (task.due_date) {
          const due = moment(task.due_date);
          const diff = due.diff(today, "days");
          return diff >= 0 && diff <= 7;
        }
        return false;
      }).sort((a, b) => {
        return moment(a.due_date).diff(moment(b.due_date));
      });
      
      setUpcomingTasks(upcoming);
    }
  }, [allTasks, filterStatus, filterPriority, darkMode]);

  // Apply custom calendar styles when component mounts or theme changes
  useEffect(() => {
    // Inject new styles
    injectCalendarStyles();
    
    // Apply direct DOM styles for better compatibility
    const applyThemeStyles = () => {
      setTimeout(() => {
        if (darkMode) {
          // Fix headers in dark mode
          document.querySelectorAll('.fc-col-header-cell').forEach(cell => {
            cell.style.backgroundColor = '#1f2937';
          });
          
          document.querySelectorAll('.fc-col-header-cell-cushion').forEach(text => {
            text.style.color = '#ffffff';
          });
          
          // Fix day numbers in dark mode
          document.querySelectorAll('.fc-daygrid-day-number').forEach(number => {
            number.style.color = '#ffffff';
            number.style.fontWeight = '500';
          });
          
          // Fix today's highlight
          document.querySelectorAll('.fc-day-today .fc-daygrid-day-number').forEach(todayNumber => {
            todayNumber.style.backgroundColor = '#4338ca';
            todayNumber.style.color = '#ffffff';
            todayNumber.style.fontWeight = '600';
          });
        } else {
          // Fix headers in light mode
          document.querySelectorAll('.fc-col-header-cell').forEach(cell => {
            cell.style.backgroundColor = '#f9fafb';
          });
          
          document.querySelectorAll('.fc-col-header-cell-cushion').forEach(text => {
            text.style.color = '#4b5563';
          });
          
          // Fix day numbers in light mode
          document.querySelectorAll('.fc-daygrid-day-number').forEach(number => {
            number.style.color = '#4b5563';
            number.style.fontWeight = '500';
          });
          
          // Fix today's highlight
          document.querySelectorAll('.fc-day-today .fc-daygrid-day-number').forEach(todayNumber => {
            todayNumber.style.backgroundColor = '#4f46e5';
            todayNumber.style.color = '#ffffff';
            todayNumber.style.fontWeight = '600';
          });
        }
      }, 100);
    };
    
    // Apply styles immediately
    applyThemeStyles();
    
    // Set up observer to watch for calendar re-renders
    const observer = new MutationObserver(() => {
      // Apply theme styles when calendar elements change
      if (document.querySelector('.fc')) {
        applyThemeStyles();
      }
    });
    
    // Observe calendar container for changes
    const calendarContainer = document.querySelector('.calendar-container');
    if (calendarContainer) {
      observer.observe(calendarContainer, { childList: true, subtree: true });
    }
    
    // Clean up
    return () => {
      observer.disconnect();
      
      // Remove custom styles
      const styleElement = document.getElementById('custom-calendar-styles');
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [darkMode]);

  // Responsive handling for window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) {
        setShowMobileSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Restore the mobile toggle button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Task Calendar
        </div>
        
        <button 
          className="lg:hidden sm:text-sm md:text-lg flex text-sm items-center px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md shadow-sm"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        >
          {showMobileSidebar ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Upcoming Tasks
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show Upcoming Tasks ({upcomingTasks.length})
            </>
          )}
        </button>
      </div>
      
      {/* Mobile Upcoming Tasks Section (Collapsible) */}
      {showMobileSidebar && (
        <div className="lg:hidden bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-4 animate-fadeIn">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
              </div>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md">
                Next 7 days
              </span>
            </div>
          </div>
          
          <div className="p-3 max-h-72 overflow-y-auto">
            <UpcomingTasksList 
              tasks={upcomingTasks} 
              loading={loading} 
              onTaskClick={onEdit}
              darkMode={darkMode} 
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Calendar */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filter Panel with enhanced styling */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                  Status:
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                  Priority:
                </span>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Calendar */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center h-[600px]">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
                  <span className="mt-4 text-gray-600 dark:text-gray-300">Loading calendar...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-[600px] text-red-500">
                <AlertCircle className="w-6 h-6 mr-2" />
                {error}
              </div>
            ) : (
              <div className="calendar-container rounded-lg overflow-hidden">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  events={calendarEvents}
                  eventClick={(info) => setSelectedEvent(info.event)}
                  height="600px"
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: 'short'
                  }}
                  buttonText={{
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day'
                  }}
                  dayMaxEvents={true}
                  firstDay={1} // Start week on Monday
                  themeSystem="standard"
                  className={`fc-calendar-fixed ${darkMode ? 'dark-calendar' : ''}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks Sidebar - Desktop Only */}
        <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden h-fit">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
              </div>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md">
                Next 7 days
              </span>
            </div>
          </div>
          
          <div className="p-3 max-h-[570px] overflow-y-auto">
            <UpcomingTasksList 
              tasks={upcomingTasks} 
              loading={loading} 
              onTaskClick={onEdit}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onEdit={onEdit}
        />
      )}
    </div>
  );
}

// Enhanced Upcoming Tasks component for reuse
const UpcomingTasksList = ({ tasks, loading, onTaskClick, darkMode }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8 text-gray-500 dark:text-gray-400">
        <CalendarIcon className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-medium">No upcoming tasks</p>
        <p className="text-xs mt-1">All caught up for the next 7 days!</p>
      </div>
    );
  }
  
  return (
    <ul className="space-y-2 upcoming-tasks-mobile">
      {tasks.map((task) => {
        const dueDate = moment(task.due_date);
        const isToday = dueDate.isSame(moment(), 'day');
        const isTomorrow = dueDate.isSame(moment().add(1, 'days'), 'day');
        const isPastDue = dueDate.isBefore(moment(), 'day');
        
        let dateDisplay;
        if (isToday) {
          dateDisplay = <span className="font-medium text-amber-600 dark:text-amber-400">Today</span>;
        } else if (isTomorrow) {
          dateDisplay = <span className="font-medium text-indigo-600 dark:text-indigo-400">Tomorrow</span>;
        } else if (isPastDue) {
          dateDisplay = <span className="font-medium text-red-600 dark:text-red-400">Overdue: {dueDate.format("MMM D")}</span>;
        } else {
          dateDisplay = dueDate.format("MMM D");
        }
        
        return (
          <li
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer bg-white dark:bg-gray-800 task-item-mobile"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                {task.title}
              </h4>
              <div 
                className="w-2.5 h-2.5 rounded-full ml-2 flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
                style={{ backgroundColor: priorityColors[task.priority] }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 task-metadata">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {dateDisplay}
              </div>
              
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusClasses[task.status]}`}>
                {getStatusText(task.status)}
              </span>
            </div>
            
            {task.description && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1 bg-white dark:bg-gray-800 task-description">
                {task.description}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// This replaces the injectCalendarStyles function with a complete version

const injectCalendarStyles = () => {
  const styleId = 'custom-calendar-styles';
  
  // Remove existing style if it exists to prevent any conflicts
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.parentNode.removeChild(existingStyle);
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* Base calendar styles */
    .fc-theme-standard .fc-scrollgrid {
      border-radius: 0.5rem;
      overflow: hidden;
      border: none !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    /* Calendar header (toolbar) */
    .fc .fc-toolbar {
      margin-bottom: 1rem !important;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 0.25rem;
    }
    
    .fc .fc-toolbar-title {
      font-size: 1.25rem !important;
      font-weight: 600 !important;
      color: #1f2937;
    }
    
    /* Button styles */
    .fc-header-toolbar .fc-button {
      box-shadow: none !important;
      border-color: #d1d5db !important;
      border-radius: 0.375rem !important;
      height: 2.25rem !important;
      padding: 0 0.75rem !important;
      font-size: 0.875rem !important;
      font-weight: 500 !important;
      text-transform: none !important;
      transition: all 0.2s !important;
    }
    
    .fc-header-toolbar .fc-button-primary {
      background-color: #f9fafb !important;
      color: #374151 !important;
    }
    
    .fc-header-toolbar .fc-button-primary:not(.fc-button-active):hover {
      background-color: #f3f4f6 !important;
    }
    
    .fc-header-toolbar .fc-button-primary.fc-button-active {
      background-color: #4f46e5 !important;
      color: #fff !important;
      border-color: #4338ca !important;
    }
    
    /* Button group spacing */
    .fc .fc-button-group {
      gap: 4px !important;
    }
    
    /* Weekday headers */
    .fc-col-header-cell {
      padding: 10px 0 !important;
      background-color: #f9fafb !important;
      font-weight: 600 !important;
    }
    
    .fc-col-header-cell-cushion {
      color: #4b5563 !important;
      font-weight: 600 !important;
      text-decoration: none !important;
      padding: 6px 0 !important;
    }
    
    /* Day cells */
    .fc .fc-daygrid-day-frame {
      padding: 6px !important;
    }
    
    .fc .fc-daygrid-day-top {
      justify-content: center;
      padding-top: 3px;
    }
    
    .fc .fc-daygrid-day-number {
      font-weight: 500 !important;
      font-size: 0.875rem !important;
      text-decoration: none !important;
      color: #4b5563 !important;
      margin: 0 !important;
      padding: 2px 6px !important;
      border-radius: 0.25rem !important;
      transition: background-color 0.2s !important;
    }
    
    .fc .fc-daygrid-day-number:hover {
      background-color: rgba(0,0,0,0.05) !important;
    }
    
    /* Today's date */
    .fc-day-today {
      background-color: rgba(99, 102, 241, 0.08) !important;
    }
    
    .fc-day-today .fc-daygrid-day-number {
      background-color: #4f46e5 !important;
      color: #ffffff !important;
      font-weight: 600 !important;
    }
    
    /* Events styling */
    .fc-daygrid-event {
      border-radius: 0.25rem !important;
      font-size: 0.75rem !important;
      padding: 2px 6px !important;
      margin-top: 2px !important;
      border: none !important;
    }
    
    .fc-event-title {
      font-weight: 500 !important;
    }
    
    /* Other month day styling */
    .fc .fc-daygrid-day-top {
      opacity: 0.6;
    }
    
    /* Time grid specific styles */
    .fc-timegrid-slot {
      height: 2.5rem !important;
    }
    
    .fc-timegrid-axis {
      padding: 0.5rem !important;
    }
    
    /* Animation for events */
    .fc-event {
      transition: transform 0.1s ease-out, box-shadow 0.1s ease;
    }
    
    .fc-event:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 10;
    }
    
    /* DARK MODE STYLES */
    .dark .fc .fc-toolbar-title {
      color: #f3f4f6;
    }
    
    /* Dark mode buttons */
    .dark .fc-header-toolbar .fc-button-primary {
      background-color: #1f2937 !important;
      color: #e5e7eb !important;
      border-color: #374151 !important;
    }
    
    .dark .fc-header-toolbar .fc-button-primary:not(.fc-button-active):hover {
      background-color: #374151 !important;
    }
    
    .dark .fc-header-toolbar .fc-button-primary.fc-button-active {
      background-color: #4f46e5 !important;
      color: #fff !important;
      border-color: #4338ca !important;
    }
    
    /* Dark mode grid and borders */
    .dark .fc-theme-standard .fc-scrollgrid,
    .dark .fc-theme-standard td,
    .dark .fc-theme-standard th {
      border-color: #374151 !important;
    }
    
    /* Weekday headers in dark mode */
    .dark .fc-col-header-cell,
    .dark .fc-theme-standard thead th,
    .dark .fc-scrollgrid-sync-table thead,
    .dark .fc-theme-standard .fc-col-header {
      background-color: #1f2937 !important;
    }
    
    .dark .fc-col-header-cell-cushion {
      color: #ffffff !important;
    }
    
    /* Fix for dark mode day number colors */
    .dark .fc .fc-daygrid-day-number {
      color: #ffffff !important; 
      background-color: transparent !important;
    }
    
    .dark .fc .fc-daygrid-day-number:hover {
      background-color: rgba(255,255,255,0.1) !important;
    }
    
    /* Background for day cells in dark mode */
    .dark .fc .fc-daygrid-day {
      background-color: #1f2937 !important;
    }
    
    .dark .fc .fc-day-other {
      background-color: #111827 !important;
    }
    
    /* Today highlight in dark mode */
    .dark .fc .fc-day-today {
      background-color: rgba(79, 70, 229, 0.2) !important;
    }
    
    .dark .fc-day-today .fc-daygrid-day-number {
      background-color: #4338ca !important;
      color: #ffffff !important;
    }
    
    /* Event styles in dark mode */
    .dark .fc-event {
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    .dark .fc-event:hover {
      box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }
    
    /* Time grid in dark mode */
    .dark .fc-timegrid-slot,
    .dark .fc-timegrid-axis {
      background-color: #1f2937 !important;
    }
    
    .dark .fc-timegrid-body,
    .dark .fc-timegrid-axis,
    .dark .fc-timegrid-slot {
      border-color: #374151 !important;
    }
    
    /* List view in dark mode */
    .dark .fc-list-day-cushion {
      background-color: #1f2937 !important;
    }
    
    .dark .fc-list-event:hover td {
      background-color: #374151 !important;
    }
    
    /* Responsive adjustments */
    @media screen and (max-width: 640px) {
      .fc .fc-toolbar {
        flex-direction: column;
        align-items: center;
      }
      
      .fc .fc-toolbar-chunk {
        margin-bottom: 8px;
      }
      
      .fc .fc-daygrid-day-number {
        padding: 1px 4px !important;
        font-size: 0.75rem !important;
      }
    }

    /* Ensure all popups and popovers have proper dark mode styling */
    .dark .fc-popover,
    .dark .fc-popover-header,
    .dark .fc-popover-body {
      background-color: #1f2937 !important;
      color: #f3f4f6 !important;
      border-color: #374151 !important;
    }

    /* Ensure all expanded content areas follow dark theme */
    .dark .fc-more-popover,
    .dark .fc-popover .fc-popover-body {
      background-color: #1f2937 !important;
      color: #f3f4f6 !important;
    }

    /* Fix event list in popovers */
    .dark .fc-popover .fc-event {
      background-color: #374151 !important;
      border-color: #4B5563 !important;
    }

    /* Ensure any expanded sections use dark backgrounds */
    .dark .fc-daygrid-more-link {
      color: #60a5fa !important; /* bright blue for better visibility */
    }

    /* Fix event display on small screens */
    @media screen and (max-width: 768px) {
      /* Prevent events from overlapping into other columns */
      .fc-daygrid-event-harness {
        width: 100% !important;
        left: 0 !important;
        right: 0 !important;
      }
      
      /* Make events more compact */
      .fc-daygrid-event {
        padding: 1px 4px !important;
        font-size: 0.7rem !important;
        margin-top: 1px !important;
        max-width: 100% !important;
      }
      
      /* Force single-line truncation with ellipsis */
      .fc-event-title {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: block !important;
        max-width: calc(100% - 4px) !important;
      }
      
      /* Make day cells take exactly their allocated width */
      .fc .fc-daygrid-day {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* Ensure day frame contents stay within bounds */
      .fc .fc-daygrid-day-frame {
        padding: 2px !important;
        overflow: hidden !important;
        min-height: 3.5rem !important;
      }
      
      /* Improve visibility of more links */
      .fc-daygrid-more-link {
        background-color: rgba(99, 102, 241, 0.1) !important;
        border-radius: 4px !important;
        padding: 1px 3px !important;
        margin-top: 1px !important;
        font-size: 0.7rem !important;
        text-align: center !important;
        display: block !important;
      }
      
      /* Improve space usage in week and day views */
      .fc-timegrid-event {
        padding: 1px 2px !important;
        border-radius: 2px !important;
      }
      
      .fc-timegrid-event .fc-event-main {
        padding: 0 !important;
      }
      
      /* Fix overflow in more popover */
      .fc-more-popover {
        max-width: 90vw !important;
      }
      
      .fc-more-popover .fc-popover-body {
        max-width: 100% !important;
        overflow-x: hidden !important;
      }
    }
    
    /* Extra small screens need even more compact layout */
    @media screen and (max-width: 480px) {
      /* Make calendar even more compact */
      .fc .fc-toolbar {
        font-size: 0.9rem !important;
      }
      
      .fc .fc-toolbar-title {
        font-size: 1.1rem !important;
      }
      
      .fc-header-toolbar .fc-button {
        padding: 0 0.5rem !important;
        font-size: 0.8rem !important;
      }
      
      /* Day numbers even smaller */
      .fc .fc-daygrid-day-number {
        font-size: 0.75rem !important;
        padding: 1px 4px !important;
      }
      
      /* Minimize padding */
      .fc .fc-daygrid-day-frame {
        padding: 2px !important;
        min-height: 3rem !important;
      }
      
      /* Smaller header buttons */
      .fc .fc-toolbar-chunk:not(:first-child) {
        transform: scale(0.9);
        transform-origin: right;
      }
      
      /* Show abbreviated weekday names */
      .fc-col-header-cell-cushion {
        font-size: 0.7rem !important;
      }
    }
    
    /* Enhanced mobile styling with reduced font sizes for all elements */
    @media screen and (max-width: 768px) {
      /* General calendar text size reductions */
      .fc {
        font-size: 0.9rem !important;
      }
      
      /* Toolbar and header text */
      .fc .fc-toolbar-title {
        font-size: 1.1rem !important;
      }
      
      .fc-header-toolbar .fc-button {
        font-size: 0.75rem !important;
        padding: 0 0.5rem !important;
        height: 2rem !important;
      }
      
      /* Column headers (day names) */
      .fc-col-header-cell-cushion {
        font-size: 0.8rem !important;
        padding: 4px 0 !important;
      }
      
      /* Day numbers */
      .fc .fc-daygrid-day-number {
        font-size: 0.75rem !important;
        padding: 1px 4px !important;
      }
      
      /* Event text */
      .fc-daygrid-event {
        font-size: 0.65rem !important;
        padding: 1px 3px !important;
        line-height: 1.2 !important;
      }
      
      .fc-daygrid-event .fc-event-title {
        font-size: 0.65rem !important;
        font-weight: 500 !important;
      }
      
      /* "More" links */
      .fc-daygrid-more-link {
        font-size: 0.65rem !important;
        padding: 0px 2px !important;
      }
      
      /* Week/day view */
      .fc-timegrid-axis-cushion,
      .fc-timegrid-slot-label-cushion {
        font-size: 0.7rem !important;
      }
      
      .fc-timegrid-event .fc-event-title {
        font-size: 0.65rem !important;
      }
    }
    
    /* Even smaller screens (phone size) */
    @media screen and (max-width: 480px) {
      /* Further reduce sizes */
      .fc {
        font-size: 0.8rem !important;
      }
      
      .fc .fc-toolbar-title {
        font-size: 1rem !important;
      }
      
      .fc-header-toolbar .fc-button {
        font-size: 0.7rem !important;
        padding: 0 0.4rem !important;
        height: 1.8rem !important;
      }
      
      /* Day numbers even smaller */
      .fc .fc-daygrid-day-number {
        font-size: 0.7rem !important;
        width: auto !important;
        height: auto !important;
      }
      
      /* Minimize padding */
      .fc .fc-daygrid-day-frame {
        padding: 1px !important;
        min-height: 3rem !important;
      }
      
      /* Smaller header buttons */
      .fc .fc-toolbar-chunk:not(:first-child) {
        transform: scale(0.9);
        transform-origin: right;
      }
      
      /* Show abbreviated weekday names */
      .fc-col-header-cell-cushion {
        font-size: 0.7rem !important;
      }
    }
    
    /* Fix for Upcoming Tasks section on mobile */
    @media screen and (max-width: 768px) {
      .upcoming-tasks-mobile .task-item-mobile {
        font-size: 0.85rem !important;
      }
      
      .upcoming-tasks-mobile .task-metadata {
        font-size: 0.75rem !important;
      }
      
      .upcoming-tasks-mobile .task-description {
        font-size: 0.7rem !important;
      }
    }

    /* Consistent "more" events handling for all screen sizes */
    .fc-daygrid-more-link {
      background-color: rgba(99, 102, 241, 0.1) !important;
      border-radius: 4px !important;
      padding: 1px 4px !important;
      margin-top: 1px !important;
      font-size: 0.75rem !important;
      text-align: center !important;
      display: block !important;
      color: #4f46e5 !important;
    }
    
    .dark .fc-daygrid-more-link {
      background-color: rgba(99, 102, 241, 0.2) !important;
      color: #818cf8 !important;
    }
    
    /* Consistent event popover styling across all screen sizes */
    .fc-more-popover {
      border-radius: 0.5rem !important;
      overflow: hidden !important;
      border: 1px solid #e5e7eb !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      max-width: 300px !important;
      max-height: 400px !important;
    }
    
    .dark .fc-more-popover {
      background-color: #1f2937 !important;
      border-color: #374151 !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18) !important;
    }
    
    .fc-popover-header {
      padding: 0.5rem !important;
      font-weight: 600 !important;
      background: #f3f4f6 !important;
      color: #1f2937 !important;
    }
    
    .dark .fc-popover-header {
      background: #374151 !important;
      color: #f9fafb !important;
    }
    
    .fc-popover-body {
      padding: 0.5rem !important;
      max-height: 300px !important;
      overflow-y: auto !important;
    }
    
    /* Ensure consistent event styling in popovers */
    .fc-popover-body .fc-daygrid-event {
      margin: 2px 0 !important;
      padding: 3px 6px !important;
      border-radius: 4px !important;
    }
    
    /* Unified event appearance regardless of view or screen size */
    .fc-event {
      border-radius: 4px !important;
      padding: 2px 4px !important;
      margin: 1px 0 !important;
      border: none !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
      overflow: hidden !important;
    }
    
    .fc-event-title {
      font-weight: 500 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      display: block !important;
      font-size: 0.75rem !important;
    }
    
    /* Force events to not get too wide on large screens */
    .fc-daygrid-event-harness {
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    
    /* Make day cell events container respect its boundaries */
    .fc-daygrid-day-events {
      min-height: 0 !important;
      padding-top: 1px !important;
      padding-bottom: 1px !important;
    }
    
    /* Remove large media queries and apply consistent styling */
    @media screen {
      .fc-daygrid-event {
        font-size: 0.75rem !important;
        line-height: 1.2 !important;
        max-width: 100% !important;
      }
    }
  `;
  document.head.appendChild(style);
};