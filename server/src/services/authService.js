import { supabase } from '../config/supabase.js';

export async function forgotPassword(email, redirectTo) {
  if (!email) throw new Error('Email is required');
  if (!supabase) {
    return {
      success: true,
      message: 'Supabase not configured. Password reset email cannot be sent yet.',
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
  return { success: true, message: 'Password reset email sent.' };
}

export async function resetPassword(accessToken, refreshToken, password) {
  if (!password) throw new Error('Password is required');
  if (!supabase) {
    return { success: false, message: 'Supabase not configured.' };
  }
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return { success: true, message: 'Password updated successfully.' };
}
