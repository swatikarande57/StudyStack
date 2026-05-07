import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Clock, TrendingUp, Target, ArrowUpRight, Flame, Calendar, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchGoals, fetchStudentProgress, fetchTasks } from '../services/dashboardService';
import { motion } from 'framer-motion';
import { supabase } from '../api/supabase';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="glass-card hover:translate-y-[-4px]">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <span className="flex items-center text-green-400 text-xs font-bold">
          <ArrowUpRight size={14} /> {trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [goalPayload, setGoalPayload] = useState({ goals: [] });
  const [loading, setLoading] = useState(true);
  const [classKeyInput, setClassKeyInput] = useState('');
  const [joining, setJoining] = useState(false);

  const todayDue = useMemo(
    () => Array.isArray(tasks) ? tasks.filter((task) => task.deadline && new Date(task.deadline).toDateString() === new Date().toDateString()).length : 0,
    [tasks]
  );

  const fetchDashboardData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const [taskData, progressData, goalsData] = await Promise.all([
        fetchTasks({ userId: user.id, role: 'student' }),
        fetchStudentProgress(user.id),
        fetchGoals(user.id),
      ]);
      setTasks(taskData);
      setProgress(progressData);
      setGoalPayload(goalsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classKeyInput.trim()) return;
    setJoining(true);
    try {
      const { error } = await supabase
        .from('student_classes')
        .insert({ 
          student_id: user.id,
          class_key: classKeyInput.toUpperCase()
        });
      if (error) throw error;
      window.location.reload(); // Refresh to update profile context
    } catch (err) {
      if (err.code === '23505') {
          alert('You have already joined this room!');
          window.location.reload();
      } else {
          alert('Failed to join class: ' + err.message);
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="glass-card">Loading dashboard...</div>;

  // Show Join Class Modal if no class key
  if (!profile?.classes || profile.classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full text-center p-12 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="text-primary" size={32} />
            </div>
            <h2 className="text-2xl font-black mb-4 italic">Join a Virtual Room</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              To see your tasks, goals, and class analytics, enter the **Class Room Key** provided by your teacher.
            </p>
            <form onSubmit={handleJoinClass} className="space-y-4">
              <input 
                type="text" 
                placeholder="ENTER CLASS KEY" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-center text-lg font-black tracking-widest focus:border-primary outline-none transition-all uppercase"
                value={classKeyInput}
                onChange={(e) => setClassKeyInput(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary w-full py-4 text-lg"
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Enter Room'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const completed = Array.isArray(tasks) ? tasks.filter((task) => task.status === 'completed').length : 0;
  const goalProgress = Math.round(
    (Array.isArray(goalPayload?.goals) ? goalPayload.goals.reduce((sum, item) => sum + Number(item.progress || item.completion_percentage || 0), 0) : 0) /
      Math.max(Array.isArray(goalPayload?.goals) ? goalPayload.goals.length : 1, 1)
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tasks Completed" value={`${completed} / ${tasks?.length || 0}`} icon={CheckCircle2} color="bg-blue-500" trend={Math.max(progress?.completionRate || 0, 1)} />
        <StatCard title="Tasks Due Today" value={todayDue} icon={Clock} color="bg-purple-500" />
        <StatCard title="Productivity Score" value={`${progress?.productivityScore ?? 0}%`} icon={TrendingUp} color="bg-green-500" />
        <div className="glass-card flex flex-col justify-between">
           <div>
               <h3 className="text-gray-400 text-sm font-medium mb-2">Join Another Room</h3>
               <form onSubmit={handleJoinClass} className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Class Key" 
                   value={classKeyInput}
                   onChange={(e) => setClassKeyInput(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm uppercase focus:border-primary outline-none"
                   required
                 />
                 <button type="submit" disabled={joining} className="btn btn-primary px-4 py-2 text-sm rounded-lg whitespace-nowrap">
                   {joining ? '...' : 'Join'}
                 </button>
               </form>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Weekly Performance</h3>
            <div className="flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Study Hours</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-secondary"></div> Tasks Done</span>
            </div>
          </div>
          {Array.isArray(progress?.trends) && progress.trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={progress.trends.map((item) => ({ 
                name: item.day || '?', 
                hours: Number(item.studyHours || 0), 
                tasks: Number(item.completion || 0) / 20 
              }))}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#4f46e5" 
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#0891b2" 
                  fill="transparent" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[90%] flex items-center justify-center text-gray-500 text-sm italic">
              No activity trends available yet. Complete some tasks to see your progress!
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Flame className="text-orange-500" size={24} />
              </div>
              <div>
                <h4 className="font-bold">Study Streak</h4>
                <p className="text-2xl font-black italic">{Math.max(1, 7 - (progress?.inactivityDays ?? 0))} DAYS</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Maintain your daily focus to reach your output goals. Consistency is the key to mastery!
            </p>
          </div>

          <div className="glass-card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary-light" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-4">
              {Array.isArray(tasks) && tasks.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-white/5 rounded-xl border-l-4 border-blue-500">
                  <h5 className="text-sm font-medium">{item.title}</h5>
                  <p className="text-xs text-gray-500 mt-1">{item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
