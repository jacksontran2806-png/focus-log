import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import DistractionPicker from './DistractionPicker.jsx';
import { useSessions } from '../context/SessionContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const inputStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
};

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

  const labelCls = 'block text-sm font-semibold mb-2';
  const areaCls = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Session complete!</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          {Math.round(sessionData.durationSeconds / 60)} min
          {sessionData.label ? ` · ${sessionData.label}` : ''}
        </p>

        <div className="space-y-5">
          <div>
            <label className={labelCls} style={{ color: 'var(--text)' }}>Focus rating</label>
            <StarRating value={focusRating} onChange={setFocusRating} />
          </div>

          {settings.tags?.length > 0 && (
            <div>
              <label className={labelCls} style={{ color: 'var(--text)' }}>Subject</label>
              <div className="flex flex-wrap gap-2">
                {settings.tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSubject(prev => prev === tag ? '' : tag)}
                    className="px-3 py-1 rounded-full text-sm border transition-colors"
                    style={subject === tag
                      ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                      : { background: 'var(--bg)', color: 'var(--text-muted)', borderColor: 'var(--border)' }
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={labelCls} style={{ color: 'var(--text)' }}>Main distraction</label>
            <DistractionPicker value={distractionType} onChange={setDistractionType} />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'var(--text)' }}>What went well?</label>
            <textarea
              value={whatWentWell}
              onChange={e => setWhatWentWell(e.target.value)}
              placeholder="e.g. I stayed off my phone for the first 20 minutes"
              className={areaCls}
              style={inputStyle}
              rows={2}
            />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'var(--text)' }}>What could be done better?</label>
            <textarea
              value={whatToDoBetter}
              onChange={e => setWhatToDoBetter(e.target.value)}
              placeholder="e.g. Close YouTube before starting next time"
              className={areaCls}
              style={inputStyle}
              rows={2}
            />
          </div>

          {distractionType === 'other' && (
            <div>
              <label className={labelCls} style={{ color: 'var(--text)' }}>Distraction note (optional)</label>
              <input
                type="text"
                value={distractionNote}
                onChange={e => setDistractionNote(e.target.value)}
                placeholder="What was the distraction?"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label className={labelCls} style={{ color: 'var(--text)' }}>
              Note for next session
              <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-faint)' }}>(optional)</span>
            </label>
            <textarea
              value={noteForNext}
              onChange={e => setNoteForNext(e.target.value)}
              placeholder="e.g. Start with the hardest problem first"
              className={areaCls}
              style={inputStyle}
              rows={2}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              This will appear as a reminder when you open the timer next time.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-semibold transition-colors text-white"
            style={{ background: 'var(--primary)' }}
          >
            Save session
          </button>
        </div>
      </div>
    </div>
  );
}
