import { createContext, useContext, useReducer, useEffect } from 'react';
import { getSessions, saveSession, deleteSession } from '../utils/storage.js';

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

  useEffect(() => {
    dispatch({ type: 'LOAD', payload: getSessions() });
  }, []);

  function addSession(session) {
    const saved = saveSession(session);
    dispatch({ type: 'ADD', payload: saved });
    return saved;
  }

  function removeSession(id) {
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
