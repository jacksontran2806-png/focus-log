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
      if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
      const data = await res.json();
      accessToken = data.accessToken;
      const u = { name: data.user.name, email: data.user.email, plan: data.user.plan || 'free' };
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
      if (!res.ok) throw new Error((await res.json()).message || 'Register failed');
      const data = await res.json();
      accessToken = data.accessToken;
      const u = { name: data.user.name, email: data.user.email, plan: 'free' };
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

  // Guest login: just use localStorage user
  const loginGuest = useCallback((name, email) => {
    const u = { name, email, plan: 'free' };
    saveUser(u);
    setUser(u);
  }, []);

  const upgradePlan = useCallback(() => {
    setPlan('pro');
    setUser(prev => ({ ...prev, plan: 'pro' }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshToken, getAccessToken, loginGuest, upgradePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
