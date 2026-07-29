import React, { useState } from 'react';
import { CheckCircle2, Circle, Calculator, Users } from 'lucide-react';
import { formatRupees, getBillBadgeStatus } from '../utils/mockData';

export default function BillRemindersTab({ bills, members, onToggleBillPaid, onAddBill }) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [daysUntilDue, setDaysUntilDue] = useState('5');
  const [payer] = useState(members[1]?.id || 'mom');

  // Bill Split Calculator
  const [splitAmount, setSplitAmount] = useState('2400');
  const [selectedPeopleCount, setSelectedPeopleCount] = useState(4);

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    const days = parseInt(daysUntilDue) || 5;

    onAddBill({
      id: 'b-' + Date.now(),
      title,
      amount: parseFloat(amount),
      daysUntilDue: days,
      dueDate: `In ${days} days`,
      paid: false,
      payer
    });

    setTitle('');
    setAmount('');
    setShowAdd(false);
  };

  const perPerson = parseFloat(splitAmount) > 0 && selectedPeopleCount > 0 
    ? (parseFloat(splitAmount) / selectedPeopleCount)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* RECURRING BILL REMINDERS CARD */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Recurring Household Bills</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Color-coded by due date urgency</span>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
          >
            {showAdd ? 'Cancel' : '+ New Bill'}
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleCreateBill} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '14px', marginBottom: '12px' }}>
            <div className="form-group">
              <label className="form-label">Bill Name</label>
              <input type="text" className="form-input" placeholder="e.g. Airtel Wifi" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" className="form-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Due in (Days)</label>
                <input type="number" className="form-input" placeholder="e.g. 5" value={daysUntilDue} onChange={(e) => setDaysUntilDue(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '8px', fontSize: '0.85rem' }}>
              Save Bill Reminder
            </button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {bills.map((b) => {
            const memberObj = members.find(m => m.id === b.payer) || { avatar: '👤', name: 'Family' };
            const badge = getBillBadgeStatus(b.daysUntilDue, b.paid);

            return (
              <div
                key={b.id}
                onClick={() => onToggleBillPaid(b.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: b.paid ? 'rgba(52, 211, 153, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${b.paid ? 'rgba(52, 211, 153, 0.2)' : 'var(--bg-card-border)'}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {b.paid ? (
                    <CheckCircle2 size={20} color="#34d399" />
                  ) : (
                    <Circle size={20} color="var(--text-muted)" />
                  )}
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', textDecoration: b.paid ? 'line-through' : 'none', color: b.paid ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {b.title}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      Paid by {memberObj.avatar} {memberObj.name}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: b.paid ? 'var(--text-muted)' : 'var(--text-main)' }}>
                    {formatRupees(b.amount)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.color
                    }}
                  >
                    {badge.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILL SPLIT CALCULATOR */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Calculator size={18} color="#818cf8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Shared Bill Split Calculator (₹)</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Total Expense (₹)</label>
              <input
                type="number"
                className="form-input"
                value={splitAmount}
                onChange={(e) => setSplitAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Split Among (People)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={selectedPeopleCount}
                onChange={(e) => setSelectedPeopleCount(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '12px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Each Person Pays</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#818cf8' }}>
                {formatRupees(perPerson)}
              </div>
            </div>
            <Users size={24} color="#818cf8" opacity={0.7} />
          </div>
        </div>
      </div>

    </div>
  );
}
