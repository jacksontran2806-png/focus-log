import { useState } from 'react';
import StarRating from './StarRating.jsx';
import { formatDate, formatDuration } from '../utils/time.js';

const LABEL_MAP = {
  tiktok: 'TikTok', youtube: 'YouTube', chat: 'Chat',
  phone: 'Phone', noise: 'Noise', none: 'None', other: 'Other',
};

export default function SessionTable({ sessions }) {
  const [showAll, setShowAll] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = [...sessions].sort((a, b) => {
    const diff = new Date(b.startTime) - new Date(a.startTime);
    return sortDesc ? diff : -diff;
  });
  const visible = showAll ? sorted : sorted.slice(0, 50);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Session history</h3>
        <button
          onClick={() => setSortDesc(d => !d)}
          className="text-xs text-indigo-600 hover:underline"
        >
          Sort {sortDesc ? '↑ oldest' : '↓ newest'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Label</th>
              <th className="px-4 py-2 text-left">Duration</th>
              <th className="px-4 py-2 text-left">Focus</th>
              <th className="px-4 py-2 text-left">Distraction</th>
              <th className="px-4 py-2 text-left">Better next time</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(s => (
              <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-gray-600">{formatDate(s.startTime)}</td>
                <td className="px-4 py-2 text-gray-700 max-w-[120px] truncate">{s.label || '—'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-600">{formatDuration(s.durationSeconds)}</td>
                <td className="px-4 py-2">
                  <StarRating value={s.focusRating} readOnly />
                </td>
                <td className="px-4 py-2 text-gray-600">{LABEL_MAP[s.distractionType] || s.distractionType}</td>
                <td className="px-4 py-2 text-gray-500 max-w-[180px] truncate">{s.whatToDoBetter || '—'}</td>
              </tr>
            ))}
            {!visible.length && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No sessions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {sessions.length > 50 && (
        <div className="px-4 py-3 border-t border-gray-100 text-center">
          <button onClick={() => setShowAll(v => !v)} className="text-sm text-indigo-600 hover:underline">
            {showAll ? 'Show less' : `Show all ${sessions.length} sessions`}
          </button>
        </div>
      )}
    </div>
  );
}
