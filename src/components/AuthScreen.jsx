import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

// Signed-out gate. Sign up creates a Firebase Auth account; sign in returns to
// an existing one. Household setup happens on the next screen.
export default function AuthScreen({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) await onSignup(email.trim(), password);
      else await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '36px 22px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            width: '52px', height: '52px', borderRadius: '16px', background: 'var(--accent-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-on-accent-strong)', marginBottom: '18px'
          }}
        >
          <Wallet size={24} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text-main)' }}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </div>
        <div style={{ font: '500 13px Manrope', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '280px' }}>
          {isSignup
            ? 'Your family budget syncs across every device you sign in on.'
            : 'Sign in to reach your household budget on this device.'}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.78rem', fontWeight: '600' }} role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ padding: '13px', fontSize: '0.92rem', marginTop: '4px' }} disabled={busy}>
          {busy ? 'Please wait…' : (isSignup ? 'Create account' : 'Sign in')}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}
        style={{ background: 'none', border: 'none', color: 'var(--accent-strong)', font: '600 13px Manrope', cursor: 'pointer', marginTop: '18px' }}
      >
        {isSignup ? 'Already have an account? Sign in' : "New here? Create an account"}
      </button>
    </div>
  );
}
