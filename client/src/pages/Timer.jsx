import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PostSessionForm from '../components/PostSessionForm.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { playEndSound, showEndNotification } from '../utils/sound.js';
import { formatSeconds } from '../utils/time.js';

const STORAGE_KEY = 'focuslog_timer';
const TODOS_KEY = 'focuslog_todos';
const NEXT_NOTE_KEY = 'focuslog_nextnote';

const MODES = {
  pomodoro:   { label: 'Pomodoro',    settingsKey: 'defaultDuration', color: 'primary' },
  shortBreak: { label: 'Short Break', settingsKey: 'shortBreak',      color: 'emerald' },
  longBreak:  { label: 'Long Break',  settingsKey: 'longBreak',        color: 'sky' },
};

const BREAK_COLORS = {
  emerald: { active: 'bg-emerald-500 text-white', timer: '#10b981', btn: 'bg-emerald-500 hover:bg-emerald-600' },
  sky:     { active: 'bg-sky-500 text-white',     timer: '#0ea5e9', btn: 'bg-sky-500 hover:bg-sky-600' },
};

function loadTimerState() {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (!s) return null;
    if (s.status === 'running' && s.endTime) {
      const rem = Math.round((s.endTime - Date.now()) / 1000);
      if (rem <= 0) return { ...s, secondsLeft: 0, expired: true };
      return { ...s, secondsLeft: rem };
    }
    return s;
  } catch { return null; }
}
function saveTimerState(s) { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function clearTimerState() { sessionStorage.removeItem(STORAGE_KEY); }

function getTodos() { try { return JSON.parse(localStorage.getItem(TODOS_KEY) || '[]'); } catch { return []; } }
function persistTodos(t) { localStorage.setItem(TODOS_KEY, JSON.stringify(t)); }
function getNextNote() { return localStorage.getItem(NEXT_NOTE_KEY) || ''; }
export function saveNextNote(note) {
  note?.trim() ? localStorage.setItem(NEXT_NOTE_KEY, note.trim()) : localStorage.removeItem(NEXT_NOTE_KEY);
}

export default function Timer() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = user?.role === 'guest';
  const restored = loadTimerState();
  const expiredOnMount = restored?.expired === true;

  function modeDur(m) { return settings[MODES[m].settingsKey] * 60; }

  const initMode = restored?.mode || 'pomodoro';
  const [mode, setMode]           = useState(initMode);
  const [duration, setDuration]   = useState(restored?.duration || modeDur(initMode));
  const [secondsLeft, setSecondsLeft] = useState(restored?.secondsLeft ?? restored?.duration ?? modeDur('pomodoro'));
  const [status, setStatus]       = useState(restored?.status || 'idle');
  const [label, setLabel]         = useState(restored?.label || '');
  const [customMin, setCustomMin] = useState('');
  const [startTime, setStartTime] = useState(restored?.startTime || null);
  const [sessionData, setSessionData] = useState(null);

  const [todos, setTodos]     = useState(getTodos);
  const [newTodo, setNewTodo] = useState('');
  const [showTodos, setShowTodos] = useState(true);

  const [nextNote, setNextNote]         = useState(getNextNote);
  const [noteDismissed, setNoteDismissed] = useState(false);

  const intervalRef        = useRef(null);
  const autoEndRef         = useRef(false);
  const shouldAutoStartRef = useRef(false);

  const durationRef    = useRef(duration);
  const secondsLeftRef = useRef(secondsLeft);
  const startTimeRef   = useRef(startTime);
  const labelRef       = useRef(label);
  const modeRef        = useRef(mode);
  durationRef.current    = duration;
  secondsLeftRef.current = secondsLeft;
  startTimeRef.current   = startTime;
  labelRef.current       = label;
  modeRef.current        = mode;

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          const next = prev - 1;
          if (next <= 0) { clearInterval(intervalRef.current); autoEndRef.current = true; return 0; }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  useEffect(() => {
    if (autoEndRef.current) { autoEndRef.current = false; handleEnd(true); }
  });

  useEffect(() => {
    if (shouldAutoStartRef.current && status === 'idle') {
      shouldAutoStartRef.current = false;
      setStartTime(new Date().toISOString());
      setStatus('running');
    }
  });

  useEffect(() => {
    if (expiredOnMount) handleEnd(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    const endTime = status === 'running' ? Date.now() + secondsLeft * 1000 : undefined;
    saveTimerState({ mode, duration, label, status, secondsLeft, startTime, endTime });
  }, [mode, duration, label, status, secondsLeft, startTime]);

  function switchMode(m) {
    if (status !== 'idle') return;
    const d = modeDur(m);
    setMode(m); setDuration(d); setSecondsLeft(d); setCustomMin('');
  }

  function handleCustom(e) {
    const v = e.target.value;
    setCustomMin(v);
    const n = parseInt(v, 10);
    if (n >= 1 && n <= 180) { setDuration(n * 60); setSecondsLeft(n * 60); }
  }

  function handleEnd(timedOut = false) {
    clearInterval(intervalRef.current);
    const end     = new Date().toISOString();
    const dur     = durationRef.current;
    const left    = secondsLeftRef.current;
    const elapsed = dur - (timedOut ? 0 : left);
    const currentMode = modeRef.current;

    if (timedOut) {
      if (settings.soundEnabled) playEndSound(settings.soundVolume);
      if (settings.notifyOnEnd)  showEndNotification(labelRef.current);
    }
    clearTimerState();

    if (currentMode === 'pomodoro') {
      setSessionData({
        label: labelRef.current,
        startTime: startTimeRef.current || end,
        endTime: end,
        durationSeconds: Math.max(elapsed, 1),
      });
      if (timedOut) {
        const d = settings.shortBreak * 60;
        setMode('shortBreak'); setDuration(d); setSecondsLeft(d);
        if (settings.autoStartNext) shouldAutoStartRef.current = true;
      } else {
        setSecondsLeft(dur);
      }
    } else {
      const d = settings.defaultDuration * 60;
      setMode('pomodoro'); setDuration(d); setSecondsLeft(d);
      if (timedOut && settings.autoStartNext) shouldAutoStartRef.current = true;
    }
    setStatus('idle');
  }

  function addTodo() {
    const text = newTodo.trim();
    if (!text) return;
    const next = [...todos, { id: crypto.randomUUID(), text, done: false }];
    setTodos(next); persistTodos(next); setNewTodo('');
  }
  function toggleTodo(id) {
    const next = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTodos(next); persistTodos(next);
  }
  function removeTodo(id) {
    const next = todos.filter(t => t.id !== id);
    setTodos(next); persistTodos(next);
  }

  const isBreak = mode !== 'pomodoro';
  const showNote = nextNote && !noteDismissed && !isBreak && status === 'idle';

  const breakColor = isBreak ? BREAK_COLORS[MODES[mode].color] : null;

  function activeTabStyle(key) {
    if (key !== mode) return {};
    if (!isBreak) return { background: 'var(--primary)', color: '#fff' };
    return {}; // emerald/sky use className
  }
  function activeTabCls(key) {
    const cfg = MODES[key];
    if (key !== mode) return '';
    if (cfg.color === 'emerald') return BREAK_COLORS.emerald.active;
    if (cfg.color === 'sky')     return BREAK_COLORS.sky.active;
    return '';
  }

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' };
  const cardStyle  = { background: 'var(--surface)', border: '1px solid var(--border)' };

  const timerColor = isBreak
    ? (mode === 'shortBreak' ? BREAK_COLORS.emerald.timer : BREAK_COLORS.sky.timer)
    : 'var(--primary)';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4" style={{ background: 'var(--bg)' }}>

      {showNote && (
        <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3 items-start">
          <span className="text-amber-500 text-base mt-0.5">✎</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700 mb-0.5">Note from last session</p>
            <p className="text-sm text-amber-900">{nextNote}</p>
          </div>
          <button
            onClick={() => { setNoteDismissed(true); saveNextNote(''); setNextNote(''); }}
            className="text-amber-400 hover:text-amber-700 text-xl leading-none"
          >×</button>
        </div>
      )}

      <div className="rounded-2xl shadow-sm p-8 w-full max-w-md" style={cardStyle}>

        {/* mode tabs */}
        <div className="flex rounded-xl p-1 mb-6 gap-1" style={{ background: 'var(--primary-muted)' }}>
          {Object.entries(MODES).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              disabled={status !== 'idle'}
              title={status !== 'idle' ? 'Stop the timer to switch modes' : undefined}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${activeTabCls(key)}`}
              style={key === mode ? activeTabStyle(key) : { color: 'var(--text-muted)' }}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {!isBreak && (
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
              Session label <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={60}
              value={label}
              onChange={e => setLabel(e.target.value)}
              disabled={status !== 'idle'}
              placeholder="e.g. Calculus homework"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              style={{ ...inputStyle, opacity: status !== 'idle' ? 0.6 : 1 }}
            />
          </div>
        )}

        {!isBreak && status === 'idle' && (
          <div className="flex gap-2 flex-wrap mb-5">
            {[25, 50].map(min => (
              <button
                key={min}
                onClick={() => { const s = min * 60; setDuration(s); setSecondsLeft(s); setCustomMin(''); }}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={duration === min * 60 && !customMin
                  ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                  : { background: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--border)' }
                }
              >
                {min} min
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={180}
              value={customMin}
              onChange={handleCustom}
              placeholder="Custom (min)"
              className="rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              style={inputStyle}
            />
          </div>
        )}

        {isBreak && status === 'idle' && (
          <p className="text-center text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            {mode === 'shortBreak' ? settings.shortBreak : settings.longBreak} min ·{' '}
            <span style={{ color: 'var(--text-faint)' }}>change in Settings</span>
          </p>
        )}

        <div className="text-center my-6">
          {label && !isBreak && <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>}
          <div
            className="font-mono text-8xl font-bold tabular-nums transition-colors"
            style={{ color: status === 'running' ? timerColor : 'var(--text)' }}
          >
            {formatSeconds(secondsLeft)}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {status === 'idle' && (
            <button
              onClick={() => { setStartTime(new Date().toISOString()); setStatus('running'); }}
              className="px-10 py-3 text-white rounded-xl font-bold text-lg transition-colors shadow-sm"
              style={{ background: isBreak
                ? (mode === 'shortBreak' ? '#10b981' : '#0ea5e9')
                : 'var(--primary)'
              }}
            >
              Start
            </button>
          )}

          {status === 'running' && (
            <>
              {(isBreak || !settings.strictMode) && (
                <button
                  onClick={() => setStatus('paused')}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                >
                  Pause
                </button>
              )}
              <button
                onClick={() => handleEnd(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                {isBreak ? 'Skip break' : 'End session'}
              </button>
            </>
          )}

          {status === 'paused' && (
            <>
              <button
                onClick={() => setStatus('running')}
                className="px-6 py-3 text-white rounded-xl font-semibold transition-colors"
                style={{ background: isBreak
                  ? (mode === 'shortBreak' ? '#10b981' : '#0ea5e9')
                  : 'var(--primary)'
                }}
              >
                Resume
              </button>
              <button
                onClick={() => handleEnd(false)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                {isBreak ? 'Skip break' : 'End session'}
              </button>
            </>
          )}
        </div>

        {settings.autoStartNext && status !== 'idle' && (
          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Auto-start on · {isBreak ? 'next Pomodoro' : 'short break'} starts automatically
          </p>
        )}
        {settings.autoStartNext && status === 'idle' && (
          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Auto-start on · {isBreak ? 'Pomodoro' : 'break'} will start when this ends
          </p>
        )}
      </div>

      {/* session to-do card */}
      <div className="w-full max-w-md rounded-2xl shadow-sm" style={cardStyle}>
        <button
          onClick={() => setShowTodos(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold rounded-2xl tab-hover transition-colors"
          style={{ color: 'var(--text)' }}
        >
          <span>
            Session To-Do
            {todos.length > 0 && (
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                {todos.filter(t => t.done).length}/{todos.length} done
              </span>
            )}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{showTodos ? '▲' : '▼'}</span>
        </button>

        {showTodos && (
          <div className="px-5 pb-4">
            {todos.length === 0 && (
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No tasks yet — add something to work on.</p>
            )}
            <ul className="space-y-2 mb-3">
              {todos.map(todo => (
                <li key={todo.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                    style={todo.done
                      ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }
                      : { borderColor: 'var(--border)' }
                    }
                  >
                    {todo.done && (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: 'var(--text)', textDecoration: todo.done ? 'line-through' : 'none', opacity: todo.done ? 0.5 : 1 }}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-base leading-none transition-opacity hover:text-red-400"
                    style={{ color: 'var(--text-faint)' }}
                  >×</button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder="Add a task..."
                className="flex-1 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                style={inputStyle}
              />
              <button
                onClick={addTodo}
                className="px-3 py-1.5 rounded-lg text-sm text-white"
                style={{ background: 'var(--primary)' }}
              >Add</button>
            </div>
            {todos.some(t => t.done) && (
              <button
                onClick={() => { const u = todos.filter(t => !t.done); setTodos(u); persistTodos(u); }}
                className="mt-2 text-xs hover:text-red-400"
                style={{ color: 'var(--text-faint)' }}
              >Clear completed</button>
            )}
          </div>
        )}
      </div>

      {sessionData && isGuest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-4xl mb-4">⏱</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Session complete!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Sign in to save your data, track progress, and see analytics.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                Create free account
              </button>
              <button
                onClick={() => setSessionData(null)}
                className="w-full py-2 rounded-xl text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionData && !isGuest && (
        <PostSessionForm
          sessionData={sessionData}
          onClose={() => setSessionData(null)}
          onNoteForNext={note => { saveNextNote(note); setNextNote(note); setNoteDismissed(false); }}
        />
      )}
    </div>
  );
}
