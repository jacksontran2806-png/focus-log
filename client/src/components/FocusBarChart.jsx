import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calcDailyBars } from '../utils/stats.js';

function barColor(avgRating) {
  if (avgRating >= 8) return '#22c55e';
  if (avgRating >= 5) return '#f59e0b';
  return '#ef4444';
}

export default function FocusBarChart({ sessions }) {
  const data = calcDailyBars(sessions, 14);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Focus time — last 14 days</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
          <YAxis tick={{ fontSize: 10 }} unit="m" />
          <Tooltip formatter={(v) => [`${v} min`, 'Focused time']} />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.avgRating)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />8–10</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />5–7</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />1–4</span>
      </div>
    </div>
  );
}
