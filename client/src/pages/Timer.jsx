import { useState, useEffect, useRef } from 'react';
import PostSessionForm from '../components/PostSessionForm.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { playEndSound, showEndNotification } from '../utils/sound.js';
import { formatSeconds } from '../utils/time.js';

const STORAGE_KEY = 'focuslog_timer';
const TODOS_KEY = 'focuslog_todos';
const NEXT_NOTE_KEY = 'focuslog_nextnote';

const MODES = {
  pomodoro:   { label: 'Pomodoro',    settingsKey: 'defaultDuration', color: 'indigo' },
  shortBreak: { label: 'Short Break', settingsKey: 'shortBreak',      color: 'emerald' },
  longBreak:  { label: 'Long Break',  settingsKey: 'longBreak',        color: 'sky' },
};

const TAB_COLORS = {
  indigo:  { active: 'bg-indigo-600 text-white',  timer: 'text-indigo-600',  btn: 'bg-indigo-600 hover:bg-indigo-700' },
  emerald: { active: 'bg-emerald-500 text-white', timer: 'text-emerald-500', btn: 'bg-emerald-500 hover:bg-emerald-600' },
  sky:     { active: 'bg-sky-500 text-white',     timer: 'text-sky-500',     btn: 'bg-sky-500 hover:bg-sky-600' },
};

// ── storage helpers ──────────────────────────────────────────────────────────
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

