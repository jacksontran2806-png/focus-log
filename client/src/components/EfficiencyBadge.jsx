import { efficiencyLabel } from '../utils/stats.js';

const COLORS = {
  'Needs work': 'bg-red-100 text-red-700',
  'Building habits': 'bg-amber-100 text-amber-700',
  'On track': 'bg-blue-100 text-blue-700',
  'Flow state': 'bg-green-100 text-green-700',
};

export default function EfficiencyBadge({ pct }) {
  const label = efficiencyLabel(pct);
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Efficiency</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{pct}%</p>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${COLORS[label]}`}>
        {label}
      </span>
    </div>
  );
}
