import React from 'react';

// Catches render/lifecycle errors anywhere below it so one broken component
// shows a recovery card instead of a blank white screen.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '24px',
          background: '#17140f',
          color: '#f3ece0',
          textAlign: 'center',
          font: '500 14px Manrope, system-ui, sans-serif'
        }}
      >
        <div style={{ fontSize: '2rem' }}>😵</div>
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Something broke</div>
        <div style={{ color: '#8a7d6d', maxWidth: '320px' }}>
          The app hit an unexpected error. Your saved data is safe in local storage.
        </div>
        {this.state.error?.message && (
          <code
            style={{
              color: '#f87171',
              fontSize: '12px',
              background: 'rgba(248,113,113,0.1)',
              padding: '8px 12px',
              borderRadius: '8px',
              maxWidth: '320px',
              overflowWrap: 'break-word'
            }}
          >
            {this.state.error.message}
          </code>
        )}
        <button
          onClick={this.handleReload}
          style={{
            marginTop: '4px',
            background: 'linear-gradient(135deg, #f9812f 0%, #e8590c 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '10px 22px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Reload app
        </button>
      </div>
    );
  }
}
