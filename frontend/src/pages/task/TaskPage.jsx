import React, { useState } from 'react';
import { Calendar, Clock, ListTodo, Kanban, Settings, PlusCircle, X } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';
import { useTheme } from '@/context/ThemeContext';

export default function TaskPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'calendar', or 'form'
  const [hoveredButton, setHoveredButton] = useState(null);
  const { theme, setTheme } = useTheme();
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleTaskCreated = () => {
    setRefreshFlag(prev => !prev);
    setEditingTask(null);
    setShowForm(false); // Hide form after task creation
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowForm(false); // Hide form when edit is canceled
  };

  const handleNewTask = () => {
    setEditingTask(null); // Reset any editing task
    setShowForm(true); // Show the form
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true); // Show the form for editing
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const viewOptions = [
    { id: 'list', icon: ListTodo, label: 'List', color: 'blue' },
    { id: 'kanban', icon: Kanban, label: 'Kanban', color: 'green' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'purple' }
  ];

  // Helper function to get button color
  const getButtonStyles = (option) => {
    if (viewMode === option.id && !showForm) {
      // Active button - keep original style
      return 'bg-indigo-600 text-white shadow-md';
    } else if (hoveredButton === option.id) {
      // Hovered button - show colored accent based on view type
      switch (option.id) {
        case 'list':
          return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500';
        case 'kanban':
          return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-l-4 border-green-500';
        case 'calendar':
          return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-l-4 border-purple-500';
        default:
          return 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
      }
    } else {
      // Inactive, not hovered - subtle color indicator on the left border
      switch (option.id) {
        case 'list':
          return 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-l-4 border-blue-500/30';
        case 'kanban':
          return 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-l-4 border-green-500/30';
        case 'calendar':
          return 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-l-4 border-purple-500/30';
        default:
          return 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
      }
    }
  };

  const getIconColor = (option) => {
    if (viewMode === option.id && !showForm) {
      return 'text-white';
    } else if (hoveredButton === option.id) {
      switch (option.id) {
        case 'list': return 'text-blue-600 dark:text-blue-400';
        case 'kanban': return 'text-green-600 dark:text-green-400';
        case 'calendar': return 'text-purple-600 dark:text-purple-400';
        default: return 'text-gray-600 dark:text-gray-300';
      }
    } else {
      switch (option.id) {
        case 'list': return 'text-blue-500/70 dark:text-blue-500/50';
        case 'kanban': return 'text-green-500/70 dark:text-green-500/50';
        case 'calendar': return 'text-purple-500/70 dark:text-purple-500/50';
        default: return 'text-gray-500 dark:text-gray-400';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 md:p-6 space-y-4 md:space-y-6">
      <header className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mb-2 md:mb-4">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 md:w-8 h-6 md:h-8" />
            Task Management
          </h1>
          
          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
            <button
              onClick={handleNewTask}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-md bg-indigo-600 text-black hover:bg-indigo-700 dark:text-white transition-colors text-sm md:text-base"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Task</span>
            </button>
            
            <div className="bg-gray-100 text-black dark:bg-gray-700 rounded-lg p-1 flex gap-1 overflow-x-auto w-full sm:w-auto">
              {viewOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    setViewMode(option.id);
                    setShowForm(false); // Hide form when switching views
                  }}
                  onMouseEnter={() => setHoveredButton(option.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-all whitespace-nowrap text-sm md:text-base ${
                    getButtonStyles(option)
                  }`}
                >
                  <option.icon className={`w-4 h-4 ${getIconColor(option)}`} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="w-full">
        {showForm ? (
          <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button 
                onClick={closeForm}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-2 md:p-4">
              <TaskForm 
                onTaskCreated={handleTaskCreated} 
                initialData={editingTask || {}} 
                onCancelEdit={handleCancelEdit} 
              />
            </div>
          </div>
        ) : (
<div className="container mx-auto w-full p-4 md:p-6">
  {viewMode === 'list' && <TaskList refreshFlag={refreshFlag} onEdit={handleEditTask} />}
  {viewMode === 'kanban' && <KanbanBoard refreshFlag={refreshFlag} onStatusChange={handleTaskCreated} />}
  {viewMode === 'calendar' && <CalendarView refreshFlag={refreshFlag} />}
</div>
        )}
      </div>
    </div>
  );
}