// ── component ────────────────────────────────────────────────────────────────
export default function Timer() {
  const { settings } = useSettings();
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

  // todos
  const [todos, setTodos]     = useState(getTodos);
  const [newTodo, setNewTodo] = useState('');
  const [showTodos, setShowTodos] = useState(true);

  // next-session note
  const [nextNote, setNextNote]         = useState(getNextNote);
  const [noteDismissed, setNoteDismissed] = useState(false);

  const intervalRef       = useRef(null);
  const autoEndRef        = useRef(false);
  const shouldAutoStartRef = useRef(false);

  // keep refs fresh so handleEnd never reads stale values
  const durationRef   = useRef(duration);
  const secondsLeftRef = useRef(secondsLeft);
  const startTimeRef  = useRef(startTime);
  const labelRef      = useRef(label);
  const modeRef       = useRef(mode);
  durationRef.current   = duration;
  secondsLeftRef.current = secondsLeft;
  startTimeRef.current  = startTime;
  labelRef.current      = label;
  modeRef.current       = mode;

  // ── effects ────────────────────────────────────────────────────────────────
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

  // auto-end (runs after every render, picks up fresh refs)
  useEffect(() => {
    if (autoEndRef.current) { autoEndRef.current = false; handleEnd(true); }
  });

  // auto-start (runs after every render)
  useEffect(() => {
    if (shouldAutoStartRef.current && status === 'idle') {
      shouldAutoStartRef.current = false;
      setStartTime(new Date().toISOString());
      setStatus('running');
    }
  });

  // handle timer that expired while browsing another page
  useEffect(() => {
    if (expiredOnMount) handleEnd(true);
  }, []); // eslint-disable-line

  // persist state
  useEffect(() => {
    const endTime = status === 'running' ? Date.now() + secondsLeft * 1000 : undefined;
    saveTimerState({ mode, duration, label, status, secondsLeft, startTime, endTime });
  }, [mode, duration, label, status, secondsLeft, startTime]);

  // ── handlers ───────────────────────────────────────────────────────────────
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
      // log the focus session
      setSessionData({
        label: labelRef.current,
        startTime: startTimeRef.current || end,
        endTime: end,
        durationSeconds: Math.max(elapsed, 1),
      });
      if (timedOut) {
        // switch to short break
        const d = settings.shortBreak * 60;
        setMode('shortBreak'); setDuration(d); setSecondsLeft(d);
        if (settings.autoStartNext) shouldAutoStartRef.current = true;
      } else {
        // manual end — stay in pomodoro, reset
        setSecondsLeft(dur);
      }
    } else {
      // break ended → back to pomodoro
      const d = settings.defaultDuration * 60;
      setMode('pomodoro'); setDuration(d); setSecondsLeft(d);
      if (timedOut && settings.autoStartNext) shouldAutoStartRef.current = true;
    }
    setStatus('idle');
  }

  // ── todo helpers ──────────────────────────────────────────────────────────
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

  // ── render helpers ─────────────────────────────────────────────────────────
  const isBreak = mode !== 'pomodoro';
  const c       = TAB_COLORS[MODES[mode].color];
  const showNote = nextNote && !noteDismissed && !isBreak && status === 'idle';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 gap-4">

      {/* next-session note banner */}
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

      {/* main timer card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* mode tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6 gap-1">
          {Object.entries(MODES).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              disabled={status !== 'idle'}
              title={status !== 'idle' ? 'Stop the timer to switch modes' : undefined}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                mode === key ? TAB_COLORS[cfg.color].active : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* label (pomodoro only) */}
        {!isBreak && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Session label <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={60}
              value={label}
              onChange={e => setLabel(e.target.value)}
              disabled={status !== 'idle'}
              placeholder="e.g. Calculus homework"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50"
            />
          </div>
        )}

        {/* duration row (pomodoro idle only) */}
        {!isBreak && status === 'idle' && (
          <div className="flex gap-2 flex-wrap mb-5">
            {[25, 50].map(min => (
              <button
                key={min}
                onClick={() => { const s = min * 60; setDuration(s); setSecondsLeft(s); setCustomMin(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  duration === min * 60 && !customMin
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }`}
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        )}

        {/* break subtitle */}
        {isBreak && status === 'idle' && (
          <p className="text-center text-sm text-gray-400 mb-5">
            {mode === 'shortBreak' ? settings.shortBreak : settings.longBreak} min ·{' '}
            <span className="text-gray-300">change in Settings</span>
          </p>
        )}

        {/* countdown */}
        <div className="text-center my-6">
          {label && !isBreak && <p className="text-sm text-gray-500 mb-2">{label}</p>}
          <div className={`font-mono text-8xl font-bold tabular-nums transition-colors ${
            status === 'running' ? c.timer : 'text-gray-800'
          }`}>
            {formatSeconds(secondsLeft)}
          </div>
        </div>

        {/* controls */}
        <div className="flex gap-3 justify-center">
          {status === 'idle' && (
            <button
              onClick={() => { setStartTime(new Date().toISOString()); setStatus('running'); }}
              className={`px-10 py-3 text-white rounded-xl font-bold text-lg transition-colors shadow-sm ${c.btn}`}
            >
              Start
            </button>
          )}

          {status === 'running' && (
            <>
              {/* pause: always for breaks, only without strict-mode for pomodoro */}
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
                className={`px-6 py-3 text-white rounded-xl font-semibold transition-colors ${c.btn}`}
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

        {/* auto-start hint */}
        {settings.autoStartNext && status !== 'idle' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Auto-start on · {isBreak ? 'next Pomodoro' : 'short break'} starts automatically
          </p>
        )}
        {settings.autoStartNext && status === 'idle' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Auto-start on · {isBreak ? 'Pomodoro' : 'break'} will start when this ends
          </p>
        )}
      </div>

      {/* session to-do card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={() => setShowTodos(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-2xl"
        >
          <span>
            Session To-Do
            {todos.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                {todos.filter(t => t.done).length}/{todos.length} done
              </span>
            )}
          </span>
          <span className="text-gray-400 text-xs">{showTodos ? '▲' : '▼'}</span>
        </button>

        {showTodos && (
          <div className="px-5 pb-4">
            {todos.length === 0 && (
              <p className="text-sm text-gray-400 mb-3">No tasks yet — add something to work on.</p>
            )}
            <ul className="space-y-2 mb-3">
              {todos.map(todo => (
                <li key={todo.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      todo.done ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {todo.done && (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-base leading-none transition-opacity"
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
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={addTodo}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
              >Add</button>
            </div>
            {todos.some(t => t.done) && (
              <button
                onClick={() => { const u = todos.filter(t => !t.done); setTodos(u); persistTodos(u); }}
                className="mt-2 text-xs text-gray-400 hover:text-red-400"
              >Clear completed</button>
            )}
          </div>
        )}
      </div>

      {sessionData && (
        <PostSessionForm
          sessionData={sessionData}
          onClose={() => setSessionData(null)}
          onNoteForNext={note => { saveNextNote(note); setNextNote(note); setNoteDismissed(false); }}
        />
      )}
    </div>
  );
}
