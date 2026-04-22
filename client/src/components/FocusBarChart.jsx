import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calcDailyBars } from '../utils/stats.js';
import PricingModal from './PricingModal.jsx';

function barColor(avgRating) {
  if (avgRating >= 8) return '#22c55e';
  if (avgRating >= 5) return '#f59e0b';
  return '#ef4444';
}

export default function FocusBarChart({ sessions, isPro }) {
  const [showModal, setShowModal] = useState(false);

  const days = isPro ? 14 : 7;
  const data = calcDailyBars(sessions, days);

  return (
    <>
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Focus time — last {days} days
          </h3>
          {!isPro && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
            >
              <span>✦</span> Unlock 14-day view
            </button>
          )}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={isPro ? 1 : 0} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} unit="m" />
            <Tooltip
              formatter={(v) => [`${v} min`, 'Focused time']}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text)',
              }}
            />
            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.avgRating)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />8–10</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />5–7</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />1–4</span>
          </div>
          {!isPro && (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Pro: 14 days</span>
          )}
        </div>
      </div>

      {showModal && (
        <PricingModal feature="14-day bar chart" onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
