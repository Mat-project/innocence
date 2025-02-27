import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, Tag, MessageCircle, Paperclip, AlertCircle } from 'lucide-react';
import { taskAPI } from '../../service/api';

const statusColumns = {
  todo: { title: 'To Do', items: [], color: 'bg-gray-100 dark:bg-gray-800' },
  inprogress: { title: 'In Progress', items: [], color: 'bg-blue-50 dark:bg-blue-950' },
  completed: { title: 'Completed', items: [], color: 'bg-green-50 dark:bg-green-950' },
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function KanbanBoard({ refreshFlag, onStatusChange }) {
  const [columns, setColumns] = useState(statusColumns);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks();
      const tasks = response.data;

      // Reset columns before populating to avoid duplicates
      const newColumns = {
        todo: { ...statusColumns.todo, items: [] },
        inprogress: { ...statusColumns.inprogress, items: [] },
        completed: { ...statusColumns.completed, items: [] },
      };

      tasks.forEach((task) => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push(task);
        }
      });

      setColumns(newColumns);
    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshFlag]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Clone state
    const newColumns = JSON.parse(JSON.stringify(columns));
    const sourceColumn = newColumns[source.droppableId];
    const destColumn = newColumns[destination.droppableId];
    const [movedTask] = sourceColumn.items.splice(source.index, 1);

    // Update task status based on the destination column
    movedTask.status = destination.droppableId;
    destColumn.items.splice(destination.index, 0, movedTask);
    setColumns(newColumns);

    try {
      await taskAPI.updateTask(movedTask.id, { status: movedTask.status });
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error('Failed to update task status:', err.response?.data || err.message);
      // If unauthorized, ensure tokens are valid
      fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col lg:flex-row gap-4 pb-4 overflow-x-auto">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className={`flex-1 min-w-full lg:min-w-[300px] rounded-lg ${column.color} p-4 shadow-sm border border-gray-200 dark:border-gray-700`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              {column.title}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {column.items.length} tasks
              </span>
            </h3>
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-[200px] rounded-lg transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  {column.items.map((task, index) => (
                    <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white break-words">
                              {task.title}
                            </h4>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 break-words">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            {task.category && (
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-1" />
                                {task.category}
                              </div>
                            )}
                            {task.comments?.length > 0 && (
                              <div className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {task.comments.length}
                              </div>
                            )}
                            {task.attachments?.length > 0 && (
                              <div className="flex items-center">
                                <Paperclip className="h-4 w-4 mr-1" />
                                {task.attachments.length}
                              </div>
                            )}
                          </div>
                          {task.assignedTo && (
                            <div className="mt-3 flex items-center">
                              <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                                {task.assignedTo.charAt(0).toUpperCase()}
                              </div>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                                {task.assignedTo}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}