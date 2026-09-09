import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatRupees, MEMBER_AVATARS, MEMBER_COLORS } from '../utils/mockData';
import Emoji from './Emoji';

export default function MembersTab({ members = [], transactions = [], onAddMember, onDeleteMember }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧒');
  const [role, setRole] = useState('Child');
  const [allowance, setAllowance] = useState('');
  const hasEarner = members.some((m) => m.isEarner);
  // The first member added has nobody else to attribute income to, so mark
  // them the earner by default; later additions default to a spending member.
  const [isEarnerField, setIsEarnerField] = useState(!hasEarner);

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!name) return;

    const randomColor = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];

    onAddMember({
      id: name.toLowerCase().replace(/\s+/g, '-') || `member-${Date.now()}`,
      name,
      avatar,
      color: randomColor,
      role,
      allowance: parseFloat(allowance) || 0,
      isEarner: isEarnerField
    });

    setName('');
    setAllowance('');
    setShowAdd(false);
  };

  const earner = members.find((m) => m.isEarner);

  const handleDeleteMember = (member) => {
    const spent = transactions
      .filter(t => t.memberId === member.id && t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const warning = spent > 0
      ? `Remove ${member.name}? Their ${formatRupees(spent)} in past expenses will stay in the history, just no longer linked to a member.`
      : `Remove ${member.name}?`;

    if (window.confirm(warning) && onDeleteMember) {
      onDeleteMember(member.id);
    }
  };

  const totalHouseholdIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Primary earner banner — only when someone has actually been flagged
          as one; a fresh household with nobody so designated shows nothing
          here rather than a fake placeholder. */}
      {earner && (
        <div className="glass-card" style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <Emoji size="1.5rem">{earner.avatar}</Emoji>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{earner.name}</h3>
                <span style={{ fontSize: '0.65rem', background: 'var(--accent-strong)', color: 'var(--text-on-accent-strong)', padding: '2px 8px', borderRadius: '999px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Earner
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {totalHouseholdIncome > 0
                  ? `${formatRupees(totalHouseholdIncome)} in household income logged`
                  : 'No income logged yet'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700' }}>Family Members & Expenses</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Members add expenses whenever they spend
          </span>
        </div>
        <button
          onClick={() => { setIsEarnerField(!hasEarner); setShowAdd(!showAdd); }}
          aria-label={showAdd ? 'Close add member form' : 'Add family member'}
          style={{ background: 'var(--positive-tint)', border: '1px solid var(--positive-border)', color: 'var(--positive-strong)', padding: '5px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {showAdd ? 'Close' : '+ Add'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreateMember} className="glass-card" style={{ background: 'var(--hairline)' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '10px' }}>Add Family Profile</h4>

          <div className="form-group">
            <label className="form-label">Member Name</label>
            <input type="text" className="form-input" placeholder="e.g. Grandma Sunita" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Relative">Relative</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Limit (₹)</label>
              <input type="number" className="form-input" placeholder="0" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pick Avatar</label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {MEMBER_AVATARS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  aria-label={`Choose ${emoji} avatar`}
                  aria-pressed={avatar === emoji}
                  style={{
                    fontSize: '1.4rem',
                    padding: '6px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: avatar === emoji ? 'var(--positive-tint)' : 'var(--bg-card-hover)',
                    border: `2px solid ${avatar === emoji ? 'var(--positive)' : 'transparent'}`,
                    cursor: 'pointer'
                  }}
                >
                  <Emoji size="1.4rem">{emoji}</Emoji>
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 2px', cursor: 'pointer' }}>
            <input type="checkbox" checked={isEarnerField} onChange={(e) => setIsEarnerField(e.target.checked)} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: '600' }}>
              This person earns income for the household
            </span>
          </label>

          <button type="submit" className="btn-primary" style={{ padding: '10px', fontSize: '0.88rem', marginTop: '6px' }}>
            Save Family Profile
          </button>
        </form>
      )}

      {/* Family Member Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {members.filter(m => m.id !== 'all').map((m) => {
          const spent = transactions
            .filter(t => t.memberId === m.id && t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          const allowancePct = m.allowance > 0 ? Math.min(100, Math.round((spent / m.allowance) * 100)) : 0;

          return (
            <div key={m.id} className="glass-card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="member-avatar-wrapper" style={{ width: '46px', height: '46px', borderColor: m.color }}>
                    <Emoji size="24px">{m.avatar}</Emoji>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{m.name}</h4>
                      {m.isEarner && <span style={{ fontSize: '0.6rem', background: 'var(--accent-tint)', color: 'var(--accent-strong)', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>Earner</span>}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.role || (m.isEarner ? 'Primary Earner' : 'Spending Member')}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: m.color }}>
                    {formatRupees(spent)} spent
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    Limit: {formatRupees(m.allowance || 0)}
                  </div>
                </div>
              </div>

              {m.allowance > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${allowancePct}%`,
                        background: allowancePct >= 100 ? 'var(--danger)' : m.color
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginTop: '4px', color: 'var(--text-dim)' }}>
                    <span>Spent vs Monthly Limit</span>
                    <span>{allowancePct}%</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={() => handleDeleteMember(m)}
                  aria-label={`Remove ${m.name}`}
                  title="Remove member"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', fontSize: '0.68rem' }}
                >
                  <Trash2 size={12} color="var(--danger)" opacity={0.6} /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
