import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  AlertCircle, Clock, ChevronDown, ChevronUp, X, Filter, Plus,
  MoreVertical, Edit, Trash2, CheckCircle, Calendar as CalendarIcon,
  Circle // Added Circle for To Do icon
} from "lucide-react";
import moment from "moment";
import { taskAPI } from "../../service/api";
import TaskForm from "./TaskForm";

export default function KanbanBoard({ tasks = [], onTasksChanged, refreshFlag }) {
  const [columns, setColumns] = useState({
    todo: {
      title: "To Do",
      items: []
    },
    inprogress: {
      title: "In Progress",
      items: []
    },
    completed: {
      title: "Completed",
      items: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState("desktop");
  const [filterBy, setFilterBy] = useState({ priority: "all" });
  const [showFilters, setShowFilters] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [collapsedColumns, setCollapsedColumns] = useState({
    todo: false,
    inprogress: false,
    completed: false
  });
  
  const menuRef = useRef(null);
  
  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenActionMenuId(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Detect screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewMode("mobile");
      } else if (window.innerWidth < 1024) {
        setViewMode("tablet");
      } else {
        setViewMode("desktop");
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Setup columns when tasks change
  useEffect(() => {
    if (tasks && tasks.length) {
      const filtered = tasks.filter(task => {
        if (filterBy.priority !== "all" && task.priority !== filterBy.priority) {
          return false;
        }
        return true;
      });
      
      const newColumns = {
        todo: { ...columns.todo, items: [] },
        inprogress: { ...columns.inprogress, items: [] },
        completed: { ...columns.completed, items: [] },
      };
      
      filtered.forEach((task) => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push(task);
        } else {
          // If status doesn't match our columns, put in todo
          newColumns.todo.items.push({ ...task, status: "todo" });
        }
      });
      
      setColumns(newColumns);
    }
  }, [tasks, filterBy]);
  
  // Apply filters
  const applyFilter = (newFilter) => {
    setFilterBy(newFilter);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilterBy({ priority: "all" });
    setShowFilters(false);
  };
  
  const toggleColumnCollapse = (columnId) => {
    setCollapsedColumns({
      ...collapsedColumns,
      [columnId]: !collapsedColumns[columnId]
    });
  };
  
  const onDragEnd = async (result) => {
    // User dropped outside any droppable area
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // No movement happened
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Find the task that was moved
    const taskId = parseInt(draggableId.split('-')[1]);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Create a copy of our columns
    const newColumns = { ...columns };
    
    // Remove from source column
    newColumns[source.droppableId].items = newColumns[source.droppableId].items.filter(
      item => item.id !== taskId
    );
    
    // Add to destination column with updated status
    const updatedTask = { ...task, status: destination.droppableId };
    newColumns[destination.droppableId].items.splice(destination.index, 0, updatedTask);
    
    setColumns(newColumns);
    
    // Update task status on server
    try {
      await taskAPI.updateTask(taskId, { status: destination.droppableId });
      if (onTasksChanged) {
        const response = await taskAPI.getTasks();
        onTasksChanged(response.data);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update task status");
    }
  };
  
  const onEdit = (task) => {
    setEditingTask(task);
    setShowCreateForm(false);
  };
  
  // Handle task edit button click with proper event stopping
  const handleEditClick = (e, task) => {
    e.preventDefault();
    e.stopPropagation();  // Prevent task card click
    setEditingTask(task);
    setOpenActionMenuId(null); // Close the menu
  };
  
  // Handle task delete button click with proper event stopping
  const handleDeleteClick = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();  // Prevent task card click
    setDeleteTaskId(taskId);
    setShowDeleteConfirm(true);
    setOpenActionMenuId(null); // Close the menu
  };
  
  // Toggle action menu with proper event stopping
  const toggleActionMenu = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();  // Prevent task card click
    setOpenActionMenuId(openActionMenuId === taskId ? null : taskId);
  };
  
  const confirmDelete = async () => {
    try {
      await taskAPI.deleteTask(deleteTaskId);
      if (onTasksChanged) {
        const response = await taskAPI.getTasks();
        onTasksChanged(response.data);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTaskId(null);
    }
  };
  
  const handleTaskCreated = async (task) => {
    setEditingTask(null);
    setShowCreateForm(false);
    
    if (onTasksChanged) {
      const response = await taskAPI.getTasks();
      onTasksChanged(response.data);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
          Kanban Board
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm border
              ${showFilters 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`}
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Filters</span>
            {filterBy.priority !== "all" && (
              <span className="ml-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-xs flex items-center justify-center text-indigo-800 dark:text-indigo-300">
                1
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Filters panel */}
      {showFilters && (
        <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h4 className="text-sm sm:text-base font-medium">Filter Tasks</h4>
            <button 
              onClick={() => setShowFilters(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={filterBy.priority}
                onChange={(e) => applyFilter({ ...filterBy, priority: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs sm:text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      
      {/* Edit form as a modal overlay */}
      {editingTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            {/* Overlay background */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" 
                onClick={() => setEditingTask(null)}></div>
            
            {/* Modal content */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl mx-auto shadow-xl transform transition-all z-10">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingTask.id ? 'Edit Task' : 'Create New Task'}
                </h3>
                
                <TaskForm
                  initialData={editingTask}
                  onTaskCreated={handleTaskCreated}
                  onCancelEdit={() => setEditingTask(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile column navigation with icons and hover tooltips */}
      {(viewMode === "mobile" || viewMode === "tablet") && (
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {Object.entries(columns).map(([columnId, column]) => (
              <button
                key={columnId}
                onClick={() => {
                  document.getElementById(`column-${columnId}`)?.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'start'
                  });
                }}
                className={`group relative px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium flex items-center justify-center
                  ${columnId === 'todo' ? 'rounded-l-lg' : ''} 
                  ${columnId === 'completed' ? 'rounded-r-lg' : ''}
                  ${columnId === 'todo' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : ''}
                  ${columnId === 'inprogress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''}
                  ${columnId === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
                  border border-gray-200 dark:border-gray-600
                `}
              >
                {/* Icon for extra small screens with hover tooltip */}
                <span className="sm:hidden relative">
                  {columnId === 'todo' && <Circle className="w-5 h-5" />}
                  {columnId === 'inprogress' && <AlertCircle className="w-5 h-5" />}
                  {columnId === 'completed' && <CheckCircle className="w-5 h-5" />}
                  <span className="text-[10px] leading-none">
                    {column.items.length}
                  </span>
                  
                  {/* Tooltip that appears on hover */}
                  <span className="kanban-tooltip group-hover:opacity-100">
                    {column.title}
                  </span>
                </span>
                
                {/* Text for sm screens and above */}
                <span className="hidden sm:inline">
                  {column.title} <span className="text-xs">({column.items.length})</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Kanban board */}
      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : viewMode === "tablet" ? "grid-cols-2" : "grid-cols-3"}`}>
            {Object.entries(columns).map(([columnId, column]) => (
              <div 
                key={columnId} 
                id={`column-${columnId}`} 
                className="flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                style={{ height: "fit-content" }}
              >
                {/* Column header */}
                <div className={`p-2 sm:p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700
                  ${columnId === 'inprogress' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${columnId === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : ''}
                `}>
                  <div className="text-xs md:text-sm lg:text-md font-medium text-gray-900 dark:text-white flex items-center">
                    {columnId === 'todo' && (
                      <Circle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500 dark:text-gray-400" />
                    )}
                    {columnId === 'inprogress' && (
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500 dark:text-blue-400" />
                    )}
                    {columnId === 'completed' && (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500 dark:text-green-400" />
                    )}
                    
                    {column.title}
                    <span className="ml-1 sm:ml-2 text-xs px-1.5 sm:px-2 py-0.5 bg-white dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                      {column.items.length}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit({ status: columnId })}
                      className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                      title="Add task"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleColumnCollapse(columnId)}
                      className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                      title={collapsedColumns[columnId] ? "Expand" : "Collapse"}
                    >
                      {collapsedColumns[columnId] ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Column content */}
                {!collapsedColumns[columnId] && (
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-2 overflow-y-auto ${
                          snapshot.isDraggingOver ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                        }`}
                        style={{
                          minHeight: column.items.length <= 1 ? "80px" : "100px",
                          maxHeight: "400px", // Add max height to prevent extremely tall columns
                          height: "auto",     // Allow natural height based on content
                          flex: 1             // Allow flex growth within the column container
                        }}
                      >
                        {column.items.map((task, index) => (
                          <Draggable
                            key={`task-${task.id}`}
                            draggableId={`task-${task.id}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onEdit(task)}
                                className={`mb-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 sm:p-3 shadow-sm cursor-pointer
                                  ${snapshot.isDragging ? 'shadow-md ring-2 ring-indigo-300 dark:ring-indigo-700' : 'hover:shadow-md'}
                                `}
                              >
                                <div className="flex items-start justify-between mb-1 sm:mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-xs sm:text-sm mb-1 truncate ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                      {task.title}
                                    </h4>
                                    
                                    {task.description && (
                                      <p className="text-xs sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1 sm:mb-2">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Action menu - FIXED */}
                                  <div className="relative ml-1 sm:ml-2 flex-shrink-0">
                                    <button
                                      onClick={(e) => toggleActionMenu(e, task.id)}
                                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                    >
                                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    
                                    {openActionMenuId === task.id && (
                                      <div 
                                        className="absolute right-0 top-6 z-10 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
                                        ref={menuRef}
                                        onClick={(e) => e.stopPropagation()} /* Stop propagation on menu clicks */
                                      >
                                        <ul className="py-1">
                                          <li>
                                            <button
                                              onClick={(e) => handleEditClick(e, task)}
                                              className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            >
                                              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                              Edit
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              onClick={(e) => handleDeleteClick(e, task.id)}
                                              className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            >
                                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                              Delete
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  {/* Priority tag */}
                                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded 
                                    ${task.priority === "high" ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300" : ""}
                                    ${task.priority === "medium" ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300" : ""}
                                    ${task.priority === "low" ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300" : ""}
                                  `}>
                                    {task.priority}
                                  </span>
                                  
                                  {/* Due date */}
                                  {task.due_date && (
                                    <span className="flex items-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                      <CalendarIcon className="w-3 h-3 mr-0.5" />
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                  
                                  {/* Category if present */}
                                  {task.category && (
                                    <span className="text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                      {task.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {column.items.length === 0 && (
                          <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">No tasks</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(false)}></div>
            
            <div className="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Delete Task
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
                
                <div className="mt-4 sm:mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="inline-flex justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="inline-flex justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the tooltip styles */}
      <style jsx global>{`
        /* Tooltip styles */
        .kanban-tooltip {
          position: absolute;
          top: -28px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 50;
          pointer-events: none;
        }
        
        .group:hover .kanban-tooltip {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}