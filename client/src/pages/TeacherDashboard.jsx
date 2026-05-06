import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2,
  ArrowRight,
  MoreHorizontal,
  Mail
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const classData = [
  { name: 'Week 1', avgScore: 65 },
  { name: 'Week 2', avgScore: 72 },
  { name: 'Week 3', avgScore: 68 },
  { name: 'Week 4', avgScore: 85 },
  { name: 'Week 5', avgScore: 78 },
];

const studentPerformance = [
  { student: 'Alex Johnson', score: 92, status: 'Excellence' },
  { student: 'Sarah Smith', score: 88, status: 'Consistent' },
  { student: 'Mike Ross', score: 45, status: 'At Risk' },
  { student: 'Jane Doe', score: 38, status: 'At Risk' },
  { student: 'Harvey Specter', score: 75, status: 'Average' },
];

const TeacherDashboard = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Class Performance Overview</h1>
        <p className="text-gray-400">Monitor student progress and identify areas for improvement.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold mt-1">42</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
        </div>
        <div className="glass-card flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Avg. Score</p>
            <p className="text-3xl font-bold mt-1">74.2%</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-500/10 text-green-500">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="glass-card flex items-center justify-between border-red-500/30">
          <div>
            <p className="text-gray-400 text-sm">Students At Risk</p>
            <p className="text-3xl font-bold mt-1 text-red-500">4</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
            <AlertTriangle size={24} />
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
            <button className="text-sm text-primary-light font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {studentPerformance.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xs">
                    {item.student.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{item.student}</h4>
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${
                      item.status === 'At Risk' ? 'text-red-500' : 
                      item.status === 'Excellence' ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {item.status}
                    </p>
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
                  <button className="p-2 rounded-lg group-hover:bg-white/10">
                    <MoreHorizontal size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak Student Detection Alerts */}
      <div className="glass-card border-l-4 border-red-500 bg-red-500/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
            <TrendingDown size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400">Critical Alert: Low Performance Detected</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Our AI has detected that 4 students have dropped below the 50% performance threshold this week. 
              We recommend assigning additional practice tasks to these students immediately.
            </p>
            <div className="flex gap-4 mt-6">
              <button className="btn btn-primary bg-red-600 hover:bg-red-700 text-xs px-4 py-2">
                Assign Practice Tasks
              </button>
              <button className="btn btn-glass text-xs px-4 py-2 flex items-center gap-2">
                <Mail size={14} /> Notify Parents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
