import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Brain, 
  Sparkles, 
  User, 
  Bot, 
  Clock, 
  Target, 
  Calendar,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  RefreshCcw
} from 'lucide-react';
import { askMentor } from '../services/dashboardService';

const AIMentor = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your AI Study Mentor. I can help you create a study schedule, explain difficult concepts, or give you a motivation boost. What's on your mind today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiMessage = await askMentor([...messages, userMessage]);
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Connection Error: ${error.message || 'The AI service is temporarily unavailable.'}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { title: 'Study Plan', icon: Calendar, text: 'Help me plan my week' },
    { title: 'Explain', icon: Brain, text: 'Explain Quantum Physics' },
    { title: 'Motivate', icon: Sparkles, text: 'Give me some motivation' },
    { title: 'Analytics', icon: TrendingUp, text: 'Analyze my performance' }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-180px)] gap-6 lg:gap-8 pb-8 lg:pb-0">
      {/* Left Chat Main area */}
      <div className="flex-1 flex flex-col glass rounded-3xl overflow-hidden relative border border-white/10 min-h-[500px] lg:min-h-0">
        <div className="bg-white/5 p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold truncate max-w-[150px] sm:max-w-none">AI Study Mentor</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-[10px] text-gray-400">Ready to Help</span>
              </div>
            </div>
          </div>
          <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <RefreshCcw size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar max-h-[400px] lg:max-h-none">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-primary/20 text-primary-light' : 'bg-secondary/20 text-secondary-light'
              }`}>
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl ${
                msg.role === 'assistant' 
                  ? 'bg-white/5 border border-white/10 text-gray-200' 
                  : 'bg-primary text-white ml-auto'
              }`}>
                <p className="text-xs md:text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-[10px] ml-11 md:ml-14">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
              <span>Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-white/5 border-t border-white/10 mt-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 md:gap-4">
            <input 
              type="text" 
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 px-4 md:px-6 pr-14 focus:border-primary outline-none transition-all text-sm"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              className="absolute right-1.5 md:right-2 p-2.5 md:p-3 bg-primary rounded-xl text-white hover:bg-primary-dark transition-all disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar Suggestions */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" />
            Quick Suggestions
          </h3>
          <div className="space-y-3">
            {suggestions.map((s, idx) => (
              <button 
                key={idx}
                onClick={() => setInput(s.text)}
                className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                  <s.icon size={16} className="text-gray-400 group-hover:text-primary-light" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-300">{s.title}</p>
                  <p className="text-[10px] text-gray-500 truncate">{s.text}</p>
                </div>
                <ChevronRight size={14} className="mt-1 text-gray-600 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
          <h3 className="font-bold text-sm mb-3">Today's Motivation</h3>
          <p className="text-xs text-gray-400 italic leading-relaxed">
            "The beautiful thing about learning is that no one can take it away from you."
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-secondary-light font-bold">
            <Clock size={12} /> Personalized for you
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;
