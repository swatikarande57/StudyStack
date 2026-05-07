import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTasks } from '../services/dashboardService';

const Timetable = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchTasks({ userId: user.id, role: 'student' }).then(setTasks).catch(console.error);
  }, [user]);

  const weekPlan = useMemo(() => {
    const dayMap = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    tasks.forEach((task) => {
      const day = task.deadline
        ? new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'long' })
        : 'Monday';
      const subject = task.subject || 'General';
      const hour = 18 + (dayMap[day]?.length || 0);
      const prettyHour = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      if (dayMap[day]) dayMap[day].push(`${subject}: ${task.title} - ${prettyHour}`);
    });
    return Object.entries(dayMap)
      .filter(([, slots]) => slots.length > 0)
      .map(([day, slots]) => ({ day, slots }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      <header className="glass-card">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays size={20} /> AI Timetable</h1>
        <p className="text-gray-400 mt-1">Personalized weekly study schedule based on your pending tasks.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weekPlan.length === 0 && (
          <div className="glass-card md:col-span-2 text-gray-400">No scheduled tasks yet. Once tasks are assigned, timetable entries will appear here automatically.</div>
        )}
        {weekPlan.map((item) => (
          <div key={item.day} className="glass-card">
            <h3 className="font-bold mb-3">{item.day}</h3>
            <div className="space-y-2">
              {item.slots.map((slot) => (
                <div key={slot} className="rounded-lg bg-white/5 px-3 py-2 text-sm flex items-center gap-2">
                  <Clock3 size={14} className="text-primary-light" />
                  {slot}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timetable;
