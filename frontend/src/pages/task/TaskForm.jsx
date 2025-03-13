import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { taskAPI } from '../../service/api';

export default function TaskForm({ onTaskCreated, initialData = {}, onCancelEdit }) {
  const isEditMode = !!initialData.id;
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'todo',
    priority: initialData.priority || 'medium',
    due_date: initialData.due_date || '',
    category: initialData.category || '',
    assignedTo: initialData.assigned_to || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when editing
  useEffect(() => {
    setFormData({
      title: initialData.title || '',
      description: initialData.description || '',
      status: initialData.status || 'todo',
      priority: initialData.priority || 'medium',
      due_date: initialData.due_date || '',
      category: initialData.category || '',
      assignedTo: initialData.assigned_to || '',
    });
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.title.trim() === '') {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        assigned_to: formData.assignedTo,
      };
      delete payload.assignedTo;

      let response;
      if (isEditMode) {
        response = await taskAPI.updateTask(initialData.id, payload);
      } else {
        response = await taskAPI.createTask(payload);
      }
      onTaskCreated(response.data);
      
      if (!isEditMode) {
        setFormData({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          due_date: '',
          category: '',
          assignedTo: '',
        });
      } else if (onCancelEdit) {
        onCancelEdit();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create/update task');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', class: 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40' },
    { value: 'medium', label: 'Medium', class: 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40' },
    { value: 'high', label: 'High', class: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do', class: 'text-gray-700 dark:text-gray-300' },
    { value: 'inprogress', label: 'In Progress', class: 'text-blue-700 dark:text-blue-400' },
    { value: 'completed', label: 'Completed', class: 'text-green-700 dark:text-green-400' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter task title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Describe the task..."
          />
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isEditMode && initialData.status === 'completed' && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Editing a finished task will reopen it.
              </p>
            )}
          </div>
        </div>
        
        {/* Due Date and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="e.g., Development, Design"
            />
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assigned To
          </label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter name or username"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        {isEditMode && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-colors ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading 
            ? (isEditMode ? 'Saving...' : 'Creating...') 
            : (isEditMode ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}