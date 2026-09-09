import React, { useState } from 'react';
import { Home, Users, LogOut } from 'lucide-react';

// Shown after sign-in when the account belongs to no household yet. Create one
// or join an existing one with its code. A freshly created household's code
// is confirmed on a separate screen the parent holds open explicitly (see
// HouseholdCreatedScreen) — the live data subscription would otherwise swap
// this component out the instant the write lands, before anyone could read
// the code that was just generated.
export default function HouseholdSetup({ onCreate, onJoin, onLogout }) {
  const [mode, setMode] = useState('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await onCreate(name.trim());
    } catch (err) {
      setError(err.message || 'Could not create the household.');
      setBusy(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await onJoin(code);
    } catch (err) {
      setError(err.message || 'Could not join.');
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 22px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '25px', color: 'var(--text-main)' }}>Set up your household</div>
        <div style={{ font: '500 13px Manrope', color: 'var(--text-muted)', marginTop: '8px' }}>
          Start a new shared budget, or join one a family member already made.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card-hover)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
        {[['create', 'Create new', Home], ['join', 'Join with code', Users]].map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setMode(key); setError(''); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '8px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              font: '700 12px Manrope',
              background: mode === key ? 'var(--accent-strong)' : 'transparent',
              color: mode === key ? 'var(--text-on-accent-strong)' : 'var(--text-muted)'
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {mode === 'create' ? (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Household name</label>
            <input type="text" className="form-input" placeholder="e.g. The Sharma Family" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.78rem', fontWeight: '600' }} role="alert">{error}</div>}
          <button type="submit" className="btn-primary" style={{ padding: '13px', fontSize: '0.92rem' }} disabled={busy}>
            {busy ? 'Creating…' : 'Create household'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Household code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. K7P2QM"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}
              required
            />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.78rem', fontWeight: '600' }} role="alert">{error}</div>}
          <button type="submit" className="btn-primary" style={{ padding: '13px', fontSize: '0.92rem' }} disabled={busy}>
            {busy ? 'Joining…' : 'Join household'}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onLogout}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-dim)', font: '600 12px Manrope', cursor: 'pointer', marginTop: '22px' }}
      >
        <LogOut size={13} /> Sign out
      </button>
    </div>
  );
}
