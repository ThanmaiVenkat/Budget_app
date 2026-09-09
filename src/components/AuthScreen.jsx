import React, { useState } from 'react';
import TallyMark from './TallyMark';

// Google's own multi-colour "G" mark — not a lucide icon, since lucide is a
// generic outline set with no brand logos.
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

// Signed-out gate. Sign up creates a Firebase Auth account; sign in returns to
// an existing one. Google is a second entry into the same account system —
// either path lands on the same household setup next.
export default function AuthScreen({ onLogin, onSignup, onGoogleLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

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

  const handleGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      await onGoogleLogin();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
    setGoogleBusy(false);
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
          <TallyMark size={24} />
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

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleBusy}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          padding: '12px', borderRadius: '12px', border: '1px solid var(--bg-card-border)',
          background: 'var(--bg-card)', color: 'var(--text-main)', font: '600 14px Manrope',
          cursor: googleBusy ? 'default' : 'pointer', marginBottom: '18px'
        }}
      >
        <GoogleIcon /> {googleBusy ? 'Please wait…' : 'Continue with Google'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--bg-card-border)' }} />
        <span style={{ font: '600 11px Manrope', color: 'var(--text-dim)', letterSpacing: '.06em' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--bg-card-border)' }} />
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
