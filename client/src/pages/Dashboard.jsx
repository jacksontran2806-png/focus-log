import { useSessions } from '../context/SessionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import StatsCard from '../components/StatsCard.jsx';
import EfficiencyBadge from '../components/EfficiencyBadge.jsx';
import FocusBarChart from '../components/FocusBarChart.jsx';
import FocusTrendLine from '../components/FocusTrendLine.jsx';
import DistractionDonut from '../components/DistractionDonut.jsx';
import SessionTable from '../components/SessionTable.jsx';
import ProLockBanner from '../components/ProLockBanner.jsx';
import {
  calcTotalTime, calcTodayTime, calcWeekTime, calcAvgRating,
  calcEfficiency, calcCurrentStreak, calcLongestStreak, calcWeekVsLastWeek,
} from '../utils/stats.js';
import { formatDuration } from '../utils/time.js';

export default function Dashboard() {
  const { sessions } = useSessions();
  const { user } = useAuth();
  const isPro = user?.plan === 'pro';

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

  const weekCompareText = weekCompare();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {weekCompareText && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 mb-6 text-sm text-indigo-700">
            {weekCompareText}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatsCard label="Total focus time" value={formatDuration(totalTime)} />
          <StatsCard label="Today" value={formatDuration(todayTime)} />
          <StatsCard label="This week" value={formatDuration(weekTime)} />
          <StatsCard label="Avg focus rating" value={avgRating ? avgRating.toFixed(1) : '—'} sub="out of 10" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <EfficiencyBadge pct={efficiency} />
          <StatsCard label="Current streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} />
          <StatsCard label="Longest streak" value={`${longest} day${longest !== 1 ? 's' : ''}`} />
        </div>

        <div className="mb-6">
          <FocusBarChart sessions={sessions} />
        </div>

        {isPro ? (
          <>
            <div className="mb-6">
              <FocusTrendLine sessions={sessions} />
            </div>
            <div className="mb-6">
              <DistractionDonut sessions={sessions} />
            </div>
            <div className="mb-6">
              <SessionTable sessions={sessions} />
            </div>
            <div className="mb-6">
              <button
                disabled
                className="bg-gray-200 text-gray-400 px-5 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
              >
                Export PDF (coming soon)
              </button>
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <ProLockBanner feature="Focus rating trend line" />
            <ProLockBanner feature="Distraction breakdown donut" />
            <ProLockBanner feature="Full session history table" />
            <ProLockBanner feature="PDF export" />
          </div>
        )}
      </div>
    </div>
  );
}
