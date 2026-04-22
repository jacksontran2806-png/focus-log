import { createContext, useContext, useState, useCallback } from 'react';
import { saveUser, getUser, clearUser, setPlan } from '../utils/storage.js';

const AuthContext = createContext(null);

let accessToken = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Login failed');
      accessToken = data.accessToken;
      const u = { name: data.user.name, email: data.user.email, plan: data.user.plan || 'free', role: 'user' };
      saveUser(u);
      setUser(u);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Google sign-in failed');
      accessToken = data.accessToken;
      const u = { name: data.user.name, email: data.user.email, plan: data.user.plan || 'free', role: 'user' };
      saveUser(u);
      setUser(u);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Register failed');
      accessToken = data.accessToken;
      const u = { name: data.user.name, email: data.user.email, plan: 'free', role: 'user' };
      saveUser(u);
      setUser(u);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    accessToken = null;
    clearUser();
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json();
      accessToken = data.accessToken;
      return true;
    } catch {
      return false;
    }
  }, []);

  const getAccessToken = useCallback(() => accessToken, []);

  const loginGuest = useCallback(() => {
    const u = { name: 'Guest', email: 'guest@focuslog.local', plan: 'free', role: 'guest' };
    saveUser(u);
    setUser(u);
  }, []);

  // Test accounts for development — admin gets full pro access
  const loginAsAdmin = useCallback(() => {
    const u = { name: 'Admin', email: 'admin@focuslog.local', plan: 'pro', role: 'admin' };
    saveUser(u);
    setUser(u);
  }, []);

  const loginAsTestUser = useCallback(() => {
    const u = { name: 'Test User', email: 'user@focuslog.local', plan: 'free', role: 'user' };
    saveUser(u);
    setUser(u);
  }, []);

  const upgradePlan = useCallback((plan = 'pro') => {
    setPlan(plan);
    setUser(prev => ({ ...prev, plan }));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, login, loginWithGoogle, register, logout, refreshToken, getAccessToken,
      loginGuest, loginAsAdmin, loginAsTestUser, upgradePlan,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
