import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calcDistractionBreakdown } from '../utils/stats.js';

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const LABEL_MAP = {
  tiktok: 'TikTok', youtube: 'YouTube', chat: 'Chat',
  phone: 'Phone', noise: 'Noise', none: 'None', other: 'Other',
};

export default function DistractionDonut({ sessions }) {
  const raw = calcDistractionBreakdown(sessions);
  const data = raw.map(d => ({ ...d, name: LABEL_MAP[d.name] || d.name }));

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center h-48">
        <p className="text-gray-400 text-sm">No sessions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Distraction breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
