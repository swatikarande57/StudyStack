import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck, KeyRound, ArrowRight, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    teacherKey: '',
    classKey: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // OTP flow state
  const [otpStep, setOtpStep] = useState('form'); // 'form' | 'otp' | 'done'
  const [otpInput, setOtpInput] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const TEACHER_KEY = import.meta.env.VITE_TEACHER_SECRET_KEY || 'STUDY_STACK_ADMIN_2024';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.role === 'teacher') {
      if (formData.teacherKey !== TEACHER_KEY) {
        setError('Invalid Teacher Secret Key. Access denied.');
        return;
      }
      if (!formData.classKey) {
        setError('Class Room Key is required for Teachers.');
        return;
      }
    }
    setOtpSending(true);
    try {
      await apiClient.post('/auth/otp/send', { email: formData.email });
      setOtpStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Check your Resend configuration.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Verify OTP
      await apiClient.post('/auth/otp/verify', { email: formData.email, otp: otpInput });
      // 2. Create Supabase account
      const { data, error: authError } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            class_key: formData.role === 'teacher' ? formData.classKey : null
          }
        }
      });
      if (authError) throw authError;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Legacy student register kept
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { name: formData.name, role: 'student' } }
      });
      if (authError) throw authError;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-2xl relative z-10 p-10 md:p-16"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <span className="text-3xl font-black text-white italic">SS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Create Account</h1>
          <p className="text-gray-400 text-lg">Join the Study-Stack productivity community</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFormData({ ...formData, role: 'student' })}
            className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              formData.role === 'student' ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            <User size={24} />
            <span className="font-bold">Student</span>
          </button>
          <button
            onClick={() => setFormData({ ...formData, role: 'teacher' })}
            className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              formData.role === 'teacher' ? 'bg-secondary/20 border-secondary text-white shadow-lg shadow-secondary/10' : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            <ShieldCheck size={24} />
            <span className="font-bold">Teacher</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={20} />
            <div>
              <p className="font-bold">Registration Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        )}

        {formData.role === 'student' ? (
          <div className="space-y-6">
            <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
              <User size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Student Access</h3>
              <p className="text-sm text-gray-400 mb-6">Students sign up exclusively using Google for faster and more secure access.</p>
              <button 
                onClick={handleStudentGoogle}
                className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Continue with Google
              </button>
            </div>
          </div>
        ) : otpStep === 'form' ? (
          <div className="space-y-8">
            <div className="text-center p-6 bg-secondary/10 border border-secondary/20 rounded-2xl mb-2">
              <ShieldCheck size={48} className="mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-bold mb-2">Teacher Registration</h3>
              <p className="text-sm text-gray-400">Fill all fields, then verify your email with a one-time OTP to complete registration.</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-secondary outline-none transition-all"
                    placeholder="Prof. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-secondary outline-none transition-all"
                    placeholder="teacher@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-secondary outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Teacher Secret Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-secondary outline-none transition-all"
                    placeholder="Secret Key"
                    value={formData.teacherKey}
                    onChange={(e) => setFormData({ ...formData, teacherKey: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Class Room Key (Virtual Room)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-secondary outline-none transition-all"
                  placeholder="e.g. GRADE-10-A"
                  value={formData.classKey}
                  onChange={(e) => setFormData({ ...formData, classKey: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic px-1">Students will use this key to join your room.</p>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary bg-secondary hover:bg-secondary-dark w-full py-4 mt-4 flex items-center justify-center gap-2 text-lg shadow-lg shadow-secondary/20"
              disabled={otpSending}
            >
              {otpSending ? 'Sending OTP to your email...' : (
                <>Send Verification OTP <Mail size={18} /></>
              )}
            </button>
          </form>
        </div>
        ) : (
          // Step 2: Enter OTP and complete registration
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center p-6 bg-secondary/10 border border-secondary/20 rounded-2xl">
              <KeyRound size={48} className="mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-bold mb-2">Check Your Email!</h3>
              <p className="text-sm text-gray-400">A 6-digit OTP has been sent to</p>
              <p className="font-bold text-white mt-1">{formData.email}</p>
            </div>

            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full bg-white/5 border border-secondary/30 rounded-xl py-4 px-6 focus:border-secondary outline-none transition-all text-2xl font-black tracking-[16px] text-center"
                  placeholder="------"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">OTP expires in 10 minutes.</p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary bg-secondary w-full py-4 flex items-center justify-center gap-2 text-lg"
                disabled={loading || otpInput.length !== 6}
              >
                {loading ? 'Verifying & Registering...' : <>Complete Registration <ArrowRight size={18} /></>}
              </button>

              <button
                type="button"
                onClick={() => { setOtpStep('form'); setOtpInput(''); setError(null); }}
                className="w-full text-sm text-gray-500 flex items-center justify-center gap-2 hover:text-white transition-colors"
              >
                <RefreshCw size={14} /> Go back to resend OTP
              </button>
            </form>
          </motion.div>
        )}


        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-primary-light hover:underline">Login here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
