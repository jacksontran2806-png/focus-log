import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calcDistractionBreakdown } from '../utils/stats.js';

const COLORS = ['var(--primary)', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const LABEL_MAP = {
  tiktok: 'TikTok', youtube: 'YouTube', chat: 'Chat',
  phone: 'Phone', noise: 'Noise', none: 'None', other: 'Other',
};

export default function DistractionDonut({ sessions }) {
  const raw = calcDistractionBreakdown(sessions);
  const data = raw.map(d => ({ ...d, name: LABEL_MAP[d.name] || d.name }));

  if (!data.length) {
    return (
      <div className="rounded-xl p-5 flex items-center justify-center h-32" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No sessions logged yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Distraction breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(v, n) => [v, n]}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
