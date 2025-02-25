import React, { useState } from 'react';
import { Calendar, Clock, ListTodo, Kanban, Settings } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';
import { Switch } from "@/component/ui/switch";  // Capital 'S'

import { useTheme } from '@/context/ThemeContext';

export default function TaskPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', or 'calendar'
  const { theme, setTheme } = useTheme();

  const handleTaskCreated = () => {
    setRefreshFlag(prev => !prev);
  };

  const viewOptions = [
    { id: 'list', icon: ListTodo, label: 'List' },
    { id: 'kanban', icon: Kanban, label: 'Kanban' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      <header className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Task Management
          </h1>
          
          <div className="flex items-center gap-4">
{/*             <div className="flex items-center space-x-2">
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
{/*               <span className="text-sm text-gray-700 dark:text-gray-300">
                {theme === 'dark' ? 'Dark' : 'Light'} Mode
              </span>
            </div> */}
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex gap-1">
              {viewOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    viewMode === id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TaskForm onTaskCreated={handleTaskCreated} />
        </div>
        
        <div className="lg:col-span-3">
          {viewMode === 'list' && <TaskList refreshFlag={refreshFlag} />}
          {viewMode === 'kanban' && <KanbanBoard refreshFlag={refreshFlag} onStatusChange={handleTaskCreated} />}
          {viewMode === 'calendar' && <CalendarView refreshFlag={refreshFlag} />}
        </div>
      </div>
    </div>
  );
}