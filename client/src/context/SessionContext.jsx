import { createContext, useContext, useReducer, useEffect } from 'react';
import { getSessions, saveSession, deleteSession } from '../utils/storage.js';
import { useAuth } from './AuthContext.jsx';

const SessionContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, sessions: action.payload };
    case 'ADD':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'DELETE':
      return { ...state, sessions: state.sessions.filter(s => s.id !== action.payload) };
    default:
      return state;
  }
}

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { sessions: [] });
  const { user, getAccessToken, refreshToken } = useAuth();
  const isRealUser = user && user.role !== 'guest';

  useEffect(() => {
    async function load() {
      if (!isRealUser) {
        dispatch({ type: 'LOAD', payload: getSessions() });
        return;
      }

      let token = getAccessToken();
      if (!token) {
        const ok = await refreshToken();
        if (!ok) { dispatch({ type: 'LOAD', payload: getSessions() }); return; }
        token = getAccessToken();
      }

      try {
        const res = await fetch('/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          dispatch({ type: 'LOAD', payload: Array.isArray(data) ? data : [] });
          return;
        }
      } catch {}
      dispatch({ type: 'LOAD', payload: getSessions() });
    }
    load();
  }, [user?.email]); // eslint-disable-line

  async function addSession(session) {
    if (isRealUser) {
      let token = getAccessToken();
      if (!token) {
        const ok = await refreshToken();
        if (ok) token = getAccessToken();
      }
      if (token) {
        try {
          const res = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              label: session.label ?? null,
              startTime: session.startTime,
              endTime: session.endTime,
              durationSeconds: session.durationSeconds,
              focusRating: session.focusRating,
              distractionType: session.distractionType,
              distractionNote: session.distractionNote ?? null,
              whatWentWell: session.whatWentWell ?? null,
              whatToDoBetter: session.whatToDoBetter ?? null,
            }),
          });
          if (res.ok) {
            const saved = await res.json();
            dispatch({ type: 'ADD', payload: saved });
            return saved;
          }
        } catch {}
      }
    }

    const saved = saveSession(session);
    dispatch({ type: 'ADD', payload: saved });
    return saved;
  }

  async function removeSession(id) {
    if (isRealUser) {
      let token = getAccessToken();
      if (!token) {
        const ok = await refreshToken();
        if (ok) token = getAccessToken();
      }
      if (token) {
        try {
          await fetch(`/api/sessions/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
        } catch {}
      }
    }
    deleteSession(id);
    dispatch({ type: 'DELETE', payload: id });
  }

  return (
    <SessionContext.Provider value={{ sessions: state.sessions, addSession, removeSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  return useContext(SessionContext);
}
