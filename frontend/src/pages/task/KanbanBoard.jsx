import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, Tag, MessageCircle, Paperclip } from 'lucide-react';
import { taskAPI } from '../../service/api';

const statusColumns = {
  todo: {
    title: 'To Do',
    items: [],
    color: 'bg-gray-100 dark:bg-gray-700',
  },
  inprogress: {
    title: 'In Progress',
    items: [],
    color: 'bg-blue-50 dark:bg-blue-900',
  },
  completed: {
    title: 'Completed',
    items: [],
    color: 'bg-green-50 dark:bg-green-900',
  },
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
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
      const newColumns = { ...statusColumns };

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

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    const sourceItems = Array.from(sourceColumn.items);
    const [removed] = sourceItems.splice(source.index, 1);
    removed.status = destination.droppableId;

    const destItems = Array.from(destColumn.items);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });

    try {
      await taskAPI.updateTask(removed.id, { status: removed.status });
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error('Failed to update task status.');
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
    return <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className={`flex-1 min-w-[320px] rounded-lg ${column.color} p-4`}>
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
                  className={`space-y-3 min-h-[200px] ${
                    snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-600' : ''
                  } rounded-lg transition-colors duration-200`}
                >
                  {column.items.map((task, index) => (
                    <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>

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
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{task.assignedTo}</span>
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
