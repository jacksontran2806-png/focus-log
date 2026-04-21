const SESSIONS_KEY = 'focuslog_sessions';
const USER_KEY = 'focuslog_user';

export function getSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    return sessions.map(s => {
      const d = Number(s.durationSeconds);
      if (!isNaN(d) && d > 0) return s;
      // Recover duration from wall-clock timestamps for old/corrupt sessions
      if (s.startTime && s.endTime) {
        const recovered = Math.max(Math.round((new Date(s.endTime) - new Date(s.startTime)) / 1000), 1);
        return { ...s, durationSeconds: recovered };
      }
      return { ...s, durationSeconds: 0 };
    });
  } catch {
    return [];
  }
}

export function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function saveSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return session;
}

export function deleteSession(id) {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function clearSessions() {
  localStorage.removeItem(SESSIONS_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function getPlan() {
  const user = getUser();
  return user?.plan || 'free';
}

export function setPlan(plan) {
  const user = getUser() || {};
  saveUser({ ...user, plan });
}
