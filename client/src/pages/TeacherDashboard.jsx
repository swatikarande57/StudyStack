import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, TrendingDown, CheckCircle2, MoreHorizontal, Mail, Clock } from 'lucide-react';
import { CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { assignPracticeTasks, fetchTeacherInsights, sendReminder, fetchTasks } from '../services/dashboardService';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    if (!profile?.id) return;
    try {
      const [data, taskData] = await Promise.all([
        fetchTeacherInsights(profile.id),
        fetchTasks({ userId: profile.id, role: 'teacher' })
      ]);
      
      setInsights(data);
      setTasks(taskData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [profile]);

  const classData = useMemo(() => (
    (insights?.students ?? []).slice(0, 6).map((s, idx) => ({ name: `S${idx + 1}`, avgScore: s.score }))
  ), [insights]);

  const handleAssignPractice = async () => {
    await assignPracticeTasks(user.id);
    loadInsights();
  };

  const handleSendWarning = async () => {
    const first = insights?.atRiskStudents?.[0];
    if (!first) return;
    await sendReminder(first.studentId, 'Your teacher recommends focused revision this week.');
  };

  if (loading) return <div className="glass-card">Loading teacher insights...</div>;
  const students = insights?.students ?? [];

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Class Performance Overview</h1>
          <p className="text-xs md:text-sm text-gray-400">Monitor student progress and identify areas for improvement.</p>
        </div>
        {profile?.class_key && (
          <div className="bg-secondary/10 border border-secondary/30 px-4 md:px-6 py-2 md:py-3 rounded-2xl text-left sm:text-right shrink-0">
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-secondary font-black">Virtual Room Key</p>
            <p className="text-xl md:text-2xl font-black text-white">{profile.class_key}</p>
          </div>
        )}
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold mt-1">{students.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
        </div>
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Avg. Score</p>
            <p className="text-3xl font-bold mt-1">{Math.round(students.reduce((acc, cur) => acc + cur.score, 0) / Math.max(students.length, 1))}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-500/10 text-green-500">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="glass-card flex items-center justify-between border-blue-500/30 cursor-pointer hover:bg-white/5 transition-all" onClick={() => navigate('/teacher/tasks')}>
          <div>
            <p className="text-gray-400 text-sm">Pending Reviews</p>
            <p className="text-3xl font-bold mt-1 text-blue-400">{tasks.filter(t => t.status === 'submitted').length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Progress Line Chart */}
        <div className="glass-card h-[350px]">
          <h3 className="text-lg font-bold mb-6">Class Mastery Trend</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Student List */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Student Performance</h3>
            <button onClick={() => navigate('/teacher/tasks')} className="text-sm text-primary-light font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {students.map((item) => (
              <div key={item.studentId} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xs">
                    {(item.name || '').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-[120px] sm:max-w-none">{item.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5">
                      <span className="text-[9px] text-gray-500 font-mono tracking-tighter sm:tracking-normal">ID: {item.studentId.slice(0,8)}...</span>
                      <span className={`text-[9px] uppercase tracking-wider font-bold ${
                        item.score < 50 ? 'text-red-500' : 
                        item.score > 85 ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {item.score < 50 ? 'At Risk' : item.score > 85 ? 'Excellence' : 'Average'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.score}%</p>
                    <div className="w-20 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.score < 50 ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <button onClick={() => {
                    sendReminder(item.studentId, `Reminder from your teacher: stay consistent with your pending tasks.`, true);
                    alert(`Email reminder sent to ${item.name}`);
                  }} className="p-2 rounded-lg group-hover:bg-white/10" title="Send email reminder">
                    <Mail size={18} className="text-primary-light" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Insights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights?.topPerformer && insights.topPerformer !== 'N/A' && (
          <div className="glass-card border-l-4 border-primary bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20 text-primary-light">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold">Top Performer Insight</h3>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Student <span className="text-white font-bold">{insights.topPerformer}</span> is performing exceptionally well this week.
                </p>
                <button className="btn btn-primary text-[10px] px-3 py-1.5 mt-4">Recognition Sent</button>
              </div>
            </div>
          </div>
        )}

        {insights?.atRiskCount > 0 && (
          <div className="glass-card border-l-4 border-red-500 bg-red-500/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
                <TrendingDown size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Weakness Alert: {insights?.mostIgnoredSubject || 'General'}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {insights?.atRiskCount} students are currently categorized as 'At-Risk' in {insights?.mostIgnoredSubject || 'General'} based on recent performance.
                </p>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleAssignPractice} className="btn btn-primary bg-red-600 hover:bg-red-700 text-xs px-4 py-2">
                    Assign Practice
                  </button>
                  <button onClick={handleSendWarning} className="btn btn-glass text-xs px-4 py-2 flex items-center gap-2">
                    <Mail size={14} /> Notify At-Risk
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
