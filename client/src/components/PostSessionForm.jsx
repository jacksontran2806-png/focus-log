import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import DistractionPicker from './DistractionPicker.jsx';
import { useSessions } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export default function PostSessionForm({ sessionData, onClose, onNoteForNext }) {
  const navigate = useNavigate();
  const { addSession } = useSessions();
  const { settings } = useSettings();

  const [focusRating, setFocusRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [distractionType, setDistractionType] = useState('');
  const [distractionNote, setDistractionNote] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToDoBetter, setWhatToDoBetter] = useState('');
  const [noteForNext, setNoteForNext] = useState('');
  const [error, setError] = useState('');

  function handleSave() {
    if (!focusRating) { setError('Please rate your focus.'); return; }
    if (!distractionType) { setError('Please select a distraction type.'); return; }

    const session = {
      id: crypto.randomUUID(),
      label: sessionData.label || null,
      subject: subject || null,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      durationSeconds: sessionData.durationSeconds,
      focusRating,
      distractionType,
      distractionNote: distractionNote || null,
      whatWentWell: whatWentWell || null,
      whatToDoBetter: whatToDoBetter || null,
      createdAt: new Date().toISOString(),
    };

    addSession(session);
    if (onNoteForNext) onNoteForNext(noteForNext);
    onClose?.();
    navigate('/dashboard');
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Session complete!</h2>
        <p className="text-sm text-gray-500 mb-5">
          {Math.round(sessionData.durationSeconds / 60)} min
          {sessionData.label ? ` · ${sessionData.label}` : ''}
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Focus rating</label>
            <StarRating value={focusRating} onChange={setFocusRating} />
          </div>

          {settings.tags?.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <div className="flex flex-wrap gap-2">
                {settings.tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSubject(prev => prev === tag ? '' : tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      subject === tag
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Main distraction</label>
            <DistractionPicker value={distractionType} onChange={setDistractionType} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What went well?</label>
            <textarea
              value={whatWentWell}
              onChange={e => setWhatWentWell(e.target.value)}
              placeholder="e.g. I stayed off my phone for the first 20 minutes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What could be done better?</label>
            <textarea
              value={whatToDoBetter}
              onChange={e => setWhatToDoBetter(e.target.value)}
              placeholder="e.g. Close YouTube before starting next time"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={2}
            />
          </div>

          {distractionType === 'other' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Distraction note (optional)</label>
              <input
                type="text"
                value={distractionNote}
                onChange={e => setDistractionNote(e.target.value)}
                placeholder="What was the distraction?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Note for next session
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={noteForNext}
              onChange={e => setNoteForNext(e.target.value)}
              placeholder="e.g. Start with the hardest problem first"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={2}
            />
            <p className="text-xs text-gray-400 mt-1">This will appear as a reminder when you open the timer next time.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Save session
          </button>
        </div>
      </div>
    </div>
  );
}
