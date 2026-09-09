import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Held open by App.jsx via its own React state, deliberately not driven by
// the Firestore subscription: the household document (and its householdId on
// the user doc) exists the instant createHousehold's writes land, which would
// otherwise swap this screen out before the code was ever readable.
export default function HouseholdCreatedScreen({ code, onContinue }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable; the code is on screen to type regardless.
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '40px 22px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-main)' }}>Household created</div>
        <div style={{ font: '500 13px Manrope', color: 'var(--text-muted)', marginTop: '8px' }}>
          Share this code with your family. Anyone who signs in and enters it joins this same budget.
        </div>
      </div>

      <div
        style={{
          margin: '28px 0 8px', padding: '20px', borderRadius: '16px', textAlign: 'center',
          background: 'var(--accent-tint)', border: '1px solid var(--accent-border)'
        }}
      >
        <div style={{ font: '600 10px Manrope', letterSpacing: '.14em', color: 'var(--text-dim)' }}>HOUSEHOLD CODE</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', letterSpacing: '.08em', color: 'var(--accent-strong)', marginTop: '6px' }}>
          {code}
        </div>
      </div>

      <button
        type="button"
        onClick={copyCode}
        className="action-pill secondary"
        style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', marginBottom: '22px' }}
      >
        {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy code</>}
      </button>

      <button type="button" onClick={onContinue} className="btn-primary" style={{ padding: '13px', fontSize: '0.92rem' }}>
        Continue
      </button>
    </div>
  );
}
