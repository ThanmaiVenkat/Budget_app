import React from 'react';
import { AlertTriangle, RotateCw, LogOut } from 'lucide-react';

// Shown when a Firestore read/listener fails — almost always unpublished
// security rules (see useAppData's describeDataError), but the message
// passed in already accounts for that. Without this screen the app just sat
// on "Loading…" forever with the real error thrown away as an unhandled
// rejection: reproduced and confirmed against the emulator with a deny-all
// rules file before this existed.
export default function DataAccessError({ message, onRetry, onLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px 24px', textAlign: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
        <AlertTriangle size={24} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-main)' }}>
        Couldn't load your data
      </div>
      <div style={{ font: '500 13px Manrope', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.5 }}>
        {message}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '260px', marginTop: '6px' }}>
        <button
          onClick={onRetry}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
        >
          <RotateCw size={15} /> Try Again
        </button>
        <button
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-dim)', font: '600 12px Manrope', cursor: 'pointer', padding: '4px' }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}
