import { formatSeconds } from '../utils/time.js';

export default function TimerDisplay({ secondsLeft, isRunning, label }) {
  return (
    <div className="text-center">
      {label && <p className="text-gray-500 text-sm mb-2 font-medium">{label}</p>}
      <div className={`font-mono text-7xl font-bold tabular-nums transition-colors ${
        isRunning ? 'text-indigo-600' : 'text-gray-700'
      }`}>
        {formatSeconds(secondsLeft)}
      </div>
    </div>
  );
}
