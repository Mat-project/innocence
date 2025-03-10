import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { taskAPI } from '../../service/api';

export default function TaskForm({ onTaskCreated, initialData = {}, onCancelEdit }) {
  const isEditMode = !!initialData.id;
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'todo',
    priority: initialData.priority || 'medium',
    due_date: initialData.due_date || '', // Use due_date to match backend
    category: initialData.category || '',
    assignedTo: initialData.assignedTo || '',
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
      assignedTo: initialData.assignedTo || '',
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
    // Client-side validation example:
    if (formData.title.trim() === '') {
      setError('Title is required.');
      return;
    }
    // You can add more validations here if needed

    setLoading(true);
    try {
      // Map formData keys to match model/serializer field names
      const payload = {
        ...formData,
        assigned_to: formData.assignedTo, // map assignedTo to assigned_to
      };
      delete payload.assignedTo; // remove the old key

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
      // Display backend error details if any
      setError(err.response?.data?.detail || 'Failed to create/update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {isEditMode && initialData.status === 'completed' && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Editing a finished task will reopen it. You can change its status.
              </p>
            )}
          </div>
        </div>
        
        {/* Due Date and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
          <input
            type="text"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {loading ? (isEditMode ? 'Updating Task...' : 'Creating Task...') : (isEditMode ? 'Update Task' : 'Create Task')}
      </button>
      
      {isEditMode && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
}