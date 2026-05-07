import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center bg-surface-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-surface-dark text-white font-inter">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 relative">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
            <p className="text-gray-400">Track your progress and stay productive.</p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative glass rounded-xl px-4 py-2 hidden md:flex items-center gap-2">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl glass hover:bg-white/10">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setShowNotifications((v) => !v)} className="p-2 rounded-xl glass hover:bg-white/10 relative">
              <Bell size={20} />
              {notifications.some((item) => !(item.is_read || item.read_status)) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a2235]"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute top-20 right-0 md:right-8 w-80 glass-card z-20">
                <h3 className="font-bold mb-3">Notifications</h3>
                <div className="space-y-2 max-h-72 overflow-auto">
                  {notifications.length === 0 && <p className="text-sm text-gray-400">No notifications yet.</p>}
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`w-full text-left p-3 rounded-lg border ${item.is_read || item.read_status ? 'border-white/10' : 'border-primary/40 bg-primary/10'}`}
                    >
                      <p className="text-sm">{item.message}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
