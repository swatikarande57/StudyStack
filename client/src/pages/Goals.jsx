import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Lock, Unlock, CheckCircle2, TrendingUp, Trophy, ArrowRight, Flame, Plus, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchGoals, updateGoalProgress, createGoal, fetchTeacherInsights } from '../services/dashboardService';

const GoalCard = ({ goal, onBoost, isAdmin }) => {
  const progressVal = Number(goal.progress || goal.completion_percentage || 0);
  const isCompleted = progressVal >= 90;
  
  return (
    <div className={`glass-card relative overflow-hidden transition-all duration-500 hover:scale-[1.02] ${!goal.unlocked && !isAdmin ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${!goal.unlocked ? 'bg-gray-500/20' : 'bg-primary/20'}`}>
          {!goal.unlocked ? <Lock className="text-gray-500" size={24} /> : <Target className="text-primary-light" size={24} />}
        </div>
        {isCompleted && <CheckCircle2 className="text-green-500" size={24} />}
      </div>

      <h3 className="text-xl font-bold mb-2">{goal.title || goal.target}</h3>
      <div className="space-y-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="font-bold">{progressVal}%</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressVal}%` }}
            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-secondary'}`}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp size={14} />
            {!goal.unlocked ? 'Locked (Requires Prev 90%)' : (isCompleted ? 'Completed ✓' : 'In Progress')}
          </div>
          {goal.deadline && (
            <div className="text-xs font-bold text-yellow-400">
              ⏰ Due: {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
        {!isAdmin && goal.unlocked && progressVal < 100 && (
          <button onClick={() => onBoost(goal)} className="text-sm font-bold text-primary-light flex items-center gap-1 hover:underline">
            +10% <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const Goals = ({ isAdmin = false }) => {
  const { user, profile } = useAuth();
  const [goals, setGoals] = useState([]);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  // Assignment state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', deadline: '' });
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    if (isAdmin && profile?.id) {
      fetchTeacherInsights(profile.id).then(insights => {
        const filtered = insights?.data?.students || insights?.students || [];
        setTeacherStudents(filtered);
      });
    }
  }, [isAdmin, profile]);

  useEffect(() => {
    const targetId = isAdmin ? selectedStudent : user?.id;
    if (!targetId) {
      setGoals([]);
      return;
    }
    fetchGoals(targetId).then((payload) => setGoals(payload.goals ?? []));
  }, [user, isAdmin, selectedStudent]);

  const onBoost = async (goal) => {
    if (isAdmin) return;
    const current = Number(goal.progress || goal.completion_percentage || 0);
    const next = Math.min(100, current + 10);
    await updateGoalProgress(goal.id, next);
    const payload = await fetchGoals(user.id);
    setGoals(payload.goals ?? []);
  };

  const handleAssignGoal = async (e) => {
    e.preventDefault();
    setAssignError('');
    
    if (!selectedStudent) {
      setAssignError("Please select a student first!");
      return;
    }

    // STRICT PROGRESSION RULE: Check if ANY existing goals are below 90%
    const hasUnfinishedGoals = goals.some(g => Number(g.progress || g.completion_percentage || 0) < 90);
    if (hasUnfinishedGoals) {
      setAssignError("Cannot assign! Student has an existing milestone below 90%. They must complete it first.");
      return;
    }

    try {
      await createGoal({
        student_id: selectedStudent,
        title: newGoal.title,
        target: newGoal.target || newGoal.title,
        deadline: newGoal.deadline || null,
        assigned_by: profile.id,
      });
      setNewGoal({ title: '', target: '', deadline: '' });
      setShowAddForm(false);
      // Reload goals for this student
      const payload = await fetchGoals(selectedStudent);
      setGoals(payload.goals ?? []);
    } catch (err) {
      alert("Error adding milestone: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{isAdmin ? 'Assign Milestones' : 'Academic Milestones'}</h1>
          <p className="text-xs md:text-sm text-gray-400">
            {isAdmin 
              ? 'Assign goals. Must attain 90% on existing ones first.'
              : 'Unlock new goals by achieving 90% completion.'}
          </p>
        </div>
        
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <select 
              className="bg-[#0f172a] border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary w-full sm:min-w-[200px]"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">-- Select Student --</option>
              {teacherStudents.map(s => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name} (id: {s.studentId.substring(0, 6)})
                </option>
              ))}
            </select>
            {selectedStudent && (
              <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary flex items-center justify-center gap-2 py-2.5">
                <Plus size={18} /> {showAddForm ? 'Cancel' : 'Assign Goal'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="glass px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">
                <Trophy size={20} md:size={24} />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">Milestones Hit</p>
                <p className="text-lg md:text-xl font-black">{goals.filter(g => Number(g.progress) >= 90).length}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {isAdmin && showAddForm && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAssignGoal} 
            className="glass-card bg-primary/5 border border-primary/20 space-y-4"
          >
            <h3 className="font-bold text-lg text-primary-light flex items-center gap-2">
              <Target size={20} /> Create New Milestone
            </h3>
            {assignError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2 text-sm font-bold">
                <AlertCircle size={16} /> {assignError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm" 
                placeholder="Goal Title (e.g. Master Calculus)" 
                value={newGoal.title} 
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} 
                required 
              />
              <input 
                type="date"
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm" 
                title="Deadline for this milestone"
                value={newGoal.deadline} 
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} 
                required
              />
              <input 
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm md:col-span-2" 
                placeholder="Description / Target Detail (optional)" 
                value={newGoal.target} 
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} 
              />
            </div>
            <div className="flex justify-end pt-2">
              <button className="btn btn-primary px-6" type="submit">Deploy Milestone</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onBoost={onBoost} isAdmin={isAdmin} />
        ))}
        {isAdmin && selectedStudent && goals.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 italic glass-card">
            This student has absolutely zero goals. Time to assign their first milestone!
          </div>
        )}
        {isAdmin && !selectedStudent && (
          <div className="col-span-full text-center py-12 text-gray-500 italic glass-card border border-white/5">
            Select a student from the top menu to view or assign milestones.
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="glass-card bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Unlock size={20} className="text-primary-light" />
            How Unlocking Works
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
            To maintain high-quality learning, our system enforces a strict mastery rule. 
            The Teacher cannot assign you a new milestone until you demonstrate 
            <strong> 90% or higher completion</strong> in all your current milestones. 
            Keep pushing your limits!
          </p>
        </div>
      )}
    </div>
  );
};

export default Goals;
