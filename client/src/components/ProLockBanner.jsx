import { useAuth } from '../context/AuthContext.jsx';

export default function ProLockBanner({ feature = 'This feature' }) {
  const { upgradePlan } = useAuth();

  return (
    <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-6 text-center">
      <p className="text-sm font-semibold text-indigo-700 mb-1">Pro feature</p>
      <p className="text-xs text-indigo-500 mb-3">{feature} is available on the Pro plan ($3/mo)</p>
      <button
        onClick={upgradePlan}
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
      >
        Upgrade to Pro (simulated)
      </button>
    </div>
  );
}
