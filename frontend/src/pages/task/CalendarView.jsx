import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import moment from "moment";
import { taskAPI } from "../../service/api";

const priorityColors = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};

export default function CalendarView({ refreshFlag }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks();
      const events = response.data.map((task) => ({
        id: task.id,
        title: task.title,
        start: moment(task.dueDate).toDate(),
        backgroundColor: priorityColors[task.priority] || "#6366F1",
      }));
      setTasks(events);
    } catch (err) {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshFlag]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={tasks}
        eventBackgroundColor={(event) => event.backgroundColor}
        height="600px"
      />
    </div>
  );
}
