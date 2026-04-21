import { dayKey, isSameDay, startOfDay } from './time.js';

function dur(s) {
  const d = Number(s.durationSeconds);
  return isNaN(d) ? 0 : d;
}

export function calcTotalTime(sessions) {
  return sessions.reduce((sum, s) => sum + dur(s), 0);
}

export function calcTodayTime(sessions) {
  const today = new Date();
  return sessions
    .filter(s => isSameDay(s.startTime, today))
    .reduce((sum, s) => sum + dur(s), 0);
}

export function calcWeekTime(sessions) {
  const now = new Date();
  const weekStart = startOfDay(new Date(now));
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return sessions
    .filter(s => new Date(s.startTime) >= weekStart)
    .reduce((sum, s) => sum + dur(s), 0);
}

export function calcLastWeekTime(sessions) {
  const now = new Date();
  const thisWeekStart = startOfDay(new Date(now));
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  return sessions
    .filter(s => {
      const t = new Date(s.startTime);
      return t >= lastWeekStart && t < thisWeekStart;
    })
    .reduce((sum, s) => sum + s.durationSeconds, 0);
}

export function calcAvgRating(sessions) {
  if (!sessions.length) return 0;
  return sessions.reduce((s, x) => s + x.focusRating, 0) / sessions.length;
}

export function calcEfficiency(sessions) {
  if (!sessions.length) return 0;
  const avgRating = sessions.reduce((s, x) => s + x.focusRating, 0) / sessions.length;
  const focusedCount = sessions.filter(s => s.focusRating >= 6).length;
  const ratio = focusedCount / sessions.length;
  return Math.round((avgRating / 10) * ratio * 100);
}

export function efficiencyLabel(pct) {
  if (pct <= 30) return 'Needs work';
  if (pct <= 60) return 'Building habits';
  if (pct <= 80) return 'On track';
  return 'Flow state';
}

export function calcCurrentStreak(sessions) {
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map(s => dayKey(s.startTime)))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const day of days) {
    const cursorKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (day === cursorKey) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (day < cursorKey) {
      break;
    }
  }
  return streak;
}

export function calcLongestStreak(sessions) {
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map(s => dayKey(s.startTime)))].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function calcTrend(sessions) {
  const sorted = [...sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const last10 = sorted.slice(-10);
  if (last10.length < 6) return 'stable';
  const half = Math.floor(last10.length / 2);
  const first = last10.slice(0, half);
  const second = last10.slice(half);
  const avgFirst = first.reduce((s, x) => s + x.focusRating, 0) / first.length;
  const avgSecond = second.reduce((s, x) => s + x.focusRating, 0) / second.length;
  const diff = avgSecond - avgFirst;
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

export function calcWeekVsLastWeek(sessions) {
  const now = new Date();
  const thisWeekStart = startOfDay(new Date(now));
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const thisWeek = sessions.filter(s => new Date(s.startTime) >= thisWeekStart);
  const lastWeek = sessions.filter(s => {
    const t = new Date(s.startTime);
    return t >= lastWeekStart && t < thisWeekStart;
  });

  const thisAvg = thisWeek.length ? calcAvgRating(thisWeek) : null;
  const lastAvg = lastWeek.length ? calcAvgRating(lastWeek) : null;
  return { thisAvg, lastAvg };
}

export function calcDailyBars(sessions, days = 14) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const daySessions = sessions.filter(s => dayKey(s.startTime) === key);
    const totalSeconds = daySessions.reduce((sum, s) => sum + dur(s), 0);
    const minutes = Math.max(Math.round(totalSeconds / 60), daySessions.length > 0 ? 1 : 0);
    const avgRating = daySessions.length ? calcAvgRating(daySessions) : 0;
    const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    result.push({ key, label, minutes, avgRating });
  }
  return result;
}

export function calcMovingAverage(sessions, window = 3) {
  const sorted = [...sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  return sorted.map((s, i) => {
    const slice = sorted.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((sum, x) => sum + x.focusRating, 0) / slice.length;
    return { ...s, movingAvg: parseFloat(avg.toFixed(2)) };
  });
}

export function calcDistractionBreakdown(sessions) {
  const counts = {};
  for (const s of sessions) {
    const t = s.distractionType || 'other';
    counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
