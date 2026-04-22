import { efficiencyLabel } from '../utils/stats.js';

export default function EfficiencyBadge({ pct }) {
  const label = efficiencyLabel(pct);
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : pct >= 30 ? 'var(--primary)' : '#94a3b8';

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
        Efficiency score
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-extrabold" style={{ color }}>{pct}%</p>
      </div>
      <p className="text-xs mt-0.5 font-medium" style={{ color }}>{label}</p>
    </div>
  );
}
