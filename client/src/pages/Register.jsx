import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    const result = await register(name, email, password);
    setLoading(false);
    if (result.ok) navigate('/timer');
    else setError(result.error);
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all';
  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--primary-muted) 0%, var(--bg) 60%)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.svg" alt="" className="w-7 h-7" onError={e => e.currentTarget.style.display = 'none'} />
          <span className="font-extrabold text-base tracking-tight" style={{ color: 'var(--primary)' }}>Focus Log</span>
        </div>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Create account</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Start tracking your focus sessions</p>

        <div className="flex justify-center mb-4">
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
            text="signup_with"
          />
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs" style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}>or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Name', type: 'text', value: name, setter: setName },
            { label: 'Email', type: 'email', value: email, setter: setEmail },
            { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: 'At least 8 characters' },
          ].map(({ label, type, value, setter, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {label}
              </label>
              <input
                type={type}
                required
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder={placeholder}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)' }} className="font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
