import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { taskAPI } from '../../service/api';

export default function TaskForm({ onTaskCreated, initialData = {}, onCancelEdit }) {
  const isEditMode = !!initialData.id;
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'todo',
    priority: initialData.priority || 'medium',
    dueDate: initialData.dueDate || '',
    category: initialData.category || '',
    assignedTo: initialData.assignedTo || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When editing, update the form data accordingly.
  useEffect(() => {
    setFormData({
      title: initialData.title || '',
      description: initialData.description || '',
      status: initialData.status || 'todo',
      priority: initialData.priority || 'medium',
      dueDate: initialData.dueDate || '',
      category: initialData.category || '',
      assignedTo: initialData.assignedTo || '',
    });
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (isEditMode) {
        response = await taskAPI.updateTask(initialData.id, formData);
      } else {
        response = await taskAPI.createTask(formData);
      }
      onTaskCreated(response.data);
      if (!isEditMode) {
        setFormData({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
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

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-100 border border-red-200 text-red-700 text-sm">
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
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Due Date and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-6 px-4 py-2 border border-transparent text-black dark:text-white rounded-md shadow-sm text-sm font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          loading ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {loading ? (isEditMode ? 'Updating Task...' : 'Creating Task...') : (isEditMode ? 'Update Task' : 'Create Task')}
      </button>
      
      {isEditMode && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="w-full mt-2 px-4 py-2 border border-gray-300 text-black rounded-md shadow-sm text-sm font-medium dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
}
