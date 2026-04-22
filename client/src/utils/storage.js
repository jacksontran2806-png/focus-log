const USER_KEY = 'focuslog_user';

function sessionsKey(email) {
  return `focuslog_sessions_${email || 'guest'}`;
}

function currentUserEmail() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')?.email || null;
  } catch {
    return null;
  }
}

export function getSessions(email) {
  const key = sessionsKey(email ?? currentUserEmail());
  try {
    const sessions = JSON.parse(localStorage.getItem(key) || '[]');
    return sessions.map(s => {
      const d = Number(s.durationSeconds);
      if (!isNaN(d) && d > 0) return s;
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

export function saveSessions(sessions, email) {
  const key = sessionsKey(email ?? currentUserEmail());
  localStorage.setItem(key, JSON.stringify(sessions));
}

export function saveSession(session, email) {
  const resolvedEmail = email ?? currentUserEmail();
  const sessions = getSessions(resolvedEmail);
  sessions.push(session);
  saveSessions(sessions, resolvedEmail);
  return session;
}

export function deleteSession(id, email) {
  const resolvedEmail = email ?? currentUserEmail();
  const sessions = getSessions(resolvedEmail).filter(s => s.id !== id);
  saveSessions(sessions, resolvedEmail);
}

export function clearSessions(email) {
  const key = sessionsKey(email ?? currentUserEmail());
  localStorage.removeItem(key);
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
