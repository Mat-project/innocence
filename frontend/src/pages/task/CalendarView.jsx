//// filepath: d:/project/innovsence/frontend/src/pages/task/CalendarView.jsx
import React, { useState, useEffect } from "react";
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
  Loader
} from "lucide-react";

// Priority colors for visual indicators
const priorityColors = {
  low: "#10B981",      // Green
  medium: "#F59E0B",   // Amber
  high: "#EF4444",     // Red
};

const priorityClasses = {
  low: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30",
  medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30",
  high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/30",
};

const statusIcons = {
  todo: <Clock className="w-4 h-4" />,
  inprogress: <ArrowRight className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />
};

const statusClasses = {
  todo: "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300",
  inprogress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  completed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
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

const EventDetailModal = ({ event, onClose, onEdit }) => {
  const task = event.extendedProps;
  const dueDate = event.start ? moment(event.start).format("LLL") : "No due date";
  const isPastDue = task.due_date && moment(task.due_date).isBefore(moment(), 'day') && task.status !== 'completed';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal content */}
      <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            Task Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h2>
            
            <div className="flex flex-wrap gap-2 mt-3">
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
          
          {/* Due date */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</div>
            <div className={`text-base ${isPastDue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-gray-100'}`}>
              <Clock className="w-4 h-4 inline-block mr-1 opacity-70" />
              {dueDate}
              {isPastDue && " (Overdue)"}
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</div>
              <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}
          
          {/* Additional metadata */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {task.category && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</div>
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <Tag className="w-4 h-4 mr-1 opacity-70" />
                  {task.category}
                </div>
              </div>
            )}
            
            {task.assigned_to && (
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned To</div>
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <User className="w-4 h-4 mr-1 opacity-70" />
                  {task.assigned_to}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md mr-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(task);
              onClose();
            }}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CalendarView({ tasks = [], onEdit, refreshFlag }) {
  const [allTasks, setAllTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Filters: status and priority
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // For the "Upcoming Tasks" sidebar
  const [upcomingTasks, setUpcomingTasks] = useState([]);

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

  // Apply filters and map tasks to calendar events
  useEffect(() => {
    if (allTasks.length) {
      const today = moment();
      const filtered = allTasks.filter((task) => {
        // Status filter: if "all", include every task; otherwise include tasks matching filter
        const statusMatch =
          filterStatus === "all" ? true : task.status === filterStatus;
        // Priority filter
        const priorityMatch =
          filterPriority === "all" ? true : task.priority === filterPriority;
        return statusMatch && priorityMatch;
      });
      
      // Map filtered tasks to calendar events
      const events = filtered.map((task) => {
        let start;
        if (task.status === "completed" && task.updated_at) {
          // Completed tasks appear on the completion date
          start = moment(task.updated_at).toDate();
        } else {
          // For tasks "todo" or "inprogress", use due_date or default to today
          start = task.due_date
            ? moment(task.due_date).toDate()
            : today.toDate();
        }
        
        // Adjust display based on task status
        let backgroundColor = priorityColors[task.priority] || "#6366F1";
        let textColor = "#FFFFFF";
        let borderColor = backgroundColor;
        
        // Make completed tasks more muted
        if (task.status === "completed") {
          backgroundColor = `${backgroundColor}80`; // Add 50% transparency
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

      // Calculate upcoming tasks (next 7 days and not completed) for the sidebar
      const upcoming = allTasks.filter(task => {
        if (task.status === "completed") return false;
        if (task.due_date) {
          const due = moment(task.due_date);
          const diff = due.diff(today, "days");
          return diff >= 0 && diff <= 7;
        }
        return false;
      }).sort((a, b) => {
        // Sort by due date (ascending)
        return moment(a.due_date).diff(moment(b.due_date));
      });
      
      setUpcomingTasks(upcoming);
    }
  }, [allTasks, filterStatus, filterPriority]);

  // Custom calendar styling
  const customCalendarStyles = {
    "--fc-border-color": "var(--border-color, #e5e7eb)",
    "--fc-today-bg-color": "var(--today-bg-color, rgba(99, 102, 241, 0.08))",
    "--fc-event-bg-color": "var(--event-bg-color, #6366F1)",
    "--fc-event-border-color": "var(--event-border-color, #4f46e5)",
    "--fc-event-text-color": "var(--event-text-color, #ffffff)",
    "--fc-page-bg-color": "var(--page-bg-color, transparent)"
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Filter Panel */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
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
            <div style={customCalendarStyles} className="calendar-container">
              <FullCalendar
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
              />
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Tasks Sidebar */}
      <div className="w-full lg:w-80 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Tasks
            </h3>
          </div>
        </div>
        
        <div className="p-4 h-[calc(600px-56px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-medium">No upcoming tasks</p>
              <p className="text-sm mt-1">All caught up for the next 7 days!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {upcomingTasks.map((task) => {
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
                    onClick={() => onEdit(task)}
                    className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {task.title}
                      </h4>
                      <div 
                        className={`w-2 h-2 rounded-full ml-2 flex-shrink-0`} 
                        style={{ backgroundColor: priorityColors[task.priority] }}
                      ></div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {dateDisplay}
                      </div>
                      
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusClasses[task.status]}`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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

// Custom CSS for improving calendar appearance
const injectCalendarStyles = () => {
  const styleId = 'custom-calendar-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .fc-theme-standard .fc-scrollgrid {
        border-radius: 0.375rem;
        overflow: hidden;
      }
      .fc .fc-daygrid-day-frame {
        padding: 4px !important;
      }
      .fc .fc-daygrid-day-top {
        justify-content: center;
        padding-top: 2px;
      }
      .fc .fc-daygrid-day-number {
        font-weight: 500;
        font-size: 0.85rem;
      }
      .fc-day-today .fc-daygrid-day-number {
        color: #4f46e5 !important;
      }
      .fc-daygrid-event {
        border-radius: 4px !important;
        font-size: 0.8rem !important;
        padding: 1px 4px !important;
      }
      .fc-event-title {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fc-header-toolbar .fc-button {
        box-shadow: none !important;
        border-color: #d1d5db !important;
        border-radius: 0.375rem !important;
        height: 2.25rem !important;
        padding: 0 0.75rem !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        text-transform: capitalize !important;
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
      .fc-header-toolbar h2 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
      }
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
      .dark .fc-theme-standard td, .dark .fc-theme-standard th,
      .dark .fc-theme-standard .fc-scrollgrid {
        border-color: #374151 !important;
      }
      .fc-col-header-cell {
        padding: 8px 0 !important;
        background-color: #f9fafb !important;
        font-weight: 600 !important;
      }
      .dark .fc-col-header-cell {
        background-color: #1f2937 !important;
        color: #e5e7eb !important;
      }
      .task-completed {
        opacity: 0.75;
        text-decoration: line-through;
      }
      .fc .fc-button-group {
        gap: 4px !important;
      }
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out forwards;
      }
      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out forwards;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
};

// Inject the custom styles
if (typeof window !== 'undefined') {
  injectCalendarStyles();
}