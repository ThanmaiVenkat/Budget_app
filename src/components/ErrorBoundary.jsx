import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { resetToDefaultState } from '../utils/storage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetData = () => {
    if (window.confirm('Reset all app data to the sample dataset? This clears anything you\'ve added.')) {
      resetToDefaultState();
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '32px 24px',
          textAlign: 'center',
          background: 'var(--bg-page)',
          color: 'var(--text-main)',
          fontFamily: "'Manrope', system-ui, sans-serif"
        }}
      >
        <AlertTriangle size={40} color="var(--danger)" />
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px' }}>Something went wrong</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
            The app hit an unexpected error and couldn't continue. Your data is safe in this browser
            &mdash; try reloading first.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '280px', marginTop: '8px' }}>
          <button
            onClick={this.handleReload}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--accent-strong)',
              color: 'var(--text-on-accent-strong)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} /> Reload App
          </button>

          <button
            onClick={this.handleResetData}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--danger-tint)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={16} /> Reset App Data
          </button>
        </div>
      </div>
    );
  }
}
