import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Great for getting started.',
    cta: 'Current plan',
    ctaDisabled: true,
    features: [
      'Focus timer (25, 50 min, custom)',
      'Session logging & reflection',
      'Basic stats (today, week, streak)',
      '7-day focus bar chart',
      'Guest mode (no signup)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    annualNote: '$39.99/year — save 33%',
    desc: 'For serious students.',
    cta: 'Start 3-day free trial',
    highlight: true,
    features: [
      'Everything in Free',
      '14-day focus bar chart',
      'Focus rating trend line',
      'Distraction breakdown chart',
      'Full session history + sorting',
      'Week-over-week comparison',
      'Daily email reminders',
      'Priority support',
    ],
  },
];

export default function PricingModal({ onClose, feature }) {
  const { user, upgradePlan } = useAuth();
  const navigate = useNavigate();
  const isPro = user?.plan === 'pro' || user?.role === 'admin';

  function handlePro() {
    if (!user) {
      onClose?.();
      navigate('/register');
      return;
    }
    upgradePlan('pro');
    onClose?.();
  }

  function handleFullPage() {
    onClose?.();
    navigate('/pricing');
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-start justify-between"
          style={{ background: 'var(--primary-muted)', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>
              Pro Feature
            </p>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {feature ? `Unlock "${feature}"` : 'Upgrade to Pro'}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Get deeper insights into your study patterns.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:opacity-60 transition-opacity mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>

        {/* Plans */}
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={plan.highlight
                ? { background: 'var(--primary)', color: '#fff' }
                : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }
              }
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-sm opacity-70">{plan.period}</span>
                </div>
                {plan.annualNote && (
                  <p className="text-xs mt-0.5 opacity-80 font-medium">{plan.annualNote}</p>
                )}
                <p className="text-xs mt-1 opacity-60">{plan.desc}</p>
              </div>

              <ul className="space-y-1.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-2 text-xs">
                    <span className="opacity-80 font-bold">✓</span>
                    <span className="opacity-90">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <button
                  disabled
                  className="w-full py-2 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  {isPro ? 'Free plan' : 'Current plan'}
                </button>
              ) : (
                <button
                  onClick={handlePro}
                  className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#fff', color: 'var(--primary)' }}
                >
                  {user ? 'Activate Pro (simulated)' : 'Sign up & start trial'}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 text-center">
          <button onClick={handleFullPage} className="text-xs underline" style={{ color: 'var(--text-muted)' }}>
            View full pricing details
          </button>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            Demo only — no real payment processed.
          </p>
        </div>
      </div>
    </div>
  );
}
