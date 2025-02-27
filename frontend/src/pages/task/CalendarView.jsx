import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import { taskAPI } from "../../service/api";

const priorityColors = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};

const EventDetailModal = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-60"
        onClick={onClose}
      ></div>
      {/* Modal content */}
      <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {event.title}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          <strong>Priority:</strong> {event.extendedProps.priority}
        </p>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          <strong>Status:</strong> {event.extendedProps.status}
        </p>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          <strong>Due Date:</strong>{" "}
          {event.start ? moment(event.start).format("LLL") : "N/A"}
        </p>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          <strong>Description:</strong>{" "}
          {event.extendedProps.description || "No description"}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-indigo-600 text-black dark:text-white rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function CalendarView({ refreshFlag }) {
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // New filters: status and priority
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // For the "Upcoming Tasks" sidebar
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks();
      setAllTasks(response.data);
    } catch (err) {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and map tasks to calendar events.
  const applyFilters = () => {
    const today = moment();
    const filtered = allTasks.filter((task) => {
      // Status filter: if "all", include every task; otherwise include tasks matching filter.
      const statusMatch =
        filterStatus === "all" ? true : task.status === filterStatus;
      // Priority filter:
      const priorityMatch =
        filterPriority === "all" ? true : task.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
    
    // Map filtered tasks to calendar events:
    const events = filtered.map((task) => {
      let start;
      if (task.status === "completed" && task.updated_at) {
        // Completed tasks appear on the completion date
        start = moment(task.updated_at).toDate();
      } else {
        // For tasks "todo" or "inprogress", use due_date or default to today.
        start = task.due_date
          ? moment(task.due_date).toDate()
          : today.toDate();
      }
      return {
        id: task.id,
        title: task.title,
        start,
        backgroundColor: priorityColors[task.priority] || "#6366F1",
        extendedProps: { ...task },
      };
    });
    setTasks(events);

    // Calculate upcoming tasks (next 7 days and not completed) for the sidebar.
    const upcoming = allTasks.filter(task => {
      if (task.status === "completed") return false;
      if (task.due_date) {
        const due = moment(task.due_date);
        const diff = due.diff(today, "days");
        return diff >= 0 && diff <= 7;
      }
      return false;
    });
    setUpcomingTasks(upcoming);
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshFlag]);

  useEffect(() => {
    if (allTasks.length) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTasks, filterStatus, filterPriority]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Filter Panel */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mr-2">
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 border rounded-md text-black dark:text-white bg-white dark:bg-gray-700"
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mr-2">
              Priority:
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2 py-1 border rounded-md text-black dark:text-white bg-white dark:bg-gray-700"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          events={tasks}
          eventClick={(info) => setSelectedEvent(info.event)}
          height="600px"
        />
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>

      {/* Upcoming Tasks Sidebar */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Upcoming Tasks
        </h3>
        {upcomingTasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No upcoming tasks in the next 7 days.
          </p>
        ) : (
          <ul>
            {upcomingTasks.map((task) => (
              <li
                key={task.id}
                className="mb-3 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {task.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due:{" "}
                  {task.due_date
                    ? moment(task.due_date).format("LLL")
                    : "Not set"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Priority: {task.priority}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
