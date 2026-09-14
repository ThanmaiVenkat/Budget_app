import React, { useState } from 'react';
import TallyMark from './TallyMark';
import { generateId, MEMBER_AVATARS, MEMBER_COLORS, unclaimedMembers } from '../utils/mockData';
import Emoji from './Emoji';

// Shown to a signed-in account that owns no member profile yet. Two ways in:
// claim a profile already in the household, or add a new one.
//
// Claiming is what carries existing history across. A household's spending was
// all filed under profiles that predate ownership, so the person who has been
// logging as "Thanmai" claims that profile and keeps the right to correct
// everything they logged. Joining used to skip this entirely — a new account
// landed in the household able to act as anyone in it.
export default function ProfileClaimScreen({ members = [], householdName, onClaim, onCreate, onLogout }) {
  const available = unclaimedMembers(members);
  const [mode, setMode] = useState(available.length ? 'claim' : 'create');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(MEMBER_AVATARS[0].value);

  const handleCreate = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({
      id: generateId('mem'),
      name: trimmed,
      avatar,
      color: MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)],
      role: 'Household Member',
      allowance: 0,
      isEarner: false
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 22px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--accent-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-on-accent-strong)', marginBottom: '16px' }}>
          <TallyMark size={26} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text-main)' }}>
          Which one is you?
        </h1>
        <p style={{ font: '500 13px Manrope', color: 'var(--text-muted)', marginTop: '6px' }}>
          {householdName ? `You've joined ${householdName}. ` : ''}
          Pick your profile so your entries stay yours to edit.
        </p>
      </div>

      {available.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card-hover)', padding: '3px', borderRadius: '12px', marginBottom: '16px' }}>
          {['claim', 'create'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '8px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: mode === m ? 'var(--accent-strong)' : 'transparent',
                color: mode === m ? 'var(--text-on-accent-strong)' : 'var(--text-muted)',
                fontWeight: '700', fontSize: '0.78rem'
              }}
            >
              {m === 'claim' ? "I'm already listed" : "Add me"}
            </button>
          ))}
        </div>
      )}

      {mode === 'claim' && available.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {available.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onClaim(m.id)}
              className="glass-card"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <div className="member-avatar-wrapper" style={{ width: '42px', height: '42px', borderColor: m.color }}>
                <Emoji size="21px">{m.avatar || '👤'}</Emoji>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{m.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {m.role || 'Household member'}
                </div>
              </div>
            </button>
          ))}
          <p style={{ font: '500 11.5px Manrope', color: 'var(--text-dim)', textAlign: 'center', marginTop: '4px' }}>
            Claiming a profile makes its past entries yours to edit. Only pick one that is actually you.
          </p>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="claim-name">Your name</label>
            <input
              id="claim-name"
              type="text"
              className="form-input"
              placeholder="e.g. Dad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pick an avatar</label>
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
                      padding: '8px 14px', borderRadius: '999px',
                      background: isSelected ? 'var(--positive-tint)' : 'var(--bg-card-hover)',
                      border: `2px solid ${isSelected ? 'var(--positive)' : 'transparent'}`,
                      color: isSelected ? 'var(--positive-strong)' : 'var(--text-muted)',
                      fontWeight: isSelected ? '700' : '600', fontSize: '0.8rem', cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn-primary">Continue</button>
        </form>
      )}

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', font: '600 12px Manrope', cursor: 'pointer', marginTop: '18px' }}
        >
          Sign out
        </button>
      )}
    </div>
  );
}
