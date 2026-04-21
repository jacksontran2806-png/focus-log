import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../utils/settings.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(getSettings);

  function updateSettings(patch) {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  // Apply dark mode class to <html> whenever setting changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // Apply font size class to <html>
  useEffect(() => {
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    if (settings.fontSize === 'small') document.documentElement.classList.add('text-sm');
    if (settings.fontSize === 'large') document.documentElement.classList.add('text-lg');
  }, [settings.fontSize]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
