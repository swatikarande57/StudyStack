import { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchStudentProgress, fetchGoals, fetchTasks } from '../services/dashboardService';

const ProgressBar = ({ label, value, color = 'from-primary to-secondary', sublabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <span className="font-medium">{label}</span>
      <span className="font-black text-lg">{value}%</span>
    </div>
    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
    {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
  </div>
);

const ProgressPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetchStudentProgress(user.id),
      fetchGoals(user.id),
      fetchTasks({ userId: user.id, role: 'student' }),
    ]).then(([p, g, t]) => {
      setProgress(p);
      setGoals(g?.goals ?? []);
      setTasks(t ?? []);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="glass-card">Loading progress...</div>;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const goalAvgProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + Number(g.progress || g.completion_percentage || 0), 0) / goals.length)
    : 0;
  const goalsCompleted = goals.filter(g => Number(g.progress || g.completion_percentage || 0) >= 90).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card">
          <p className="text-gray-400 text-sm">Productivity Score</p>
          <p className="text-3xl font-bold mt-1">{progress?.productivityScore ?? 0}%</p>
        </div>
        <div className="glass-card">
          <p className="text-gray-400 text-sm">Task Completion Rate</p>
          <p className="text-3xl font-bold mt-1">{taskCompletionRate}%</p>
        </div>
        <div className="glass-card">
          <p className="text-gray-400 text-sm">Milestones Hit</p>
          <p className="text-3xl font-bold mt-1">{goalsCompleted} / {goals.length}</p>
        </div>
      </div>

      {/* Live Progress Bars */}
      <div className="glass-card space-y-6">
        <h2 className="font-bold text-xl">Live Progress Indicators</h2>
        <ProgressBar
          label="Productivity Score"
          value={progress?.productivityScore ?? 0}
          color="from-green-400 to-emerald-600"
          sublabel={`Based on overdue tasks vs completed tasks`}
        />
        <ProgressBar
          label="Task Completion Rate"
          value={taskCompletionRate}
          color="from-primary to-secondary"
          sublabel={`${completedTasks} of ${tasks.length} tasks completed`}
        />
        <ProgressBar
          label="Overall Goal Progress"
          value={goalAvgProgress}
          color="from-orange-400 to-yellow-500"
          sublabel={`Average across ${goals.length} milestone(s)`}
        />
        {goals.map(goal => (
          <ProgressBar
            key={goal.id}
            label={goal.title || goal.target}
            value={Number(goal.progress || goal.completion_percentage || 0)}
            color={Number(goal.progress || goal.completion_percentage || 0) >= 90 ? 'from-green-400 to-green-600' : 'from-primary to-secondary'}
            sublabel={goal.deadline ? `Due: ${new Date(goal.deadline).toLocaleDateString()}` : undefined}
          />
        ))}
      </div>

      {/* Weekly Trend Chart */}
      <div className="glass-card h-[300px]">
        <h2 className="font-bold mb-4">Weekly Performance Trend</h2>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={progress?.trends ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
            <Line dataKey="completion" stroke="#6366f1" strokeWidth={2} dot={false} name="Completion %" />
            <Line dataKey="studyHours" stroke="#22d3ee" strokeWidth={2} dot={false} name="Study Hours" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressPage;

