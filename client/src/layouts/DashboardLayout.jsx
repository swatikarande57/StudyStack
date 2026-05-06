import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center bg-surface-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-surface-dark text-white font-inter">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 relative">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
            <p className="text-gray-400">Track your progress and stay productive.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative glass rounded-xl px-4 py-2 flex items-center gap-2">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            <button className="p-2 rounded-xl glass hover:bg-white/10 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a2235]"></span>
            </button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
