import { useState } from 'react';
import PricingModal from './PricingModal.jsx';

export default function ProLockBanner({ feature = 'This feature' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="rounded-xl p-6 text-center flex flex-col items-center gap-3"
        style={{ border: '2px dashed var(--primary-lt)', background: 'var(--primary-muted)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}
        >
          ✦
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Pro feature</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {feature} requires a Pro plan
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          Unlock Pro
        </button>
      </div>

      {showModal && (
        <PricingModal feature={feature} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
