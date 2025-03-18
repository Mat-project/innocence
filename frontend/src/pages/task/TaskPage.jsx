import React, { useState, useEffect } from 'react';
import { 
  Calendar, ListTodo, Kanban, Filter, Plus, X, Search, 
  Clock, AlertCircle, BarChart2, CheckCircle, Loader
} from 'lucide-react';
import { taskAPI } from '../../service/api';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';
/* import { taskAPI } from '../../service/api'; */

export default function TaskPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [quickFilter, setQuickFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });
/*   const [showFilters, setShowFilters] = useState(false); */

  // Fetch tasks and calculate statistics
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await taskAPI.getTasks();
        const fetchedTasks = response.data || [];
        setTasks(fetchedTasks);
        
        // Calculate statistics
        const now = new Date();
        const statsData = {
          total: fetchedTasks.length,
          completed: fetchedTasks.filter(task => task.status === 'completed').length,
          inProgress: fetchedTasks.filter(task => task.status === 'inprogress').length,
          overdue: fetchedTasks.filter(task => {
            if (task.status === 'completed') return false;
            if (!task.due_date) return false;
            return new Date(task.due_date) < now;
          }).length
        };
        
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refreshFlag]);

  // Filter tasks based on current filters
  const filteredTasks = React.useMemo(() => {
    let filtered = [...tasks];
    
    // Apply search query
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(query) || 
        task.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply quick filters
    if (quickFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate < tomorrow;
      });
      } else if (quickFilter === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate < nextWeek;
      });
    } else if (quickFilter === 'overdue') {
    const today = new Date();
    
      filtered = filtered.filter(task => {
        if (task.status === 'completed') return false;
        if (!task.due_date) return false;
        return new Date(task.due_date) < today;
    });
    } else if (quickFilter === 'high') {
      filtered = filtered.filter(task => task.priority === 'high');
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    return filtered;
  }, [tasks, searchQuery, quickFilter, statusFilter, priorityFilter]);

  const handleTaskCreated = () => {
    setRefreshFlag(prev => !prev);
    setEditingTask(null);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const resetFilters = () => {
    setQuickFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setQuickFilter('all');
    setSearchQuery('');
    setShowFilters(false);
  };

  const statsCards = [
    { 
      title: 'Total Tasks', 
      value: stats.total, 
      icon: <BarChart2 className="w-5 h-5 text-blue-500" />,
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      borderClass: 'border-blue-200 dark:border-blue-800/30'
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bgClass: 'bg-green-50 dark:bg-green-900/20',
      borderClass: 'border-green-200 dark:border-green-800/30'
    },
    { 
      title: 'In Progress', 
      value: stats.inProgress, 
      icon: <Loader className="w-5 h-5 text-amber-500" />,
      bgClass: 'bg-amber-50 dark:bg-amber-900/20',
      borderClass: 'border-amber-200 dark:border-amber-800/30'
    },
    { 
      title: 'Overdue', 
      value: stats.overdue, 
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border-red-200 dark:border-red-800/30'
    },
  ];

  const viewOptions = [
    { id: 'list', icon: ListTodo, label: 'List View' },
    { id: 'kanban', icon: Kanban, label: 'Board View' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
  ];

  const quickFilterOptions = [
    { id: 'all', label: 'All Tasks' },
    { id: 'today', label: 'Due Today' },
    { id: 'week', label: 'This Week' },
    { id: 'overdue', label: 'Overdue', icon: <Clock className="inline w-3 h-3 mr-1" /> },
    { id: 'high', label: 'High Priority', icon: <AlertCircle className="inline w-3 h-3 mr-1" /> },
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Due task notification */}
{/*       {showNotification && dueTasks.length > 0 && (
        <div className="fixed top-4 right-4 max-w-xs w-full z-50 animate-slide-in-right">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden">
            <div className="bg-amber-50 dark:bg-amber-900/30 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center text-amber-800 dark:text-amber-300 font-medium">
                <CalendarClock className="w-5 h-5 mr-2" />
                <span>Task Reminder</span>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                You have {dueTasks.length} task{dueTasks.length > 1 ? 's' : ''} that {dueTasks.length > 1 ? 'are' : 'is'} due today or overdue.
              </p>
              
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setQuickFilter(dueTasks.some(task => {
                      const dueDate = parseISO(task.due_date);
                      return isPast(dueDate) && !isToday(dueDate);
                    }) ? 'overdue' : 'today');
                    setShowNotification(false);
                  }}
                  className="px-3 py-1 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
                >
                  View Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Header with controls */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-3 px-4 py-3">
            {/* Top row - Title and Task Button */}
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl lg:text-3xl">
                Task Management
              </div>
              
              <div className="flex items-center gap-2">
    {/*             {hasDueTasks && (
                  <div 
                    className="relative mr-2 cursor-pointer"
                    onClick={() => {
                      setQuickFilter(dueTasks.some(task => {
                        const dueDate = parseISO(task.due_date);
                        return isPast(dueDate) && !isToday(dueDate);
                      }) ? 'overdue' : 'today');
                    }}
                  >
                    <Bell className="h-5 w-5 text-amber-500 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {dueTasks.length}
                    </span>
                  </div>
                )} */}
                
                <button
                  onClick={handleNewTask}
                className="inline-flex sm:text-xs md:text-sm lg:text-lg items-center gap-1.5 px-3 py-1.5 rounded-md text-black bg-indigo-600 dark:text-white hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statsCards.map((card, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${card.borderClass} ${card.bgClass} transition-all duration-300 hover:shadow-sm cursor-pointer`}
                  onClick={() => {
                    if (card.title === 'Overdue') setQuickFilter('overdue');
                    else if (card.title === 'In Progress') setStatusFilter('inprogress');
                    else if (card.title === 'Completed') setStatusFilter('completed');
                  }}
                >
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : card.value}</p>
                  </div>
                  <div className="rounded-full p-2 bg-white dark:bg-gray-700 shadow-sm">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>
            
            {/* View options and search/filter */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              {/* View toggle buttons with active indicator */}
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 shadow-inner">
                {viewOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setViewMode(option.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm transition-all ${
                      viewMode === option.id
                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                    }`}
                  >
                    <option.icon className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>

           {/* Search and filter */}
{/*                  <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 h-9 w-full rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  />
                  {searchQuery && (
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center h-9 px-3 border rounded-md text-sm shadow-sm ${
                    (statusFilter !== 'all' || priorityFilter !== 'all')
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                >
                  <Filter className="w-4 h-4 mr-1.5" />
                  <span>Filter</span>
                </button>
              </div> */}
            </div>

            {/* Quick filter tabs */}
            {/* <div className="flex space-x-1 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
              {quickFilterOptions.map((filter) => (
                <button 
                  key={filter.id}
                  onClick={() => setQuickFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    quickFilter === filter.id 
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                  {filter.id === 'today' && dueTasks.filter(t => {
                    const dueDate = parseISO(t.due_date);
                    return isValid(dueDate) && isToday(dueDate);
                  }).length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-xs">
                      {dueTasks.filter(t => {
                        const dueDate = parseISO(t.due_date);
                        return isValid(dueDate) && isToday(dueDate);
                      }).length}
                    </span>
                  )}
                  {filter.id === 'overdue' && dueTasks.filter(t => {
                    const dueDate = parseISO(t.due_date);
                    return isValid(dueDate) && isPast(dueDate) && !isToday(dueDate);
                  }).length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-xs">
                      {dueTasks.filter(t => {
                        const dueDate = parseISO(t.due_date);
                        return isValid(dueDate) && isPast(dueDate) && !isToday(dueDate);
                      }).length}
                    </span>
                  )}
                </button>
              ))}
            </div> */}
          </div>
        </div>

        {/* Advanced filter panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</label>
                <select 
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <button 
                onClick={resetFilters}
                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {filteredTasks.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="mb-3">
                      <Search className="h-12 w-12 mx-auto opacity-30" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No tasks found</h3>
                    <p>Try adjusting your filters or create a new task</p>
                  </div>
                )}
                
                {viewMode === 'list' && filteredTasks.length > 0 && (
                  <TaskList 
                    tasks={filteredTasks} 
                    onEdit={handleEditTask}
                    onTaskUpdated={handleTaskCreated}
                    refreshFlag={refreshFlag} 
                  />
                )}
                
                {viewMode === 'kanban' && filteredTasks.length > 0 && (
                  <KanbanBoard 
                    tasks={filteredTasks}
                    onEdit={handleEditTask}
                    onStatusChange={handleTaskCreated} 
                    refreshFlag={refreshFlag} 
                  />
                )}
                
                {viewMode === 'calendar' && filteredTasks.length > 0 && (
                  <CalendarView 
                    tasks={filteredTasks}
                    onEdit={handleEditTask}
                    refreshFlag={refreshFlag} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/70 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
            {/* Form header */}
            <div className="flex items-center text-black justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingTask?.id ? 'Edit Task' : 'New Task'}
              </h2>
              <button 
                onClick={closeForm}
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form content - scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <TaskForm 
                onTaskCreated={handleTaskCreated} 
                initialData={editingTask || {}} 
                onCancelEdit={handleCancelEdit} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}