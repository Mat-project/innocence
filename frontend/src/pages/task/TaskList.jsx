import React, { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, Circle, ArrowUpCircle, Trash2, Edit, Tag, Calendar 
} from 'lucide-react';
import { taskAPI } from '../../service/api';

export default function TaskList({ refreshFlag, onEdit }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    category: 'all',
    dateRange: 'all'
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const statusIcons = {
    todo: Circle,
    inprogress: ArrowUpCircle,
    completed: () => <AlertCircle className="h-5 w-5 text-gray-400" />
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshFlag]);

  useEffect(() => {
    // Apply filters
    let result = [...tasks];

    if (filters.search) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    if (filters.category !== 'all') {
      result = result.filter(task => task.category === filters.category);
    }

    // Date range filtering
    if (filters.dateRange !== 'all') {
      const today = new Date();
      switch (filters.dateRange) {
        case 'today':
          result = result.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          result = result.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= today && dueDate <= weekAhead;
          });
          break;
        // Add more date range cases as needed
      }
    }

    setFilteredTasks(result);
  }, [filters, tasks]);

  const handleDelete = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  // New: Mark task as completed
  const handleFinish = async (id) => {
    try {
      await taskAPI.updateTask(id, { status: 'completed' });
      fetchTasks();
    } catch (err) {
      console.error("Failed to mark task as completed:", err.response?.data || err.message);
      setError('Failed to mark task as completed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map(task => {
              const StatusIcon = statusIcons[task.status];
              return (
                <li key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {task.description}
                      </p>
                      
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {task.dueDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        
                        {task.category && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {task.category}
                          </div>
                        )}
                        
                        {task.assignedTo && (
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              {task.assignedTo.charAt(0).toUpperCase()}
                            </div>
                            <span className="ml-1">{task.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      <button
                        onClick={() => onEdit && onEdit(task)}
                        className="p-1 text-gray-400 hover:text-gray-500"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      {task.status !== "completed" && (
                        <button
                          onClick={() => handleFinish(task.id)}
                          className="p-1 text-green-500 hover:text-green-600"
                          title="Mark as Completed"
                        >
                          {/* You can use an icon or text */}
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}