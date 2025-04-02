import React, { useState, useEffect } from 'react';
import { 
  Calendar, ListTodo, Kanban, Plus, X, Search, 
  Clock, AlertCircle, BarChart2, CheckCircle, Loader,
  Home, Filter, Star, Bell, User, Settings, ChevronRight,
  Tag, Calendar as CalendarIcon, Flag, Inbox, Sun, Moon
} from 'lucide-react';
import { taskAPI } from '../../service/api';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';

export default function MobileTaskManager() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [quickFilter, setQuickFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

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
    setSearchQuery('');
    setShowFilters(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd also toggle a class on the body or update localStorage
  };

  const statsCards = [
    { 
      title: 'Total Tasks', 
      value: stats.total, 
      icon: <Inbox className="w-4 h-4 text-purple-500" />,
      bgClass: 'bg-purple-50 dark:bg-purple-900/20',
      borderClass: 'border-purple-200 dark:border-purple-800/30',
      textClass: 'text-purple-800 dark:text-purple-200'
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      bgClass: 'bg-green-50 dark:bg-green-900/20',
      borderClass: 'border-green-200 dark:border-green-800/30',
      textClass: 'text-green-800 dark:text-green-200',
      action: () => setStatusFilter('completed')
    },
    { 
      title: 'In Progress', 
      value: stats.inProgress, 
      icon: <Loader className="w-4 h-4 text-blue-500" />,
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      borderClass: 'border-blue-200 dark:border-blue-800/30',
      textClass: 'text-blue-800 dark:text-blue-200',
      action: () => setStatusFilter('inprogress')
    },
    { 
      title: 'Overdue', 
      value: stats.overdue, 
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border-red-200 dark:border-red-800/30',
      textClass: 'text-red-800 dark:text-red-200',
      action: () => setQuickFilter('overdue')
    },
  ];

  const quickFilterOptions = [
    { id: 'all', label: 'All Tasks', icon: <Inbox className="w-4 h-4" />, color: 'bg-purple-500' },
    { id: 'today', label: 'Due Today', icon: <Clock className="w-4 h-4" />, color: 'bg-blue-500' },
    { id: 'week', label: 'This Week', icon: <CalendarIcon className="w-4 h-4" />, color: 'bg-cyan-500' },
    { id: 'overdue', label: 'Overdue', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-500' },
    { id: 'high', label: 'High Priority', icon: <Flag className="w-4 h-4" />, color: 'bg-amber-500' },
  ];

  const viewOptions = [
    { id: 'list', icon: ListTodo, label: 'List', color: 'bg-emerald-500' },
    { id: 'kanban', icon: Kanban, label: 'Board', color: 'bg-indigo-500' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', color: 'bg-pink-500' },
  ];

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', action: () => {} },
    { icon: Inbox, label: 'All Tasks', action: () => { setQuickFilter('all'); setShowSidebar(false); } },
    { icon: Clock, label: 'Today', action: () => { setQuickFilter('today'); setShowSidebar(false); } },
    { icon: CalendarIcon, label: 'Upcoming', action: () => { setQuickFilter('week'); setShowSidebar(false); } },
    { icon: Star, label: 'Important', action: () => { setPriorityFilter('high'); setShowSidebar(false); } },
    { icon: Tag, label: 'Tags', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
  ];

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'dark' : ''}`}>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Mobile Sidebar */}
        {showSidebar && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowSidebar(false)}>
            <div 
              className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="font-bold text-lg">Task Manager</h2>
                  <button onClick={() => setShowSidebar(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* User Profile */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      JD
                    </div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">john@example.com</div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-2">
                  <ul className="space-y-1">
                    {sidebarItems.map((item, index) => (
                      <li key={index}>
                        <button
                          onClick={item.action}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                        >
                          <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                {/* Dark Mode Toggle */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'} relative`}>
                      <span className={`absolute w-4 h-4 rounded-full bg-white shadow-sm top-0.5 transition-transform ${darkMode ? 'right-0.5 translate-x-0' : 'left-0.5 -translate-x-0'}`}></span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setShowSidebar(true)}
                className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <span className="tooltip group-hover:opacity-100">Menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              </button>
              <h1 className="text-lg font-bold ml-2">My Tasks</h1>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <span className="tooltip group-hover:opacity-100">Search</span>
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative p-2 rounded-full group ${
                  showFilters || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="tooltip group-hover:opacity-100">Filters</span>
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={handleNewTask}
                className="relative p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 group"
              >
                <span className="tooltip group-hover:opacity-100">New Task</span>
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar (conditionally shown) */}
          {showSearch && (
            <div className="px-4 pb-3 pt-1 animate-fade-in">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-100 dark:bg-gray-700 border-none text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Stats Cards Row */}
        <div className="bg-white dark:bg-gray-800 px-3 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto space-x-3 pb-1 hide-scrollbar">
            {statsCards.map((card, index) => (
              <div 
                key={index} 
                className={`flex-shrink-0 w-32 flex flex-col p-3 rounded-xl border shadow-sm ${card.borderClass} ${card.bgClass} transition-all duration-300 active:scale-95`}
                onClick={card.action}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${card.textClass}`}>{card.title}</span>
                  <div className="rounded-full p-1 bg-white dark:bg-gray-700 shadow-sm">
                    {card.icon}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : card.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters (collapsible) */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 animate-slide-down">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'todo', 'inprogress', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        statusFilter === status
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-transparent'
                      }`}
                    >
                      {status === 'all' ? 'All' : 
                       status === 'todo' ? 'To Do' : 
                       status === 'inprogress' ? 'In Progress' : 'Completed'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'low', 'medium', 'high'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => setPriorityFilter(priority)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        priorityFilter === priority
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-transparent'
                      }`}
                    >
                      {priority === 'all' ? 'All' : 
                       priority === 'low' ? 'Low' : 
                       priority === 'medium' ? 'Medium' : 'High'}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={resetFilters}
                className="w-full px-3 py-2 text-sm text-center font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Filters Horizontal Scroll */}
        <div className="bg-white dark:bg-gray-800 px-2 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto space-x-2 py-1 hide-scrollbar">
            {quickFilterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setQuickFilter(option.id)}
                className={`group relative flex items-center px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                  quickFilter === option.id
                    ? 'text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
                style={{ 
                  backgroundColor: quickFilter === option.id ? 
                    `var(--${option.color.split('-')[1]}-${option.color.split('-')[2]})` : ''
                }}
              >
                <span className={`mr-1.5 ${quickFilter === option.id ? 'text-white' : ''}`}>
                  {option.icon}
                </span>
                {option.label}
                <span className="tooltip group-hover:opacity-100">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between rounded-lg p-1 bg-gray-100 dark:bg-gray-700">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id)}
                className={`group relative flex-1 flex items-center justify-center py-2 text-xs font-medium rounded-md transition-all ${
                  viewMode === option.id
                    ? 'text-white shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                style={{ 
                  backgroundColor: viewMode === option.id ? 
                    `var(--${option.color.split('-')[1]}-${option.color.split('-')[2]})` : ''
                }}
              >
                <option.icon className="w-4 h-4 mr-1.5" />
   {/*              <span>{option.label}</span> */}
                <span className="tooltip hover:opacity-100">{option.label} View</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading your tasks...</p>
              </div>
            </div>
          ) : (
            <>
              {filteredTasks.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="relative mx-auto w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-10 w-10 text-indigo-500 opacity-80" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {searchQuery ? 
                      `No results for "${searchQuery}"` : 
                      "Try adjusting your filters or create a new task to get started"}
                  </p>
                  <button 
                    onClick={handleNewTask}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Create New Task
                  </button>
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

        {/* Task form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-900/70 dark:bg-black/80 z-50 flex items-end justify-center backdrop-blur-sm">
            <div 
              className="bg-white dark:bg-gray-800 rounded-t-xl shadow-xl w-full max-h-[90vh] flex flex-col animate-slide-up overflow-hidden"
            >
              {/* Form header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <button 
                  onClick={closeForm}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-base font-semibold">
                  {editingTask?.id ? 'Edit Task' : 'New Task'}
                </h2>
                <div className="w-7"></div> {/* Empty div for centering */}
              </div>
              
              {/* Form content - scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <TaskForm 
                  onTaskCreated={handleTaskCreated} 
                  initialData={editingTask || {}} 
                  onCancelEdit={handleCancelEdit} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom styles */}
        <style jsx global>{`
          :root {
            --purple-500: #8b5cf6;
            --blue-500: #3b82f6;
            --cyan-500: #06b6d4;
            --emerald-500: #10b981;
            --amber-500: #f59e0b;
            --red-500: #ef4444;
            --pink-500: #ec4899;
            --indigo-500: #6366f1;
          }
          
          .tooltip {
            position: absolute;
            top: -28px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius:.tooltip {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 50;
  pointer-events: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slide-down {
  animation: slideDown 0.3s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
          `}</style>
      </div>
    </div>
  );
}