import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calcMovingAverage, calcTrend } from '../utils/stats.js';
import { formatDate } from '../utils/time.js';

const TREND_ICON = { improving: '↑ Improving', stable: '→ Stable', declining: '↓ Declining' };
const TREND_COLOR = { improving: 'text-green-600', stable: 'text-gray-500', declining: 'text-red-500' };

export default function FocusTrendLine({ sessions }) {
  const last30 = [...sessions]
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(-30);
  const data = calcMovingAverage(last30, 3).map(s => ({
    name: formatDate(s.startTime),
    rating: s.focusRating,
    avg: s.movingAvg,
  }));
  const trend = calcTrend(sessions);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Focus rating trend — last 30 sessions</h3>
        <span className={`text-sm font-semibold ${TREND_COLOR[trend]}`}>{TREND_ICON[trend]}</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={Math.floor(data.length / 6)} />
          <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="rating" stroke="#6366f1" dot={false} name="Rating" strokeWidth={1.5} />
          <Line type="monotone" dataKey="avg" stroke="#f59e0b" dot={false} name="3-session avg" strokeWidth={2} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
