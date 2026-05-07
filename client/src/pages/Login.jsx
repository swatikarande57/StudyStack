import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, User, ShieldCheck, Sparkles } from 'lucide-react';
import LottieRaw from 'lottie-react';
const Lottie = LottieRaw.default || LottieRaw;
import animationData from '../assets/animations/hero.json';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await signIn({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full"></div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 relative z-10">
        {/* Left Side: Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card w-full max-w-xl mx-auto p-10 md:p-16"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <span className="text-3xl font-black text-white italic">SS</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Welcome Back</h1>
            <p className="text-gray-400 text-lg">Continue your productivity journey</p>
          </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setRole('student')}
            className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              role === 'student' ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            <User size={24} />
            <span className="font-bold">Student</span>
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
              role === 'teacher' ? 'bg-secondary/20 border-secondary text-white' : 'bg-white/5 border-white/10 text-gray-500'
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
              <p className="font-bold">Login Error</p>
              <p className="opacity-80 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {role === 'student' ? (
          <div className="space-y-6">
            <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
              <User size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Student Login</h3>
              <p className="text-sm text-gray-400 mb-8">Please use your Google account to access your student dashboard.</p>
              <button 
                onClick={handleGoogle}
                className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                {loading ? 'Connecting...' : 'Sign in with Google'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-secondary outline-none transition-all"
                  placeholder="teacher@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-secondary hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-secondary outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary bg-secondary hover:bg-secondary-dark w-full py-4 flex items-center justify-center gap-2 text-lg shadow-lg shadow-secondary/20"
              disabled={loading}
            >
              {loading ? 'Verifying...' : (
                <>Teacher Sign In <LogIn size={18} /></>
              )}
            </button>
          </form>
        )}

        <div className="mt-10 text-center text-sm text-gray-400">
          Don't have an account? <Link to="/register" className="text-white font-bold hover:underline">Create one</Link>
        </div>
      </motion.div>
 
        {/* Right Side: Animation sidecar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex flex-col items-center justify-center p-8"
        >
          <div className="w-[500px] h-[500px] relative">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full"></div>
            <Lottie 
              animationData={animationData} 
              loop={true} 
              className="relative z-10 drop-shadow-[0_0_35px_rgba(79,70,229,0.3)]" 
            />
          </div>
          <div className="mt-8 text-center max-w-lg">
            <h2 className="text-4xl font-black text-white italic flex items-center justify-center gap-3">
              <Sparkles className="text-primary-light" size={32} />
              Elevate Your Learning
            </h2>
            <p className="text-gray-400 mt-4 text-xl leading-relaxed">
              Transform your productivity with the ultimate suite for modern students and educators.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
