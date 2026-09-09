import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Shown when the app was built without Firebase config (no VITE_FIREBASE_*
// values). Better than a blank screen: it says exactly what's missing.
export default function FirebaseNotConfigured() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px 24px', textAlign: 'center', gap: '14px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
        <AlertTriangle size={24} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-main)' }}>
        Sync isn't configured yet
      </div>
      <div style={{ font: '500 13px Manrope', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.5 }}>
        This build has no Firebase project connected, so accounts and cross-device
        sync can't run. Add the <code>VITE_FIREBASE_*</code> values from your
        Firebase project and rebuild — see <code>README.md</code> for the steps.
      </div>
    </div>
  );
}
