import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';

const UNLOCK_THRESHOLD = Number(process.env.GOAL_UNLOCK_THRESHOLD ?? 90);

function applyUnlockRules(goals) {
  const sorted = [...goals].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return sorted.map((goal, idx) => {
    if (idx === 0) return { ...goal, unlocked: true };
    const prev = sorted[idx - 1];
    return { ...goal, unlocked: Number(prev.completion_percentage ?? prev.progress ?? 0) >= UNLOCK_THRESHOLD };
  });
}

export async function listGoals(studentId) {
  if (!studentId) return [];
  if (!supabase) throw new Error('Supabase is not configured on server');
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return applyUnlockRules(data ?? []);
}

export async function createGoal(payload) {
  const goal = {
    id: randomUUID(),
    student_id: payload.student_id,
    assigned_by: payload.assigned_by,
    title: payload.title ?? payload.target,
    target: payload.target,
    progress: payload.progress ?? 0,
    completion_percentage: payload.completion_percentage ?? payload.progress ?? 0,
    unlocked: payload.unlocked ?? false,
    deadline: payload.deadline ?? null,
    created_at: new Date().toISOString(),
  };
  if (!supabase) throw new Error('Supabase is not configured on server');
  const { data, error } = await supabase.from('goals').insert([goal]).select().single();
  if (error) throw error;
  return data;
}

export async function updateGoalProgress(goalId, completionPercentage) {
  const update = {
    completion_percentage: completionPercentage,
    progress: completionPercentage,
  };
  if (!supabase) throw new Error('Supabase is not configured on server');
  const { data, error } = await supabase.from('goals').update(update).eq('id', goalId).select().single();
  if (error) throw error;
  return data;
}

export function getUnlockThreshold() {
  return UNLOCK_THRESHOLD;
}
