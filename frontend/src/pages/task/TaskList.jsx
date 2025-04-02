import React, { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, Circle, ArrowUpCircle, Trash2, Edit, Tag, Calendar, Check,
  Clock, User, Filter, ChevronDown, X, ChevronUp, MoreVertical
} from 'lucide-react';
import { taskAPI } from '../../service/api';
import { format, isValid, parseISO, isToday, addDays, isWithinInterval } from 'date-fns';

export default function TaskList({ refreshFlag, onEdit, onTaskUpdated, searchQuery, quickFilter, statusFilter, priorityFilter }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  // Local filter states - synchronized with parent props
  const [filters, setFilters] = useState({
    status: statusFilter || 'all',
    priority: priorityFilter || 'all',
    search: searchQuery || '',
    category: 'all',
    dateRange: quickFilter || 'all'
  });

  // Categories extracted from tasks
  const [categories, setCategories] = useState([]);

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  };

  const statusIcons = {
    todo: <Circle className="h-5 w-5" />,
    inprogress: <ArrowUpCircle className="h-5 w-5 text-blue-500" />,
    completed: <Check className="h-5 w-5 text-green-500" />
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data || []);
      
      // Extract unique categories for filter dropdown
      const uniqueCategories = [...new Set(response.data
        .filter(task => task.category)
        .map(task => task.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount and when refreshFlag changes
  useEffect(() => {
    fetchTasks();
  }, [refreshFlag]);

  // Sync external filters with local state
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery || '',
      status: statusFilter || 'all',
      priority: priorityFilter || 'all',
      dateRange: quickFilter === 'today' ? 'today' : 
                quickFilter === 'week' ? 'week' : 
                quickFilter === 'overdue' ? 'overdue' :
                quickFilter === 'high' ? 'high' : 'all'
    }));
  }, [searchQuery, statusFilter, priorityFilter, quickFilter]);

  // Apply filters
  useEffect(() => {
    if (!tasks.length) return;
    
    let result = [...tasks];
    const today = new Date();

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(task => 
        (task.title && task.title.toLowerCase().includes(searchLower)) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }
    
    // Apply priority filter
    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(task => task.category === filters.category);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      result = result.filter(task => {
        // Skip tasks without due dates
        if (!task.due_date) return filters.dateRange === 'high' ? task.priority === 'high' : false;
        
        const dueDate = parseISO(task.due_date);
        if (!isValid(dueDate)) return filters.dateRange === 'high' ? task.priority === 'high' : false;
        
        switch (filters.dateRange) {
          case 'today':
            return isToday(dueDate);
          case 'week':
            const weekFromNow = addDays(today, 7);
            return isWithinInterval(dueDate, { start: today, end: weekFromNow });
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          case 'high':
            return task.priority === 'high';
          default:
            return true;
        }
      });
    }

    // Sort tasks: overdue first, then by due date, then completed last
    result.sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // If neither has a due date
      if (!a.due_date && !b.due_date) return 0;

      // Tasks with due dates before those without
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      
      const dateA = parseISO(a.due_date);
      const dateB = parseISO(b.due_date);
      
      // Invalid dates go last
      if (!isValid(dateA)) return 1;
      if (!isValid(dateB)) return -1;
      
      // Sort by date
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredTasks(result);
  }, [filters, tasks]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;
    
    try {
      await taskAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      fetchTasks(); // Refresh to ensure we have latest state
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.updateTask(id, { status: newStatus });
      await fetchTasks(); // Refresh tasks after status change
      
      // Notify parent component about the update
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (err) {
      console.error(`Failed to update task status to ${newStatus}:`, err);
      setError(`Failed to update task status. Please try again.`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    const today = new Date();
    const isTaskToday = isToday(date);
    
    if (isTaskToday) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Check if a date is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    return date < new Date();
  };

  // Reset all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
      category: 'all',
      dateRange: 'all'
    });
  };

  const toggleTaskDetails = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    // Close action menu when toggling task details
    setShowActionMenu(null);
  };

  const toggleActionMenu = (e, taskId) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === taskId ? null : taskId);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActionMenu(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* More Mobile-friendly Advanced Filters Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)} 
              className="flex items-center text-xs sm:text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Filter size={14} className="mr-1" />
              {showFilters ? 'Hide' : 'Show'}
              <ChevronDown size={14} className={`ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {(filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <X size={14} className="mr-1" />
                Clear
              </button>
            )}
          </div>
          
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>
        
        {/* Improved mobile filter layout */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div>
              <label htmlFor="status-filter" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-2 sm:px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority-filter" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Priority
              </label>
              <select
                id="priority-filter"
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-2 sm:px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="category-filter" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-2 sm:px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="date-filter" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Due Date
              </label>
              <select
                id="date-filter"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-2 sm:px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Dates</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Task List - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 sm:py-16 px-4">
            <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 sm:mb-4">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {tasks.length > 0 
                ? "Try adjusting your search or filter criteria to find what you're looking for."
                : "Get started by creating your first task using the 'New Task' button."}
            </p>
            
            {(filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' || filters.dateRange !== 'all' || filters.search) && (
              <button
                onClick={clearFilters}
                className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map(task => (
              <li 
                key={task.id} 
                className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  task.status === 'completed' ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''
                } ${expandedTaskId === task.id ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}
              >
                <div 
                  className="flex flex-col gap-3"
                  onClick={() => toggleTaskDetails(task.id)}
                >
                  {/* Task header - improved mobile layout */}
                  <div className="flex items-start gap-3">
                    {/* Task status indicator */}
                    <div className="flex-shrink-0 mt-0.5" onClick={e => e.stopPropagation()}>
                      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${
                        task.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
                          : task.status === 'inprogress'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {statusIcons[task.status]}
                      </div>
                    </div>
                    
                    {/* Task title and priority - better spacing for mobile */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap gap-2 items-center pr-2">
                          <h3 className={`text-sm sm:text-base font-medium break-words ${
                            task.status === 'completed' 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {task.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        
                        {/* Mobile action button */}
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => toggleActionMenu(e, task.id)}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Task actions"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          
                          {/* Mobile action menu */}
                          {showActionMenu === task.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    onEdit(task);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                  <Edit className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                  Edit
                                </button>
                                
                                {task.status === "todo" && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(task.id, "inprogress");
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center"
                                  >
                                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                                    Start
                                  </button>
                                )}
                                
                                {task.status === "inprogress" && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(task.id, "completed");
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Complete
                                  </button>
                                )}
                                
                                {task.status === "completed" && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(task.id, "todo");
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                  >
                                    <Circle className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    Reopen
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => {
                                    handleDelete(task.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Description preview - mobile optimized */}
                      {task.description && (
                        <div className="mt-1">
                          <p className={`text-xs sm:text-sm break-words relative ${
                            task.status === 'completed'
                              ? 'text-gray-400 dark:text-gray-500' 
                              : 'text-gray-500 dark:text-gray-400'
                          } line-clamp-2`}>
                            {expandedTaskId !== task.id ? task.description : null}
                          </p>
                        </div>
                      )}

                      {/* Task metadata - more compact for mobile */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {task.due_date && (
                          <div className={`flex items-center px-1.5 sm:px-2 py-0.5 rounded-md ${
                            task.status !== 'completed' && isOverdue(task.due_date) 
                              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="whitespace-nowrap text-[10px] sm:text-xs">
                              {formatDate(task.due_date)}
                              {task.status !== 'completed' && isOverdue(task.due_date) && ' (Overdue)'}
                            </span>
                          </div>
                        )}
                            
                        {task.category && (
                          <div className="flex items-center px-1.5 sm:px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">
                            <Tag className="h-3 w-3 mr-1" />
                            <span className="text-[10px] sm:text-xs">{task.category}</span>
                          </div>
                        )}
                            
                        {task.assigned_to && (
                          <div className="flex items-center px-1.5 sm:px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">
                            <User className="h-3 w-3 mr-1" />
                            <span className="text-[10px] sm:text-xs">{task.assigned_to}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Improved mobile task details expansion */}
                {expandedTaskId === task.id && task.description && (
                  <div className="mt-3 overflow-hidden transition-all duration-300 ease-in-out animate-fadeIn">
                    <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex items-center">
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                          Description
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskDetails(null);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {task.updated_at && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Updated: {format(parseISO(task.updated_at), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                          }}
                          className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800/40"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Loading overlay for subsequent data fetches */}
      {loading && tasks.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 dark:bg-opacity-40 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      )}
    </div>
  );
}