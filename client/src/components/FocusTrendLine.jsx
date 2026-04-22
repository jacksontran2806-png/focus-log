import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { calcMovingAverage } from '../utils/stats.js';
import { formatDate } from '../utils/time.js';

export default function FocusTrendLine({ sessions }) {
  const data = calcMovingAverage(sessions.slice(-30), 3);

  if (data.length < 3) {
    return (
      <div className="rounded-xl p-5 flex items-center justify-center h-32" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Need 3+ sessions for trend line</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Focus rating trend (last 30 sessions)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="startTime" tickFormatter={v => formatDate(v)} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <Tooltip
            labelFormatter={v => formatDate(v)}
            formatter={(v) => [v.toFixed(1), '3-session avg']}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }}
          />
          <ReferenceLine y={7} stroke="var(--primary-lt)" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="movingAvg" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
