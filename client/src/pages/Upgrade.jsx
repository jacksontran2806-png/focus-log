import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const FREE_FEATURES = [
  'Focus timer (25min, 50min, custom)',
  'Session logging with reflection',
  '7-day focus bar chart',
  'Basic stats (today, week, streak)',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Focus rating trend line (30 sessions)',
  'Distraction breakdown donut chart',
  'Full session history table',
  'Week-over-week comparison',
  'Daily email reminders',
  'PDF export (coming soon)',
];

export default function Upgrade() {
  const { user, upgradePlan } = useAuth();
  const navigate = useNavigate();

  function handleUpgrade() {
    upgradePlan();
    navigate('/dashboard');
  }

  if (user?.plan === 'pro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm">
          <p className="text-2xl font-bold text-indigo-600 mb-2">You're on Pro!</p>
          <p className="text-gray-500 text-sm mb-4">All features are unlocked.</p>
          <button onClick={() => navigate('/dashboard')} className="text-indigo-600 text-sm hover:underline">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Upgrade to Pro</h1>
        <p className="text-center text-gray-500 mb-8">$3/month · Cancel anytime</p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Free</h2>
            <ul className="space-y-2">
              {FREE_FEATURES.map(f => (
                <li key={f} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-green-500 font-bold">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-md">
            <h2 className="font-bold mb-3">Pro</h2>
            <ul className="space-y-2">
              {PRO_FEATURES.map(f => (
                <li key={f} className="text-sm flex gap-2">
                  <span className="font-bold">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleUpgrade}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow"
          >
            Upgrade now (simulated — no payment)
          </button>
          <p className="text-xs text-gray-400 mt-2">This is a demo — no real payment is processed.</p>
        </div>
      </div>
    </div>
  );
}
