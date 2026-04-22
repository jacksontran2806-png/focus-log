import { useState } from 'react';
import StarRating from './StarRating.jsx';
import { formatDate, formatDuration } from '../utils/time.js';

const LABEL_MAP = {
  tiktok: 'TikTok', youtube: 'YouTube', chat: 'Chat',
  phone: 'Phone', noise: 'Noise', none: 'None', other: 'Other',
};

const SORT_OPTIONS = [
  { id: 'newest',         label: 'Newest first' },
  { id: 'oldest',         label: 'Oldest first' },
  { id: 'most_efficient', label: 'Most efficient' },
  { id: 'least_efficient',label: 'Least efficient' },
  { id: 'longest',        label: 'Longest session' },
  { id: 'shortest',       label: 'Shortest session' },
];

function sortSessions(sessions, sortId) {
  const arr = [...sessions];
  switch (sortId) {
    case 'newest':          return arr.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    case 'oldest':          return arr.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    case 'most_efficient':  return arr.sort((a, b) => (b.focusRating || 0) - (a.focusRating || 0));
    case 'least_efficient': return arr.sort((a, b) => (a.focusRating || 0) - (b.focusRating || 0));
    case 'longest':         return arr.sort((a, b) => (b.durationSeconds || 0) - (a.durationSeconds || 0));
    case 'shortest':        return arr.sort((a, b) => (a.durationSeconds || 0) - (b.durationSeconds || 0));
    default:                return arr;
  }
}

export default function SessionTable({ sessions }) {
  const [showAll, setShowAll] = useState(false);
  const [sortId, setSortId] = useState('newest');

  const sorted = sortSessions(sessions, sortId);
  const visible = showAll ? sorted : sorted.slice(0, 50);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Session history</h3>
        <select
          value={sortId}
          onChange={e => setSortId(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Date', 'Label', 'Duration', 'Focus', 'Distraction', 'Improvement note'].map(h => (
                <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => (
              <tr
                key={s.id}
                style={{
                  borderTop: '1px solid var(--border-soft)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg)',
                }}
                className="hover:bg-opacity-50 transition-colors"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(s.startTime)}
                </td>
                <td className="px-4 py-2.5 text-sm font-medium max-w-[120px] truncate" style={{ color: 'var(--text)' }}>
                  {s.label || <span style={{ color: 'var(--text-faint)' }}>—</span>}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDuration(s.durationSeconds)}
                </td>
                <td className="px-4 py-2.5">
                  <StarRating value={s.focusRating} readOnly />
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {LABEL_MAP[s.distractionType] || s.distractionType}
                </td>
                <td className="px-4 py-2.5 text-xs max-w-[180px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {s.whatToDoBetter || <span style={{ color: 'var(--text-faint)' }}>—</span>}
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
                  No sessions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sessions.length > 50 && (
        <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            {showAll ? 'Show less' : `Show all ${sessions.length} sessions`}
          </button>
        </div>
      )}
    </div>
  );
}
