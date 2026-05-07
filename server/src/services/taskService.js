import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';

const now = () => new Date().toISOString();

export async function listTasks({ userId, role }) {
  if (!userId) return [];

  if (!supabase) throw new Error('Supabase is not configured on server');

  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
  query = role === 'teacher'
    ? query.eq('assigned_by', userId)
    : query.eq('assigned_to', userId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createTask(payload) {
  if (!supabase) throw new Error('Supabase is not configured on server');

  const task = {
    id: randomUUID(),
    title: payload.title,
    description: payload.description ?? '',
    deadline: payload.deadline,
    assigned_by: payload.assigned_by,
    assigned_to: payload.assigned_to,
    status: payload.status ?? 'pending',
    subject: payload.subject ?? 'General',
    proof_link: payload.proof_link ?? null,
    created_at: now(),
  };

  const { data, error } = await supabase.from('tasks').insert([task]).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, changes) {
  if (!supabase) throw new Error('Supabase is not configured on server');

  const { data, error } = await supabase.from('tasks').update(changes).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function removeTask(id) {
  if (!supabase) throw new Error('Supabase is not configured on server');

  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
  return { deleted: true };
}
