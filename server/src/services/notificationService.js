import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';

const now = () => new Date().toISOString();

export async function listNotifications(userId) {
  if (!userId) return [];
  if (!supabase) throw new Error('Supabase is not configured on server');

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

import { sendProductivityAlert } from './emailService.js';

export async function createNotification(payload) {
  const notification = {
    id: randomUUID(),
    user_id: payload.user_id,
    message: payload.message,
    type: payload.type ?? 'info',
    read_status: false,
    is_read: false,
    created_at: now(),
  };

  if (!supabase) throw new Error('Supabase is not configured on server');
  const { data, error } = await supabase.from('notifications').insert([notification]).select().single();
  if (error) throw error;

  // Send Email via Resend if requested
  if (payload.send_email && payload.user_id) {
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', payload.user_id)
        .single();

      if (userProfile?.email) {
        await sendProductivityAlert(userProfile.email, userProfile.name || 'Student', payload.message);
      }
    } catch (err) {
      console.error('Failed to send Resend email:', err);
    }
  }

  return data;
}

export async function markNotificationRead(id) {
  if (!supabase) throw new Error('Supabase is not configured on server');
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_status: true, is_read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
