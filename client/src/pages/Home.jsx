import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { icon: '◎', title: 'Smart Timer', desc: 'Pomodoro, custom durations, auto-break cycling.' },
  { icon: '✦', title: 'Deep Insights', desc: 'Trend lines, distraction patterns, efficiency scores.' },
  { icon: '◈', title: 'Streak Tracking', desc: 'Build consistent study habits day over day.' },
  { icon: '◇', title: 'Session Reflection', desc: 'Rate focus, log distractions, note improvements.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <div
        className="flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--primary-muted) 0%, var(--bg) 60%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% -10%, var(--primary-lt), transparent 65%)',
            opacity: 0.5,
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}
          >
            <span>✦</span> Arctic Frost · Built for focus
          </div>

          <h1
            className="text-5xl font-extrabold tracking-tight mb-4 leading-tight"
            style={{ color: 'var(--text)' }}
          >
            Study smarter,<br />
            <span style={{ color: 'var(--primary)' }}>not harder.</span>
          </h1>

          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Track your focused sessions, understand your distractions,
            and build study habits that actually stick.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {user ? (
              <Link
                to="/timer"
                className="px-7 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95 shadow-md"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                Open Timer →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-7 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95 shadow-md"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  Start for free
                </Link>
                <Link
                  to="/pricing"
                  className="px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-80"
                  style={{ border: '1.5px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
                >
                  See plans
                </Link>
              </>
            )}
          </div>

          <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
            No account needed to start — guest mode saves locally.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16 w-full">
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-10" style={{ color: 'var(--text-faint)' }}>
          Everything you need
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="p-5 rounded-xl flex gap-4 items-start transition-all hover:shadow-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="text-xl mt-0.5" style={{ color: 'var(--primary)' }}>{f.icon}</span>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-faint)' }}>
        Focus Log · In development · Data stored locally in your browser
      </div>
    </div>
  );
}
