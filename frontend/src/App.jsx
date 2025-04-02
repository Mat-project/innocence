import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LoginForm from './component/auth/LoginForm';
import RegisterForm from './component/auth/RegisterForm';
import DashboardLayout from './component/layout/DashboardLayout';
import TaskPage from './pages/task/TaskPage';
import NotificationsPage from "./component/notifications/NotificationsPage";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './component/dashboard/Dashboard';
import ProfilePage from './pages/profile/ProfilePage';
import LandingPage from './pages/landing/LandingPage';
import AuthLayout from './component/layout/AuthLayout';
import FileConverterPage from './pages/FileConvertor/FileConverterPage';
import About from './component/LandingComponent/about';
import HabitTracker from './pages/HabitTracker/HabitTracker';
import PomodoroTimer from './pages/PomodoroTimer/PomodoroTimer';

import CodeEditorPage from './pages/CodeEditor/CodeEditorPage'; 
import CodeEditorFeature from './pages/CodeEditor/CodeEditorFeature';  
import MobileTaskPage from './pages/task/MobileTaskPage';
import ResponsiveTaskManager from './pages/task/ResponsiveTaskManager';
import ChatPage from './pages/Chat/ChatPage';
import ResetPassword from './pages/ResetPassword';
import Chat from './pages/Chat/fuck/Chat';

// Protected Route component

const queryClient = new QueryClient()
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <RegisterForm />
              </AuthLayout>
            } />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              {/*<Route path="tasks" element={<ResponsiveTaskManager />} />*/}
              <Route path="tasks" element={<TaskPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="file-convertor" element={<FileConverterPage />} />
{/*               <Route path="about" element={<About />} /> */}
              <Route path="habit-tracker" element={<HabitTracker />} />
              <Route path="pomodoro-timer" element={<PomodoroTimer />} />
              <Route path="/code-editor/*" element={<CodeEditorFeature />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chatf" element={<Chat />} />
{/*               <Toaster position="top-right" /> */}
            </Route>

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
