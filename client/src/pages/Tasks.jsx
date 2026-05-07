import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, CheckCircle2, Circle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createTask, fetchTasks as fetchTasksApi, updateTask, fetchTeacherInsights } from '../services/dashboardService';

const Tasks = ({ isAdmin = false }) => {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', assigned_to: '', subject: 'General' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [proofInputId, setProofInputId] = useState(null);
  const [proofLink, setProofLink] = useState('');

  async function loadTasks() {
    if (!user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchTasksApi({
        userId: user.id,
        role: isAdmin ? 'teacher' : 'student',
      });
      setTasks(data);

      if (isAdmin && profile?.id) {
        // Fetch teacher's own students to populate the dropdown
        const insights = await fetchTeacherInsights(profile.id);
        setTeacherStudents(insights.students || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [user, isAdmin]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...newTask,
        assigned_by: user.id,
        status: 'pending',
      });
      setShowAddForm(false);
      setNewTask({ title: '', description: '', deadline: '', assigned_to: '', subject: 'General' });
      loadTasks();
    } catch (err) {
      alert('Backend Error: ' + err.message);
      console.error('Error adding task:', err);
    }
  };

  const toggleTaskStatus = async (task) => {
    if (isAdmin) return;
    try {
      if (task.status === 'completed') {
        // Unmark as completed
        await updateTask(task.id, { status: 'pending', proof_link: null });
        loadTasks();
      } else {
        // Trigger proof popup instead of instantly completing
        setProofInputId(task.id);
        setProofLink('');
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const submitProof = async (taskId) => {
    if (!proofLink.trim()) return alert("Please provide a valid work link before completing!");
    try {
      await updateTask(taskId, { status: 'completed', proof_link: proofLink });
      setProofInputId(null);
      setProofLink('');
      loadTasks();
    } catch (err) {
      console.error('Error submitting proof:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      task.title?.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.subject?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{isAdmin ? 'Manage Tasks' : 'My Tasks'}</h1>
          <p className="text-gray-400">{isAdmin ? 'Assign and track student assignments' : 'Keep track of your study assignments'}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddForm((v) => !v)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> {showAddForm ? 'Close' : 'Create Task'}
          </button>
        )}
      </header>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 glass p-2 flex items-center gap-2 rounded-xl">
          <Search size={18} className="text-gray-500 ml-2" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="bg-transparent border-none outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isAdmin && showAddForm && (
        <form onSubmit={handleAddTask} className="glass-card grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
          <input type="date" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} required />
          <select 
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none" 
            value={newTask.assigned_to} 
            onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} 
            required
            style={{ backgroundColor: '#0f172a' }}
          >
            <option value="" disabled>Select Student</option>
            {teacherStudents.map(s => (
              <option key={s.studentId} value={s.studentId}>
                {s.name} (id: {s.studentId.substring(0, 6)})
              </option>
            ))}
          </select>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Subject (Math, Science...)" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} />
          <textarea className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          <button className="btn btn-primary md:col-span-2" type="submit">Assign Task</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="glass-card text-center py-12 italic text-gray-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-card text-center py-16">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold">No tasks found</h3>
            <p className="text-gray-400 mt-2">You're all caught up!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${task.status === 'completed' ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <button onClick={() => toggleTaskStatus(task)} className={`mt-1 shrink-0 ${isAdmin ? 'cursor-default opacity-50' : 'cursor-pointer hover:scale-110 transition-transform'}`}>
                {task.status === 'completed' ? <CheckCircle2 className="text-primary" /> : <Circle className="text-gray-500" />}
              </button>
              <div className="flex-1">
                <h3 className={`font-bold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</h3>
                {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
                
                {proofInputId === task.id && (
                  <div className="mt-3 flex items-center gap-2">
                    <input 
                      type="url" 
                      placeholder="Paste link to your work (Google Docs, etc)..." 
                      className="flex-1 bg-[#0f172a] border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                    />
                    <button onClick={() => submitProof(task.id)} className="btn btn-primary px-4 py-2 text-sm">Submit</button>
                    <button onClick={() => setProofInputId(null)} className="px-3 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-4">
                  {task.deadline && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={14} /> {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={14} /> Assigned to: <span className="text-gray-300 ml-1 font-mono">{(task.assigned_to || '').substring(0, 6)}</span>
                    </div>
                  )}
                  {task.proof_link && (
                    <a href={task.proof_link} target="_blank" rel="noreferrer" className="text-xs font-bold text-secondary-light hover:underline bg-secondary/10 px-2 py-1 rounded">
                      View Work Proof
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
