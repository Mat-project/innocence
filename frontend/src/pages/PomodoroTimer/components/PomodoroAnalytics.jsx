import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getPomodoroSessions, getPomodoroStatistics } from '../../../services/api/pomodoroApi';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  ArcElement,
  Filler, // Add Filler plugin import
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, subDays, parseISO, isAfter } from 'date-fns';
// Add missing icon imports
import { Clock as ClockIcon, Calendar as CalendarIcon, TrendingUp as TrendingUpIcon, BarChart as ChartBarIcon } from 'lucide-react';

// Register Chart.js components, including the Filler plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler, // Register the Filler plugin
  Title,
  Tooltip,
  Legend
);

const PomodoroAnalytics = () => {
  const [sessions, setSessions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('week'); // 'day', 'week', 'month', 'year'
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, timeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsData, statsData] = await Promise.all([
        getPomodoroSessions(),
        getPomodoroStatistics()
      ]);
      
      setSessions(sessionsData);
      setStatistics(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Pomodoro data:', err);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Prepare data for charts based on timeframe
  const prepareChartData = () => {
    if (!sessions.length) return null;

    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Filter sessions based on selected timeframe
    const today = new Date();
    const filteredSessions = sortedSessions.filter(session => {
      const sessionDate = new Date(session.date);
      
      switch(timeframe) {
        case 'day':
          return sessionDate.toDateString() === today.toDateString();
        case 'week':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          return sessionDate >= oneWeekAgo;
        case 'month':
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(today.getMonth() - 1);
          return sessionDate >= oneMonthAgo;
        case 'year':
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(today.getFullYear() - 1);
          return sessionDate >= oneYearAgo;
        default:
          return true;
      }
    });

    // Group sessions by date for daily totals
    const sessionsByDate = {};
    filteredSessions.forEach(session => {
      const date = session.date;
      if (!sessionsByDate[date]) {
        sessionsByDate[date] = {
          totalMinutes: 0,
          count: 0
        };
      }
      sessionsByDate[date].totalMinutes += session.focus_time;
      sessionsByDate[date].count += 1;
    });

    // Create labels and data arrays for chart
    const labels = Object.keys(sessionsByDate).map(date => formatDate(date));
    const focusData = Object.values(sessionsByDate).map(data => data.totalMinutes);
    const sessionCounts = Object.values(sessionsByDate).map(data => data.count);

    return {
      labels,
      focusData,
      sessionCounts,
      sessionsByDate
    };
  };

  // Create the line chart for focus time
  const renderFocusLineChart = () => {
    const chartData = prepareChartData();
    if (!chartData) return null;

    const data = {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Focus Minutes',
          data: chartData.focusData,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Focus Time Trend'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes'
          }
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  // Create the bar chart for session counts
  const renderSessionCountChart = () => {
    const chartData = prepareChartData();
    if (!chartData) return null;

    const data = {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Number of Sessions',
          data: chartData.sessionCounts,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Sessions Completed'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  // Create a pie chart for day of week distribution
  const renderDayOfWeekChart = () => {
    if (!statistics || !statistics.by_day_of_week) return null;

    const dayData = statistics.by_day_of_week;
    const days = Object.keys(dayData);
    const counts = days.map(day => dayData[day]);

    const data = {
      labels: days,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)'
          ],
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Focus Time by Day of Week'
        }
      }
    };

    return <Pie data={data} options={options} />;
  };

  // Render stats summary cards
  const renderStatCards = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 mr-3">
              <ClockIcon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Focus Time</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {Math.round(statistics.total_focus_hours * 10) / 10}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mr-3">
              <CalendarIcon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sessions</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {statistics.total_sessions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-500 mr-3">
              <TrendingUpIcon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {statistics.completion_rate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mr-3">
              <ChartBarIcon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Per Day</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {Math.round(statistics.total_sessions / 7 * 10) / 10}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md my-4">
        <p>Sign in to view your Pomodoro statistics and track your productivity over time.</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-blue-50 text-blue-700 p-4 rounded-md my-4">
        <p>Complete some Pomodoro sessions to see your productivity analytics here!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Your Productivity Analytics</h2>
      
      {/* Timeframe selector */}
      <div className="mb-6">
        <div className="flex flex-wrap space-x-2">
          <button 
            onClick={() => setTimeframe('day')}
            className={`px-3 py-1 rounded-full text-sm ${
              timeframe === 'day' 
                ? 'bg-blue-500 text-black dark:text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded-full text-sm ${
              timeframe === 'week' 
                ? 'bg-blue-500 text-black dark:text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-full text-sm ${
              timeframe === 'month' 
                ? 'bg-blue-500 text-black dark:text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => setTimeframe('year')}
            className={`px-3 py-1 rounded-full text-sm ${
              timeframe === 'year' 
                ? 'bg-blue-500 text-black dark:text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Stats summary cards */}
      {renderStatCards()}
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {renderFocusLineChart()}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {renderSessionCountChart()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {renderDayOfWeekChart()}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Productivity Insights</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              {statistics?.completion_rate > 80 
                ? "Great job! Your completion rate is excellent." 
                : "Try to complete more of your started sessions."}
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {statistics?.total_sessions > 20 
                ? "You're building a consistent Pomodoro habit." 
                : "Aim for at least 4 Pomodoro sessions per day for best results."}
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              Your most productive day is {
                statistics?.by_day_of_week && 
                Object.entries(statistics.by_day_of_week).sort((a, b) => b[1] - a[1])[0][0]
              }.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PomodoroAnalytics;