import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { formatRupees } from '../utils/mockData';

export default function AddExpenseSheet({ categories, members, onClose, onSave }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'groceries');
  // For expense, default to Mom or Mom/Dad. For Income, auto-set to Dad (Rajesh)
  const [memberId, setMemberId] = useState('mom');
  const [title, setTitle] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  const dadMember = members.find(m => m.id === 'dad') || { id: 'dad', name: 'Dad (Rajesh)', avatar: '👨‍💻' };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setMemberId('dad'); // Dad is the sole earner for household income
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const catObj = categories.find(c => c.id === category);
    const defaultTitle = type === 'income' ? 'Dad Salary / Earnings' : (catObj ? catObj.name : 'Expense');

    onSave({
      id: 'tx-' + Date.now(),
      type,
      title: title.trim() || defaultTitle,
      amount: parsedAmount,
      category: type === 'income' ? 'income' : category,
      memberId: type === 'income' ? 'dad' : memberId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes
    });

    onClose();
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                border: 'none',
                background: type === 'expense' ? '#f87171' : 'transparent',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              💸 Add Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                border: 'none',
                background: type === 'income' ? '#34d399' : 'transparent',
                color: type === 'income' ? '#040407' : '#fff',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              💰 Dad's Income
            </button>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* FIELD 1: AMOUNT (₹) */}
          <div className="form-group" style={{ marginBottom: '4px' }}>
            <label className="form-label" style={{ fontSize: '0.72rem' }}>1. AMOUNT (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem', fontWeight: '800', color: '#34d399' }}>
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '1.4rem', fontWeight: '800', height: '52px' }}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* FIELD 2: WHO SPENT OR EARNED */}
          <div className="form-group" style={{ marginBottom: '4px' }}>
            <label className="form-label" style={{ fontSize: '0.72rem' }}>
              {type === 'income' ? '2. EARNER (SOLE HOUSEHOLD EARNER)' : '2. WHO SPENT THIS MONEY?'}
            </label>

            {type === 'income' ? (
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>{dadMember.avatar}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399' }}>{dadMember.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Dad earns the primary household income</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                {members.filter(m => m.id !== 'all').map((m) => {
                  const isSelected = memberId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMemberId(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: isSelected ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isSelected ? '#34d399' : 'var(--bg-card-border)'}`,
                        color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>{m.avatar}</span>
                      <span>{m.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FIELD 3: CATEGORY GRID (FOR EXPENSES) */}
          {type === 'expense' && (
            <div className="form-group" style={{ marginBottom: '4px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>3. CATEGORY</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {categories.slice(0, 6).map((c) => {
                  const isSelected = category === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 4px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isSelected ? '#34d399' : 'var(--bg-card-border)'}`,
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        textAlign: 'center',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                      <span style={{ fontWeight: isSelected ? '700' : '500' }}>{c.name.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OPTIONAL EXPANDABLE DETAILS */}
          {!showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.72rem', textAlign: 'center', cursor: 'pointer' }}
            >
              + Add item details or payment method (optional)
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                placeholder={type === 'income' ? 'e.g. Dad July Salary / Bonus' : 'Item Title (e.g. Groceries / School Books)'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select
                  className="form-select"
                  style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="Transfer">🏦 Net Banking</option>
                </select>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                  placeholder="Notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '6px' }}>
            {type === 'income' ? 'Log Dad Salary Credit (₹)' : 'Add Expense Entry (₹)'}
          </button>
        </form>
      </div>
    </div>
  );
}
