const OPTIONS = ['tiktok', 'youtube', 'chat', 'phone', 'noise', 'none', 'other'];

const LABELS = {
  tiktok: 'TikTok', youtube: 'YouTube', chat: 'Chat',
  phone: 'Phone', noise: 'Noise', none: 'None', other: 'Other',
};

const TIPS = {
  tiktok: 'Try grayscale mode or app blockers like Freedom',
  youtube: 'Try grayscale mode or app blockers like Freedom',
  phone: 'Put your phone in another room before starting',
  chat: 'Enable Do Not Disturb before your next session',
  noise: 'Try brown noise — studies show it beats white noise for focus',
  none: 'Perfect session. Keep this environment for next time.',
  other: 'Identify the trigger and plan to remove it next time',
};

export default function DistractionPicker({ value, onChange }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              value === opt
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {LABELS[opt]}
          </button>
        ))}
      </div>
      {value && (
        <p className="mt-2 text-sm text-indigo-700 bg-indigo-50 rounded px-3 py-2">
          Tip: {TIPS[value]}
        </p>
      )}
    </div>
  );
}
