import { useState } from 'react';
import { useSessions } from '../context/SessionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import StatsCard from '../components/StatsCard.jsx';
import EfficiencyBadge from '../components/EfficiencyBadge.jsx';
import FocusBarChart from '../components/FocusBarChart.jsx';
import FocusTrendLine from '../components/FocusTrendLine.jsx';
import DistractionDonut from '../components/DistractionDonut.jsx';
import SessionTable from '../components/SessionTable.jsx';
import ProLockBanner from '../components/ProLockBanner.jsx';
import PricingModal from '../components/PricingModal.jsx';
import {
  calcTotalTime, calcTodayTime, calcWeekTime, calcAvgRating,
  calcEfficiency, calcCurrentStreak, calcLongestStreak, calcWeekVsLastWeek,
} from '../utils/stats.js';
import { formatDuration } from '../utils/time.js';

export default function Dashboard() {
  const { sessions } = useSessions();
  const { user } = useAuth();
  const isPro = user?.plan === 'pro' || user?.role === 'admin';
  const [analyticsModal, setAnalyticsModal] = useState(null);

  const totalTime = calcTotalTime(sessions);
  const todayTime = calcTodayTime(sessions);
  const weekTime = calcWeekTime(sessions);
  const avgRating = calcAvgRating(sessions);
  const efficiency = calcEfficiency(sessions);
  const streak = calcCurrentStreak(sessions);
  const longest = calcLongestStreak(sessions);
  const { thisAvg, lastAvg } = calcWeekVsLastWeek(sessions);

  function weekCompare() {
    if (thisAvg === null && lastAvg === null) return null;
    if (thisAvg === null) return `Last week: ${lastAvg.toFixed(1)} avg · No sessions this week`;
    if (lastAvg === null) return `This week: ${thisAvg.toFixed(1)} avg · No data last week`;
    const diff = thisAvg - lastAvg;
    const sign = diff >= 0 ? '+' : '';
    const arrow = diff > 0 ? '↑ improving' : diff < 0 ? '↓ declining' : '→ stable';
    return `This week: ${thisAvg.toFixed(1)} avg · Last week: ${lastAvg.toFixed(1)} avg · ${sign}${diff.toFixed(1)} ${arrow}`;
  }

  const weekText = weekCompare();

  function ProSection({ feature, children }) {
    if (isPro) return children;
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-40">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setAnalyticsModal(feature)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[.98]"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            ✦ Unlock {feature}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Dashboard</h1>
          {user?.role === 'admin' && (
            <span
              className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: '#1e2d42', color: '#fafafa' }}
            >
              ADMIN VIEW
            </span>
          )}
        </div>

        {weekText && (
          <div
            className="px-4 py-2.5 mb-5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--primary-lt)' }}
          >
            {weekText}
          </div>
        )}

        {/* Primary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatsCard label="Total focus time" value={formatDuration(totalTime)} />
          <StatsCard label="Today" value={formatDuration(todayTime)} />
          <StatsCard label="This week" value={formatDuration(weekTime)} />
          <StatsCard label="Avg focus rating" value={avgRating ? avgRating.toFixed(1) : '—'} sub="out of 10" />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <EfficiencyBadge pct={efficiency} />
          <StatsCard label="Current streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} />
          <StatsCard label="Longest streak" value={`${longest} day${longest !== 1 ? 's' : ''}`} />
        </div>

        {/* Bar chart — 7 days free, 14 days pro */}
        <div className="mb-5">
          <FocusBarChart sessions={sessions} isPro={isPro} />
        </div>

        {/* Pro analytics */}
        <div className="space-y-5">
          <ProSection feature="Trend line">
            <FocusTrendLine sessions={sessions} />
          </ProSection>

          <ProSection feature="Distraction chart">
            <DistractionDonut sessions={sessions} />
          </ProSection>

          <ProSection feature="Session history">
            <SessionTable sessions={sessions} />
          </ProSection>

          {isPro && (
            <div>
              <button
                disabled
                className="text-sm px-5 py-2 rounded-lg font-medium opacity-40 cursor-not-allowed"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Export PDF (coming soon)
              </button>
            </div>
          )}
        </div>

        {!isPro && sessions.length === 0 && (
          <div
            className="mt-5 rounded-xl p-6 text-center"
            style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary-lt)' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>No sessions yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Complete a timer session to start seeing your stats here.
            </p>
          </div>
        )}
      </div>

      {analyticsModal && (
        <PricingModal feature={analyticsModal} onClose={() => setAnalyticsModal(null)} />
      )}
    </div>
  );
}
