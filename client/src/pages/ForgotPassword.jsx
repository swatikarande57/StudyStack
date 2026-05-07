import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { requestPasswordReset } from '../services/dashboardService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message || 'Reset link sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark text-white flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-400 mb-6">Enter your account email to receive a reset link.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500" />
            <input className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
          {message && <p className="text-green-400 text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
        <Link to="/login" className="text-primary-light text-sm hover:underline inline-block mt-6">Back to login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
