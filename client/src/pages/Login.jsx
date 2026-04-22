import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, loginWithGoogle, loginGuest, loginAsAdmin, loginAsTestUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccountLogin, setShowAccountLogin] = useState(false);

  function handleGuest() {
    loginGuest();
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

  const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all';
  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, var(--primary-muted) 0%, var(--bg) 60%)',
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.svg" alt="" className="w-7 h-7" onError={e => e.currentTarget.style.display = 'none'} />
          <span className="font-extrabold text-base tracking-tight" style={{ color: 'var(--primary)' }}>Focus Log</span>
        </div>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Track your study sessions</p>

        {/* Guest — primary CTA */}
        <div className="mb-5">
          <button
            onClick={handleGuest}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[.98]"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            Continue as Guest
          </button>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-faint)' }}>
            No account needed · data saved locally
          </p>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs" style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}>or</span>
          </div>
        </div>

        {/* Google sign-in */}
        <div className="flex justify-center mb-3">
          <GoogleLogin
            onSuccess={async ({ credential }) => {
              const result = await loginWithGoogle(credential);
              if (result.ok) navigate('/timer');
              else setError(result.error);
            }}
            onError={() => setError('Google sign-in failed')}
            theme="outline"
            size="large"
            width="320"
            text="signin_with"
          />
        </div>
        {error && !showAccountLogin && <p className="text-xs text-red-500 text-center -mt-1 mb-2">{error}</p>}

        {/* Account login */}
        {!showAccountLogin ? (
          <button
            onClick={() => setShowAccountLogin(true)}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
          >
            Sign in with account
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)', background: 'transparent' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)' }} className="font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        )}

        {/* Dev test accounts */}
        <div className="mt-6 pt-5" style={{ borderTop: '1px dashed var(--border)' }}>
          <p className="text-xs text-center font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>
            Dev test accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { loginAsAdmin(); navigate('/dashboard'); }}
              className="py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: '#1e2d42', color: '#fafafa' }}
            >
              Admin (all access)
            </button>
            <button
              onClick={() => { loginAsTestUser(); navigate('/timer'); }}
              className="py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
            >
              User (free plan)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
