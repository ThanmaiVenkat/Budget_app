import React, { useState } from 'react';
import { formatRupees } from '../utils/mockData';

export default function MembersTab({ members = [], transactions = [], onAddMember }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧒');
  const [role, setRole] = useState('Child');
  const [allowance, setAllowance] = useState('5000');

  const avatarOptions = ['👩‍💼', '👨‍💻', '👦', '👧', '👵', '👴', '🧒', '🐶'];
  // Drawn from the app's own token palette (index.css :root) so new members
  // never clash with the orange brand accent.
  const colorOptions = ['#f26a1b', '#e0785a', '#d99a3a', '#5ec39d', '#3e9e7e', '#4a8f8a', '#b85c7a'];

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!name) return;

    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    onAddMember({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      avatar,
      color: randomColor,
      role,
      allowance: parseFloat(allowance) || 0,
      isEarner: false
    });

    setName('');
    setShowAdd(false);
  };

  // Calculate Dad's total earnings
  const dadTotalEarnings = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '700' }}>Family Members & Expenses</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Members add expenses whenever they spend
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{ background: 'rgba(242,106,27,0.15)', border: '1px solid rgba(242,106,27,0.3)', color: 'var(--orange-primary)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
        >
          {showAdd ? 'Close' : '+ Add Member'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreateMember} className="glass-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
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
              <input type="number" className="form-input" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pick Avatar</label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
              {avatarOptions.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  style={{
                    fontSize: '1.4rem',
                    padding: '6px',
                    borderRadius: '50%',
                    background: avatar === emoji ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${avatar === emoji ? '#34d399' : 'transparent'}`,
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

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
          const isDad = m.id === 'dad';

          return (
            <div key={m.id} className="glass-card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="member-avatar-wrapper" style={{ width: '46px', height: '46px', borderColor: m.color }}>
                    <span>{m.avatar}</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>{m.name}</h4>
                      {isDad && <span style={{ fontSize: '0.6rem', background: 'rgba(242,106,27,0.18)', color: 'var(--orange-primary)', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>Sole Earner</span>}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {isDad ? `Earns ${formatRupees(dadTotalEarnings)} · household salary` : 'Spending Member'}
                    </span>
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
                        background: allowancePct >= 100 ? '#f87171' : m.color
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginTop: '4px', color: 'var(--text-dim)' }}>
                    <span>Spent vs Monthly Limit</span>
                    <span>{allowancePct}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
