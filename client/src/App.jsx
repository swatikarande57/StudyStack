import React from 'react';
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
import { useAuth } from './context/AuthContext';

const App = () => {
  const { profile } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={
          profile?.role === 'teacher' ? <Navigate to="/teacher/overview" /> : <StudentDashboard />
        } />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/goals" element={<Goals />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/overview" element={<TeacherDashboard />} />
        <Route path="/teacher/tasks" element={<Tasks isAdmin={true} />} />
        
        {/* Placeholder Routes */}
        <Route path="/timetable" element={<div className="p-8"><h1 className="text-3xl font-bold">Timetable Coming Soon</h1></div>} />
        <Route path="/progress" element={<div className="p-8"><h1 className="text-3xl font-bold">Progress Analytics Coming Soon</h1></div>} />
        <Route path="/ai-mentor" element={<AIMentor />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
