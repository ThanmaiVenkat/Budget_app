import React from 'react';
import { Sparkles, CloudOff } from 'lucide-react';

export default function FirebaseNotConfigured({ onStartDemo }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px 24px', textAlign: 'center', gap: '16px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-strong)' }}>
        <CloudOff size={26} />
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-main)' }}>
          Sync Isn't Configured Yet
        </div>
        <div style={{ font: '500 13px Manrope', color: 'var(--text-muted)', maxWidth: '310px', lineHeight: 1.5, marginTop: '6px' }}>
          This build doesn't have live Firebase credentials yet, but you can explore and test all features right now in <b>Local Demo Mode</b>!
        </div>
      </div>

      {onStartDemo && (
        <button
          onClick={onStartDemo}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '0.9rem',
            marginTop: '4px'
          }}
        >
          <Sparkles size={16} /> Explore Demo Mode
        </button>
      )}

      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', maxWidth: '280px', marginTop: '8px' }}>
        To enable multi-device sync later, add your <code>VITE_FIREBASE_*</code> values in <code>.env.local</code>.
      </div>
    </div>
  );
}
