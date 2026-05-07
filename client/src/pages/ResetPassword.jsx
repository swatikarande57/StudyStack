import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/dashboardService';

function useTokens() {
  const { hash, search } = useLocation();
  return useMemo(() => {
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const queryParams = new URLSearchParams(search);
    return {
      accessToken: hashParams.get('access_token') || queryParams.get('access_token') || '',
      refreshToken: hashParams.get('refresh_token') || queryParams.get('refresh_token') || '',
    };
  }, [hash, search]);
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const { accessToken, refreshToken } = useTokens();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await resetPassword(accessToken, refreshToken, password);
      setMessage(result.message || 'Password updated successfully.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark text-white flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-gray-400 mb-6">Set a new password for your account.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-3" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
          {message && <p className="text-green-400 text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
