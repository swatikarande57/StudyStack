import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Failsafe: Ensure loading never lasts more than 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  async function fetchProfile(userId) {
    if (!supabase) { setLoading(false); return; }
    try {
      const [{ data }, { data: classData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('student_classes').select('class_key').eq('student_id', userId)
      ]);
      const classes = classData ? classData.map(c => c.class_key) : [];
      setProfile(data ? { ...data, classes } : { id: userId, role: 'student', name: 'User', classes });
    } catch (err) {
      console.error('Profile fetch failed:', err);
      setProfile({ id: userId, role: 'student', name: 'User', classes: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: async (data) => {
      const result = await supabase?.auth.signUp(data);
      // After signup, forcefully create/upsert the profile so the role & class_key are saved
      if (result?.data?.user && !result?.error) {
        const u = result.data.user;
        const meta = data.options?.data || {};
        await supabase.from('profiles').upsert({
          id: u.id,
          name: meta.name || u.user_metadata?.name || 'User',
          email: u.email,
          role: meta.role || 'student',
          class_key: meta.class_key || null,
        }, { onConflict: 'id' });
        
        if (meta.class_key && (!meta.role || meta.role === 'student')) {
           await supabase.from('student_classes').insert({ student_id: u.id, class_key: meta.class_key });
        }
      }
      return result;
    },
    signIn: async ({ email, password }) => {
      return supabase?.auth.signInWithPassword({ email, password });
    },
    signOut: () => {
      setUser(null);
      setProfile(null);
      return supabase?.auth.signOut();
    },
    signInWithGoogle: () => supabase?.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    }),
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'teacher',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

