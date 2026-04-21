import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, loginGuest } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccountLogin, setShowAccountLogin] = useState(false);

  function handleGuest() {
    loginGuest(name.trim() || 'Student', 'guest@focuslog.local');
    navigate('/timer');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result.ok) navigate('/timer');
      else setError(result.error);
    } catch {
      setError('Cannot reach server. Use guest mode to continue locally.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Focus Log</h1>
        <p className="text-sm text-gray-500 mb-6">Track your study sessions</p>

        {/* Guest mode — primary CTA */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleGuest}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors"
          >
            Start tracking (no account needed)
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">Sessions saved locally in your browser</p>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">or</span>
          </div>
        </div>

        {/* Account login — secondary */}
        {!showAccountLogin ? (
          <button
            onClick={() => setShowAccountLogin(true)}
            className="w-full border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Sign in with account
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="text-center text-xs text-gray-500">
              No account?{' '}
              <Link to="/register" className="text-indigo-600 hover:underline">Sign up</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
