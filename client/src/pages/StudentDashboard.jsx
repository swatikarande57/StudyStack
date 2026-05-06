import React from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Target,
  ArrowUpRight,
  Flame,
  Calendar
} from 'lucide-react';

const data = [
  { name: 'Mon', hours: 4, tasks: 3 },
  { name: 'Tue', hours: 6, tasks: 5 },
  { name: 'Wed', hours: 3, tasks: 2 },
  { name: 'Thu', hours: 8, tasks: 6 },
  { name: 'Fri', hours: 5, tasks: 4 },
  { name: 'Sat', hours: 7, tasks: 4 },
  { name: 'Sun', hours: 4, tasks: 2 },
];

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
  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tasks Completed" 
          value="24 / 30" 
          icon={CheckCircle2} 
          color="bg-blue-500" 
          trend="12"
        />
        <StatCard 
          title="Study Hours" 
          value="42.5h" 
          icon={Clock} 
          color="bg-purple-500" 
          trend="8"
        />
        <StatCard 
          title="Productivity Score" 
          value="88%" 
          icon={TrendingUp} 
          color="bg-green-500" 
          trend="5"
        />
        <StatCard 
          title="Goal Progress" 
          value="92%" 
          icon={Target} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 glass-card h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Weekly Performance</h3>
            <div className="flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Study Hours</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-secondary"></div> Tasks Done</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={data}>
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
        </div>

        {/* Right Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-card bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Flame className="text-orange-500" size={24} />
              </div>
              <div>
                <h4 className="font-bold">Study Streak</h4>
                <p className="text-2xl font-black italic">12 DAYS 🔥</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              You're doing great! Keep it up for 3 more days to reach your next badge.
            </p>
          </div>

          <div className="glass-card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary-light" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Maths Assignment', due: 'Tomorrow', color: 'border-red-500' },
                { title: 'Project Research', due: 'In 3 days', color: 'border-yellow-500' },
                { title: 'Science Quiz', due: 'Next Week', color: 'border-blue-500' }
              ].map((item, i) => (
                <div key={i} className={`p-3 bg-white/5 rounded-xl border-l-4 ${item.color}`}>
                  <h5 className="text-sm font-medium">{item.title}</h5>
                  <p className="text-xs text-gray-500 mt-1">{item.due}</p>
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
