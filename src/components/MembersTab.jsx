import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatRupees } from '../utils/mockData';

export default function MembersTab({ members = [], transactions = [], onAddMember, onDeleteMember }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧒');
  const [role, setRole] = useState('Child');
  const [allowance, setAllowance] = useState('5000');

  const avatarOptions = ['👩‍💼', '👨‍💻', '👦', '👧', '👵', '👴', '🧒', '🐶'];
  const colorOptions = ['#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#f43f5e'];

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

  const dadMember = members.find(m => m.id === 'dad') || { name: 'Dad (Rajesh)', avatar: '👨‍💻' };

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

  // Calculate Dad's total earnings
  const dadTotalEarnings = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* SOLE HOUSEHOLD EARNER BANNER (DAD) */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <span>{dadMember.avatar}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800' }}>{dadMember.name}</h3>
              <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
                Primary Sole Earner
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Dad earns the household salary ({formatRupees(dadTotalEarnings)} credited)
            </div>
          </div>
        </div>
      </div>

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
          style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
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
                      {isDad && <span style={{ fontSize: '0.6rem', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>Earner</span>}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isDad ? 'Primary Earner & Head' : 'Spending Member'}</span>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                {isDad ? (
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                    The primary earner can't be removed
                  </span>
                ) : (
                  <button
                    onClick={() => handleDeleteMember(m)}
                    aria-label={`Remove ${m.name}`}
                    title="Remove member"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', fontSize: '0.68rem' }}
                  >
                    <Trash2 size={12} color="#f87171" opacity={0.6} /> Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
