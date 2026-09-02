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
          background: '#17140f',
          color: '#f3ece0',
          fontFamily: "'Manrope', system-ui, sans-serif"
        }}
      >
        <AlertTriangle size={40} color="#f87171" />
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px' }}>Something went wrong</h1>
          <p style={{ fontSize: '0.85rem', color: '#8a7d6d', maxWidth: '320px' }}>
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
              background: 'var(--orange-primary, #f26a1b)',
              color: '#fff',
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
              background: 'rgba(248, 113, 113, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.3)',
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
