import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Trash2,
  Edit,
  User,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';

const Tasks = ({ isAdmin = false }) => {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', assigned_to: '' });

  useEffect(() => {
    fetchTasks();
  }, [user, isAdmin]);

  const fetchTasks = async () => {
    try {
      let query = supabase.from('tasks').select('*');
      
      if (isAdmin) {
        query = query.eq('assigned_by', user.id);
      } else {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').insert([{
        ...newTask,
        assigned_by: user.id,
        status: 'pending'
      }]);
      if (error) throw error;
      setShowAddModal(false);
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'in_progress': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{isAdmin ? 'Manage Tasks' : 'My Tasks'}</h1>
          <p className="text-gray-400">{isAdmin ? 'Assign and track student assignments' : 'Keep track of your study assignments'}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Create Task
          </button>
        )}
      </header>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 glass p-2 flex items-center gap-2 rounded-xl">
          <Search size={18} className="text-gray-500 ml-2" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
        <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="glass-card text-center py-16">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold">No tasks found</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => !isAdmin && updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  className={`transition-colors ${task.status === 'completed' ? 'text-green-500' : 'text-gray-500 hover:text-primary'}`}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div>
                  <h3 className={`font-bold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(task.deadline).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full border ${getStatusColor(task.status)} capitalize`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User size={14} /> Assigned to: <span className="text-gray-300 ml-1">Student UID</span>
                  </div>
                )}
                <button className="p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg relative z-10"
            >
              <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary outline-none"
                    placeholder="e.g. Mathematics Chapter 5"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary outline-none h-32"
                    placeholder="Provide details about the task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Deadline</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary outline-none"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Student ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary outline-none"
                      placeholder="uuid..."
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-glass flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
