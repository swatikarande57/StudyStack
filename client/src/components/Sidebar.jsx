import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Target, 
  MessageSquare, 
  LogOut,
  Bell,
  Settings,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { profile, signOut, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Timetable', icon: Calendar, path: '/timetable' },
    { name: 'Progress', icon: BarChart3, path: '/progress' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'AI Mentor', icon: MessageSquare, path: '/ai-mentor' },
  ];

  const adminItems = [
    { name: 'Class Overview', icon: Users, path: '/teacher/overview' },
    { name: 'Assign Tasks', icon: CheckSquare, path: '/teacher/tasks' },
  ];

  return (
    <div className="w-64 h-screen glass border-r border-white/10 flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-2 py-6 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-xl font-bold italic">SS</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Study-Stack
        </h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
          Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mt-8 mb-2">
              Teacher Tools
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-2">
        <div className="px-4 py-3 flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{profile?.role || 'Student'}</p>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="nav-link text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
