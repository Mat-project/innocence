import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ListTodo,
  Kanban,
  Filter,
  Plus,
  X,
  Search,
  Clock,
  AlertCircle,
  BarChart2,
  CheckCircle,
  Loader,
  Menu,
  SlidersHorizontal,
  ChevronRight,
  Inbox
} from "lucide-react";
import { taskAPI } from "../../service/api";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import KanbanBoard from "./KanbanBoard";
import CalendarView from "./CalendarView";

export default function TaskPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [quickFilter, setQuickFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const mobileNavRef = React.useRef(null);
  const [isNavFixed, setIsNavFixed] = useState(false);
  const headerRef = useRef(null);
  const viewToggleRef = useRef(null);

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
          completed: fetchedTasks.filter((task) => task.status === "completed")
            .length,
          inProgress: fetchedTasks.filter(
            (task) => task.status === "inprogress"
          ).length,
          overdue: fetchedTasks.filter((task) => {
            if (task.status === "completed") return false;
            if (!task.due_date) return false;
            return new Date(task.due_date) < now;
          }).length,
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
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply quick filters
    if (quickFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filtered = filtered.filter((task) => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate < tomorrow;
      });
    } else if (quickFilter === "week") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter((task) => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate < nextWeek;
      });
    } else if (quickFilter === "overdue") {
      const today = new Date();

      filtered = filtered.filter((task) => {
        if (task.status === "completed") return false;
        if (!task.due_date) return false;
        return new Date(task.due_date) < today;
      });
    } else if (quickFilter === "high") {
      filtered = filtered.filter((task) => task.priority === "high");
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    return filtered;
  }, [tasks, searchQuery, quickFilter, statusFilter, priorityFilter]);

  const handleTaskCreated = () => {
    setRefreshFlag((prev) => !prev);
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
    setQuickFilter("all");
    setStatusFilter("all");
    setPriorityFilter("all");
    setQuickFilter("all");
    setSearchQuery("");
    setShowFilters(false);
  };

  const statsCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: <BarChart2 className="w-5 h-5 text-blue-500" />,
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
      borderClass: "border-blue-200 dark:border-blue-800/30",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bgClass: "bg-green-50 dark:bg-green-900/20",
      borderClass: "border-green-200 dark:border-green-800/30",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: <Loader className="w-5 h-5 text-amber-500" />,
      bgClass: "bg-amber-50 dark:bg-amber-900/20",
      borderClass: "border-amber-200 dark:border-amber-800/30",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      bgClass: "bg-red-50 dark:bg-red-900/20",
      borderClass: "border-red-200 dark:border-red-800/30",
    },
  ];

  const viewOptions = [
    { id: "list", icon: ListTodo, label: "List View", color: "bg-emerald-500" },
    { id: "kanban", icon: Kanban, label: "Board View", color: "bg-blue-500" },
    {
      id: "calendar",
      icon: Calendar,
      label: "Calendar",
      color: "bg-indigo-500",
    },
  ];

  const quickFilterOptions = [
    { id: "all", label: "All Tasks" },
    { id: "today", label: "Due Today" },
    { id: "week", label: "This Week" },
    {
      id: "overdue",
      label: "Overdue",
      icon: <Clock className="inline w-3 h-3 mr-1" />,
    },
    {
      id: "high",
      label: "High Priority",
      icon: <AlertCircle className="inline w-3 h-3 mr-1" />,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileFilter = () => {
    setMobileFilterOpen(!mobileFilterOpen);
  };

  const renderContent = (
    viewMode,
    filteredTasks,
    handleEditTask,
    handleTaskCreated,
    refreshFlag
  ) => {
    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
          <div className="mb-3">
            <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto opacity-30" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            No tasks found
          </h3>
          <p className="text-xs sm:text-sm">
            Try adjusting your filters or create a new task
          </p>
        </div>
      );
    }

    switch (viewMode) {
      case "list":
        return (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onTaskUpdated={handleTaskCreated}
            refreshFlag={refreshFlag}
          />
        );
      case "kanban":
        return (
          <KanbanBoard
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onStatusChange={handleTaskCreated}
            refreshFlag={refreshFlag}
          />
        );
      case "calendar":
        return (
          <CalendarView
            tasks={filteredTasks}
            onEdit={handleEditTask}
            refreshFlag={refreshFlag}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    // Only run this effect on small screens
    const isMobileScreen = () => window.innerWidth < 640;
    
    // Need to wait for layout to complete before measuring
    const setupScrollListener = () => {
      if (!isMobileScreen() || !viewToggleRef.current) return;
      
      // Store the position
      const viewTogglePosition = viewToggleRef.current.getBoundingClientRect().top + window.scrollY;
      console.log("Nav position:", viewTogglePosition); // Debugging
      
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        console.log("Scroll:", scrollPosition, "Trigger:", viewTogglePosition); // Debugging
        setIsNavFixed(scrollPosition > viewTogglePosition);
      };
      
      // Add scroll listener
      window.addEventListener('scroll', handleScroll);
      
      // Call once to check initial state
      handleScroll();
      
      // Cleanup
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    };
    
    // Use timeout to ensure DOM is fully rendered
    const timerId = setTimeout(setupScrollListener, 500);
    
    // Set up resize listener to recalculate on resize
    const handleResize = () => {
      // Clear any existing listeners
      window.removeEventListener('scroll', () => {});
      // Re-setup if we're on mobile
      if (isMobileScreen()) {
        setupScrollListener();
      } else {
        // Turn off fixed nav if we resize to larger screen
        setIsNavFixed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timerId);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency - we handle our own cleanup

  const handleScroll = () => {
    if (!viewToggleRef.current) return;
    
    // Get the position of the view toggle section
    const viewTogglePosition = viewToggleRef.current.getBoundingClientRect().top;
    
    // When the top of the viewport passes the navigation section, fix it
    setIsNavFixed(viewTogglePosition <= 0);
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Header with controls */}
        <div ref={headerRef} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-3 px-4 sm:px-6 py-4">
            {/* Top row - Title and Task Button */}
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl lg:text-3xl">
                <span className="hidden xs:inline">Task Management</span>
                <span className="xs:hidden">Tasks</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewTask}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium text-black dark:text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm sm:text-base"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="xs:inline hidden">New Task</span>
                </button>
              </div>
            </div>

            {/* Stats Cards - Horizontal scrolling for mobile */}
            <div className="sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 -mx-4 sm:mx-0">
              {/* Mobile Stats Cards - Horizontal scrolling */}
              <div className="sm:hidden bg-white dark:bg-gray-800 px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex overflow-x-auto space-x-3 pb-1 hide-scrollbar">
                  {statsCards.map((card, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-32 flex flex-col p-3 rounded-xl border shadow-sm ${card.borderClass} ${card.bgClass} transition-all duration-300 active:scale-95`}
                      onClick={() => {
                        if (card.title === 'Overdue') setQuickFilter('overdue');
                        else if (card.title === 'In Progress') setStatusFilter('inprogress');
                        else if (card.title === 'Completed') setStatusFilter('completed');
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{card.title}</span>
                        <div className="rounded-full p-1 bg-white dark:bg-gray-700 shadow-sm">
                          {React.cloneElement(card.icon, { className: "w-4 h-4" })}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : card.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Stats Cards */}
              {statsCards.map((card, index) => (
                <div
                  key={index}
                  className={`hidden sm:flex items-center justify-between p-2 sm:p-3 rounded-lg border ${card.borderClass} ${card.bgClass} transition-all duration-300 hover:shadow-sm cursor-pointer`}
                  onClick={() => {
                    if (card.title === 'Overdue') setQuickFilter('overdue');
                    else if (card.title === 'In Progress') setStatusFilter('inprogress');
                    else if (card.title === 'Completed') setStatusFilter('completed');
                  }}
                >
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                    <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : card.value}</p>
                  </div>
                  <div className="rounded-full p-1.5 sm:p-2 bg-white dark:bg-gray-700 shadow-sm">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* View toggle buttons - Add the ref and make it fixed on scroll */}
            <div 
              ref={viewToggleRef}
              className="flex flex-col justify-center  gap-3"
            >
{/*               <div className="flex flex-col sm:flex-row justify-between gap-3"> */}
              <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 shadow-inner">
                {viewOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setViewMode(option.id)}
                    className={`inline-flex bg-white items-center px-3 py-1.5 rounded-md text-sm transition-all ${
                      viewMode === option.id
                        ? ' shadow-sm font-medium'
                        : ''
                    }`}
                  
                    style={{ 
                      backgroundColor: viewMode === option.id ? 
                        `var(--${option.color.split('-')[1]}-${option.color.split('-')[2]})` : ''
                    }}
                  >
                    <option.icon className="w-4 h-4" />
                    {/* Always show short label on small screens */}
                    <span className="sm:hidden text-[9px] mt-1">
                      {option.id === "list" ? "List" : option.id === "kanban" ? "Board" : "Cal"}
                    </span>
                    {/* Show full label on larger screens */}
                    <span className="hidden sm:inline mt-0.5 ml-1.5">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed navigation that appears when scrolled past header */}
        {isNavFixed && (
          <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-xl border-b border-gray-200 dark:border-gray-700 animate-slide-down">
            <div className="px-4 py-2">
              <div className="flex justify-between rounded-lg p-1 bg-gray-100 dark:bg-gray-700">
                {/* ...rest of your navigation buttons... */}
              </div>
            </div>
          </div>
        )}

        {/* Add a spacer when navigation is fixed to prevent content jump */}
        {isNavFixed && (
          <div className="sm:hidden h-[62px]"></div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          <div className="container mx-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
                    <div className="mb-3">
                      <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto opacity-30" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                      No tasks found
                    </h3>
                    <p className="text-xs sm:text-sm">
                      Try adjusting your filters or create a new task
                    </p>
                  </div>
                )}

                {viewMode === "list" && filteredTasks.length > 0 && (
                  <TaskList
                    tasks={filteredTasks}
                    onEdit={handleEditTask}
                    onTaskUpdated={handleTaskCreated}
                    refreshFlag={refreshFlag}
                  />
                )}

                {viewMode === "kanban" && filteredTasks.length > 0 && (
                  <KanbanBoard
                    tasks={filteredTasks}
                    onEdit={handleEditTask}
                    onStatusChange={handleTaskCreated}
                    refreshFlag={refreshFlag}
                  />
                )}

                {viewMode === "calendar" && filteredTasks.length > 0 && (
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

      {/* Fixed mobile action button without tooltip */}
      <div className="sm:hidden fixed bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleNewTask}
          className="p-2 rounded-full shadow-lg bg-indigo-600 dark:text-white flex flex-col items-center"
        >
          <Plus className="w-4 h-4" />

        </button>
      </div>

      {/* Task form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/70 dark:bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
            {/* Form header */}
            <div className="flex items-center text-black justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingTask?.id ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={closeForm}
                className="p-1 sm:p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Form content - scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <TaskForm
                onTaskCreated={handleTaskCreated}
                initialData={editingTask || {}}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </div>
        </div>
      )}
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
      `}</style>
    </div>
  );
}
