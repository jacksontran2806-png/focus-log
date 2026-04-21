const SETTINGS_KEY = 'focuslog_settings';

export const DEFAULT_SETTINGS = {
  // Timer
  defaultDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartNext: false,

  // Study goals
  dailyTargetEnabled: false,
  dailyTargetType: 'hours',   // 'hours' | 'sessions'
  dailyTargetValue: 2,
  tags: ['Math', 'Science', 'English', 'History', 'Programming', 'Reading'],

  // Sound & notifications
  soundEnabled: true,
  soundVolume: 0.7,
  notifyOnEnd: true,
  reminderEnabled: false,
  reminderTime: '09:00',

  // Focus behaviour
  strictMode: false,
  idleDetectionEnabled: false,
  idleThresholdMin: 5,
  blockSitesEnabled: false,
  blockSites: ['youtube.com', 'tiktok.com', 'instagram.com', 'twitter.com', 'reddit.com'],

  // Appearance (full dark-mode styling wired up later)
  darkMode: false,
  themeColor: 'indigo',
  fontSize: 'normal',       // 'small' | 'normal' | 'large'
  compactLayout: false,
  reducedMotion: false,

  // Accessibility
  timeFormat: '12h',        // '12h' | '24h'
  language: 'en',

  // Email reminders (server-side)
  emailRemindersEnabled: false,
  emailReminderTime: '09:00',
  timezone: 'UTC',
};

export function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
