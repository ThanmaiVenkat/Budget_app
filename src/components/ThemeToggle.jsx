import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Auto', icon: Monitor }
];

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <div style={{ display: 'flex', gap: '6px', background: 'var(--hairline)', padding: '4px', borderRadius: '12px' }}>
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-pressed={isActive}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '8px 6px',
              borderRadius: '9px',
              border: 'none',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isActive ? '700' : '600',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <Icon size={13} /> {label}
          </button>
        );
      })}
    </div>
  );
}
