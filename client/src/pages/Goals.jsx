import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  TrendingUp, 
  Trophy,
  ArrowRight,
  Flame
} from 'lucide-react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';

const GoalCard = ({ goal, onUnlock }) => {
  const isCompleted = goal.progress >= 95;
  
  return (
    <div className={`glass-card relative overflow-hidden transition-all duration-500 ${goal.is_locked ? 'opacity-60 grayscale' : 'hover:scale-[1.02]'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${goal.is_locked ? 'bg-gray-500/20' : 'bg-primary/20'}`}>
          {goal.is_locked ? <Lock className="text-gray-500" size={24} /> : <Target className="text-primary-light" size={24} />}
        </div>
        {isCompleted && <CheckCircle2 className="text-green-500 animate-bounce" size={24} />}
      </div>

      <h3 className="text-xl font-bold mb-2">{goal.target}</h3>
      <div className="space-y-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="font-bold">{goal.progress}%</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            className={`h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000`}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp size={14} />
          {goal.is_locked ? 'Required: Prev 95%' : 'In Progress'}
        </div>
        {!goal.is_locked && !isCompleted && (
          <button className="text-sm font-bold text-primary-light flex items-center gap-1 hover:underline">
            Details <ArrowRight size={14} />
          </button>
        )}
      </div>

      {goal.is_locked && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-surface-dark border border-white/10 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
            <Lock size={14} /> Locked Milestone
          </div>
        </div>
      )}
    </div>
  );
};

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([
    { id: 1, target: 'Complete Basic Algebra', progress: 100, is_locked: false },
    { id: 2, target: 'Master Calculus Fundamentals', progress: 85, is_locked: false },
    { id: 3, target: 'Advanced Physics Projects', progress: 0, is_locked: true },
    { id: 4, target: 'Quantum Mechanics Intro', progress: 0, is_locked: true },
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">Academic Milestones</h1>
          <p className="text-gray-400">Unlock new goals by achieving 95% completion in previous ones.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Badges Earned</p>
              <p className="text-xl font-black">12</p>
            </div>
          </div>
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Goal Streak</p>
              <p className="text-xl font-black">4</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      <div className="glass-card bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Unlock size={20} className="text-primary-light" />
          How Unlocking Works
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
          To maintain high-quality learning, our system enforces a mastery rule. 
          The next goal in your curriculum will automatically unlock once you demonstrate 
          <strong> 95% or higher completion</strong> in your current milestone. 
          Keep pushing your limits!
        </p>
      </div>
    </div>
  );
};

export default Goals;
