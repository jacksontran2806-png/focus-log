import { useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { DEFAULT_SETTINGS } from '../utils/settings.js';
import { getSessions, saveSessions } from '../utils/storage.js';
import { requestNotificationPermission } from '../utils/sound.js';

const TABS = [
  { id: 'timer', label: 'Timer' },
  { id: 'goals', label: 'Study Goals' },
  { id: 'sound', label: 'Sound & Notifications' },
  { id: 'focus', label: 'Focus Mode' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'data', label: 'Data' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'about', label: 'About' },
];

const THEME_COLORS = [
  { id: 'indigo', label: 'Indigo', cls: 'bg-indigo-500' },
  { id: 'violet', label: 'Violet', cls: 'bg-violet-500' },
  { id: 'sky', label: 'Sky', cls: 'bg-sky-500' },
  { id: 'emerald', label: 'Emerald', cls: 'bg-emerald-500' },
  { id: 'rose', label: 'Rose', cls: 'bg-rose-500' },
  { id: 'amber', label: 'Amber', cls: 'bg-amber-500' },
];

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(Number(e.target.value))}
      className="w-20 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('timer');
  const [newTag, setNewTag] = useState('');
  const [newSite, setNewSite] = useState('');
  const [notifStatus, setNotifStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [toast, setToast] = useState('');

  function set(key, value) {
    updateSettings({ [key]: value });
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function addTag() {
    const t = newTag.trim();
    if (!t || settings.tags.includes(t)) return;
    set('tags', [...settings.tags, t]);
    setNewTag('');
  }

  function removeTag(tag) {
    set('tags', settings.tags.filter(t => t !== tag));
  }

  function addSite() {
    const s = newSite.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (!s || settings.blockSites.includes(s)) return;
    set('blockSites', [...settings.blockSites, s]);
    setNewSite('');
  }

  function removeSite(site) {
    set('blockSites', settings.blockSites.filter(s => s !== site));
  }

  async function handleRequestNotif() {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (granted) showToast('Notifications enabled!');
  }

  function exportCSV() {
    const sessions = getSessions();
    if (!sessions.length) { showToast('No sessions to export.'); return; }
    const headers = ['id', 'label', 'startTime', 'endTime', 'durationSeconds', 'focusRating', 'distractionType', 'whatWentWell', 'whatToDoBetter'];
    const rows = sessions.map(s => headers.map(h => JSON.stringify(s[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    download('focuslog-sessions.csv', 'text/csv', csv);
    showToast('CSV exported!');
  }

  function exportJSON() {
    const sessions = getSessions();
    if (!sessions.length) { showToast('No sessions to export.'); return; }
    download('focuslog-sessions.json', 'application/json', JSON.stringify(sessions, null, 2));
    showToast('JSON exported!');
  }

  function importJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error();
        const existing = getSessions();
        const existingIds = new Set(existing.map(s => s.id));
        const merged = [...existing, ...imported.filter(s => !existingIds.has(s.id))];
        saveSessions(merged);
        showToast(`Imported ${imported.length} sessions.`);
      } catch {
        showToast('Invalid file. Expected a JSON array of sessions.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function resetData() {
    if (!window.confirm('Delete ALL session data? This cannot be undone.')) return;
    saveSessions([]);
    showToast('All session data deleted.');
  }

  function resetSettings() {
    if (!window.confirm('Reset all settings to defaults?')) return;
    updateSettings(DEFAULT_SETTINGS);
    showToast('Settings reset to defaults.');
  }

  function download(filename, type, content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'timer' && (
          <Section title="Session Defaults">
            <Row label="Default duration" sub="Minutes when you open the timer">
              <NumberInput value={settings.defaultDuration} onChange={v => set('defaultDuration', v)} min={1} max={180} />
            </Row>
            <Row label="Short break" sub="Minutes">
              <NumberInput value={settings.shortBreak} onChange={v => set('shortBreak', v)} min={1} max={60} />
            </Row>
            <Row label="Long break" sub="Minutes">
              <NumberInput value={settings.longBreak} onChange={v => set('longBreak', v)} min={1} max={60} />
            </Row>
            <Row label="Auto-start next session" sub="Automatically begin after a break ends">
              <Toggle checked={settings.autoStartNext} onChange={v => set('autoStartNext', v)} />
            </Row>
          </Section>
        )}

        {activeTab === 'goals' && (
          <>
            <Section title="Daily Target">
              <Row label="Enable daily target">
                <Toggle checked={settings.dailyTargetEnabled} onChange={v => set('dailyTargetEnabled', v)} />
              </Row>
              {settings.dailyTargetEnabled && (
                <>
                  <Row label="Target type">
                    <SelectInput
                      value={settings.dailyTargetType}
                      onChange={v => set('dailyTargetType', v)}
                      options={[{ value: 'hours', label: 'Hours' }, { value: 'sessions', label: 'Sessions' }]}
                    />
                  </Row>
                  <Row label={settings.dailyTargetType === 'hours' ? 'Target hours' : 'Target sessions'}>
                    <NumberInput value={settings.dailyTargetValue} onChange={v => set('dailyTargetValue', v)} min={1} max={24} />
                  </Row>
                </>
              )}
            </Section>

            <Section title="Subjects / Tags">
              <div className="px-4 py-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {settings.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm px-3 py-1 rounded-full">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-red-500 ml-1 leading-none">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="Add subject..."
                    className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button onClick={addTag} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700">Add</button>
                </div>
              </div>
            </Section>
          </>
        )}

        {activeTab === 'sound' && (
          <>
            <Section title="Sound">
              <Row label="Sound on session end">
                <Toggle checked={settings.soundEnabled} onChange={v => set('soundEnabled', v)} />
              </Row>
              {settings.soundEnabled && (
                <Row label="Volume" sub={`${Math.round(settings.soundVolume * 100)}%`}>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.soundVolume}
                    onChange={e => set('soundVolume', parseFloat(e.target.value))}
                    className="w-32 accent-indigo-600"
                  />
                </Row>
              )}
            </Section>

            <Section title="Browser Notifications">
              <Row label="Notify on session end">
                <Toggle checked={settings.notifyOnEnd} onChange={v => set('notifyOnEnd', v)} />
              </Row>
              {settings.notifyOnEnd && notifStatus !== 'granted' && (
                <Row
                  label="Permission required"
                  sub={notifStatus === 'denied' ? 'Blocked in your browser — go to browser settings to allow.' : 'Click Allow to enable notifications.'}
                >
                  {notifStatus !== 'denied' && (
                    <button onClick={handleRequestNotif} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                      Allow
                    </button>
                  )}
                </Row>
              )}
              {settings.notifyOnEnd && notifStatus === 'granted' && (
                <Row label="Status" sub="Notifications are enabled">
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </Row>
              )}
            </Section>

            <Section title="Reminder">
              <Row label="Daily reminder" sub="Reminds you to start a session each day">
                <Toggle checked={settings.reminderEnabled} onChange={v => set('reminderEnabled', v)} />
              </Row>
              {settings.reminderEnabled && (
                <Row label="Reminder time">
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={e => set('reminderTime', e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </Row>
              )}
            </Section>
          </>
        )}

        {activeTab === 'focus' && (
          <>
            <Section title="Focus Behaviour">
              <Row label="Strict mode" sub="Disables the Pause button — commit to the full session">
                <Toggle checked={settings.strictMode} onChange={v => set('strictMode', v)} />
              </Row>
              <Row label="Idle detection" sub="Flags if you haven't interacted with the page for a while">
                <Toggle checked={settings.idleDetectionEnabled} onChange={v => set('idleDetectionEnabled', v)} />
              </Row>
              {settings.idleDetectionEnabled && (
                <Row label="Idle threshold" sub="Minutes of inactivity before flagging">
                  <NumberInput value={settings.idleThresholdMin} onChange={v => set('idleThresholdMin', v)} min={1} max={60} />
                </Row>
              )}
            </Section>

            <Section title="Site Blocking">
              <Row label="Block distracting sites" sub="Note: browser extension required for real blocking; this logs a warning">
                <Toggle checked={settings.blockSitesEnabled} onChange={v => set('blockSitesEnabled', v)} />
              </Row>
              {settings.blockSitesEnabled && (
                <div className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.blockSites.map(site => (
                      <span key={site} className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm px-3 py-1 rounded-full">
                        {site}
                        <button onClick={() => removeSite(site)} className="text-red-300 hover:text-red-600 ml-1 leading-none">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newSite}
                      onChange={e => setNewSite(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSite()}
                      placeholder="e.g. facebook.com"
                      className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button onClick={addSite} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600">Add</button>
                  </div>
                </div>
              )}
            </Section>
          </>
        )}

        {activeTab === 'appearance' && (
          <>
            <Section title="Theme">
              <Row label="Dark mode">
                <Toggle checked={settings.darkMode} onChange={v => set('darkMode', v)} />
              </Row>
              <Row label="Accent color">
                <div className="flex gap-2">
                  {THEME_COLORS.map(c => (
                    <button
                      key={c.id}
                      title={c.label}
                      onClick={() => set('themeColor', c.id)}
                      className={`w-6 h-6 rounded-full ${c.cls} transition-transform hover:scale-110 ${settings.themeColor === c.id ? 'ring-2 ring-offset-2 ring-gray-500 dark:ring-gray-300 scale-110' : ''}`}
                    />
                  ))}
                </div>
              </Row>
            </Section>

            <Section title="Layout">
              <Row label="Font size">
                <SelectInput
                  value={settings.fontSize}
                  onChange={v => set('fontSize', v)}
                  options={[{ value: 'small', label: 'Small' }, { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' }]}
                />
              </Row>
              <Row label="Compact layout" sub="Reduce spacing throughout the app">
                <Toggle checked={settings.compactLayout} onChange={v => set('compactLayout', v)} />
              </Row>
              <Row label="Reduced motion" sub="Disable animations and transitions">
                <Toggle checked={settings.reducedMotion} onChange={v => set('reducedMotion', v)} />
              </Row>
            </Section>
          </>
        )}

        {activeTab === 'data' && (
          <>
            <Section title="Export">
              <Row label="Export as CSV" sub="Spreadsheet-compatible — open in Excel or Sheets">
                <button onClick={exportCSV} className="bg-gray-800 dark:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700">
                  Download CSV
                </button>
              </Row>
              <Row label="Export as JSON" sub="Full data for backup or re-import">
                <button onClick={exportJSON} className="bg-gray-800 dark:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700">
                  Download JSON
                </button>
              </Row>
            </Section>

            <Section title="Import">
              <Row label="Import JSON" sub="Merge from a previous export — duplicates are skipped">
                <label className="cursor-pointer bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 inline-block">
                  Choose file
                  <input type="file" accept=".json" onChange={importJSON} className="hidden" />
                </label>
              </Row>
            </Section>

            <Section title="Danger Zone">
              <Row label="Reset all settings" sub="Restores every setting to its default value">
                <button onClick={resetSettings} className="text-sm text-orange-600 border border-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  Reset settings
                </button>
              </Row>
              <Row label="Delete all session data" sub="Permanently removes every logged session from this browser">
                <button onClick={resetData} className="text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  Delete all
                </button>
              </Row>
            </Section>
          </>
        )}

        {activeTab === 'accessibility' && (
          <Section title="Display">
            <Row label="Time format">
              <SelectInput
                value={settings.timeFormat}
                onChange={v => set('timeFormat', v)}
                options={[{ value: '12h', label: '12-hour (9:00 AM)' }, { value: '24h', label: '24-hour (09:00)' }]}
              />
            </Row>
            <Row label="Language" sub="More languages coming soon">
              <SelectInput
                value={settings.language}
                onChange={v => set('language', v)}
                options={[{ value: 'en', label: 'English' }]}
              />
            </Row>
          </Section>
        )}

        {activeTab === 'about' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Focus Log</p>
              <p className="text-sm text-gray-400 mt-0.5">Version 1.0.0</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A study session tracker that helps you understand your focus patterns, build streaks, and improve over time. No ads, no distractions.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tips</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                <li>Rate every session honestly — even bad ones give you data.</li>
                <li>Streaks are counted by calendar day, not total hours.</li>
                <li>The efficiency score combines your average rating with consistency.</li>
                <li>Export CSV and open it in Google Sheets to make your own charts.</li>
                <li>Upgrade to Pro for trend lines, the distraction chart, and full history.</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700">
              All data is stored in your browser. Nothing is sent to a server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
