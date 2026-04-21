import { useState } from 'react';

const LABELS = {
  1: 'Mostly distracted', 2: 'Mostly distracted', 3: 'Mostly distracted',
  4: 'Somewhat focused', 5: 'Somewhat focused',
  6: 'Mostly focused', 7: 'Mostly focused',
  8: 'Deeply focused', 9: 'Deeply focused',
  10: 'Flow state',
};

export default function StarRating({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const display = hover || value || 0;

  return (
    <div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            className={`text-2xl leading-none transition-colors ${
              n <= display ? 'text-amber-400' : 'text-gray-300'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange && onChange(n)}
          >
            {n <= display ? '★' : '☆'}
          </button>
        ))}
      </div>
      {!readOnly && (
        <p className="text-xs text-gray-500 mt-1">
          {display ? `${display}/10 — ${LABELS[display]}` : '1 = completely distracted, 10 = deep flow state'}
        </p>
      )}
    </div>
  );
}
