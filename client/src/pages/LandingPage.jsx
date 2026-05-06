import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Shield, 
  Brain, 
  Target, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Trophy,
  Users
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-primary selection:text-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold italic">SS</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">Study-Stack</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-gray-400 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-2 text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col md:flex-row items-center gap-16">
        <motion.div 
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-pulse text-sm">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-gray-300">New AI Mentor 2.0 is live!</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            Master Your Studies with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light">
              Intelligent Tracking
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl">
            Empowering students with AI-driven productivity tools. Manage tasks, achieve goals, 
            and get personalized mentorship in one stunning platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
              Start Your Journey <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn btn-glass text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
          <div className="mt-12 flex items-center gap-6 justify-center md:justify-start text-gray-500">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-gray-800 flex items-center justify-center text-[10px]">
                  User {i}
                </div>
              ))}
            </div>
            <p className="text-sm">Trusted by 10,000+ students globally</p>
          </div>
        </motion.div>

        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass-card p-4 relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
            <img 
              src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=2064&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-xl shadow-2xl relative z-10"
            />
            {/* Floating Badges */}
            <motion.div 
              className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Trophy size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Streak</p>
                <p className="font-bold">15 Days 🔥</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Study-Stack?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to boost your academic performance in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'AI Mentor', 
              desc: 'Personalized study plans and 24/7 help from our intelligent assistant.',
              icon: Brain,
              color: 'text-purple-400'
            },
            { 
              title: 'Goal Unlocking', 
              desc: 'Gamified progress tracking. Achieve 90%+ to unlock your next milestone.',
              icon: Target,
              color: 'text-blue-400'
            },
            { 
              title: 'Role-Based Portals', 
              desc: 'Dedicated spaces for students to learn and teachers to mentor.',
              icon: Shield,
              color: 'text-green-400'
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              className="glass-card group"
              whileHover={{ y: -5 }}
            >
              <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors`}>
                <feature.icon className={feature.color} size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed mb-6">{feature.desc}</p>
              <Link to="/register" className="text-primary-light flex items-center gap-2 text-sm font-semibold">
                Learn More <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-500 relative z-10">
        <p>&copy; 2026 Study-Stack. Empowering Students Everywhere.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
