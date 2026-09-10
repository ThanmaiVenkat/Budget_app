import React, { useState } from 'react';
import TallyMark from './TallyMark';
import { generateId, MEMBER_AVATARS, MEMBER_COLORS } from '../utils/mockData';

// Shown in place of the whole tabbed app whenever the household has no real
// members yet — a true first run, or every member having been deleted. A
// fresh install should feel like an app just downloaded from a store, not a
// showcase pre-loaded with a stranger's family and spending.
export default function OnboardingScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(MEMBER_AVATARS[0].value);
  const [isEarner, setIsEarner] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onComplete({
      id: generateId('mem'),
      name: trimmed,
      avatar,
      color: MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)],
      role: isEarner ? 'Primary Earner & Head' : 'Household Member',
      allowance: 0,
      isEarner
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 22px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--accent-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-on-accent-strong)',
            marginBottom: '18px'
          }}
        >
          <TallyMark size={24} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text-main)' }}>
          Welcome to Tally
        </div>
        <div style={{ font: '500 13px Manrope', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '280px' }}>
          Let's set up your household. Add yourself first — you can invite the rest of the family afterward.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pick an Avatar</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '4px 0' }}>
            {MEMBER_AVATARS.map(({ value, label }) => {
              const isSelected = avatar === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAvatar(value)}
                  aria-pressed={isSelected}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    background: isSelected ? 'var(--positive-tint)' : 'var(--bg-card-hover)',
                    border: `2px solid ${isSelected ? 'var(--positive)' : 'transparent'}`,
                    color: isSelected ? 'var(--positive-strong)' : 'var(--text-muted)',
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-card-border)',
            cursor: 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={isEarner}
            onChange={(e) => setIsEarner(e.target.checked)}
            style={{ marginTop: '3px' }}
          />
          <span>
            <span style={{ display: 'block', font: '700 13px Manrope', color: 'var(--text-main)' }}>
              I earn income for this household
            </span>
            <span style={{ display: 'block', font: '500 11.5px Manrope', color: 'var(--text-muted)', marginTop: '2px' }}>
              Salary and other income will be logged under your name. You can change this later, or add more earners.
            </span>
          </span>
        </label>

        <button type="submit" className="btn-primary" style={{ padding: '13px', fontSize: '0.92rem', marginTop: '4px' }}>
          Get Started
        </button>
      </form>
    </div>
  );
}
