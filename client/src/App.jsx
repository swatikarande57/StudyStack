import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import AIMentor from './pages/AIMentor';
import Timetable from './pages/Timetable';
import ProgressPage from './pages/ProgressPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './context/AuthContext';

const RoleRoute = ({ role, children }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  const currentRole = profile?.role || 'student';
  return currentRole === role ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  const { profile, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={profile?.role === 'teacher' ? <Navigate to="/teacher/overview" /> : <StudentDashboard />}
        />
        <Route path="/tasks" element={<RoleRoute role="student"><Tasks /></RoleRoute>} />
        <Route path="/goals" element={<RoleRoute role="student"><Goals /></RoleRoute>} />
        <Route path="/timetable" element={<RoleRoute role="student"><Timetable /></RoleRoute>} />
        <Route path="/progress" element={<RoleRoute role="student"><ProgressPage /></RoleRoute>} />
        <Route path="/ai-mentor" element={<RoleRoute role="student"><AIMentor /></RoleRoute>} />
        
        <Route path="/teacher/overview" element={<RoleRoute role="teacher"><TeacherDashboard /></RoleRoute>} />
        <Route path="/teacher/tasks" element={<RoleRoute role="teacher"><Tasks isAdmin /></RoleRoute>} />
        <Route path="/teacher/goals" element={<RoleRoute role="teacher"><Goals isAdmin /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
