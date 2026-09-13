import React, { useState } from 'react';
import { X } from 'lucide-react';
import { generateId, INCOME_SOURCES } from '../utils/mockData';
import Emoji from './Emoji';

export default function AddExpenseSheet({ categories, members, onClose, onSave, editingTx = null }) {
  const isEditing = Boolean(editingTx);
  const realMembers = members.filter(m => m.id !== 'all');
  const earners = realMembers.filter(m => m.isEarner);
  // Only when exactly one member is flagged as the earner is there an
  // unambiguous "who earned this" answer to pre-fill; zero or several
  // earners both fall back to letting the user pick, same as an expense.
  const singleEarner = earners.length === 1 ? earners[0] : null;
  const defaultSpenderId = (realMembers.find(m => !m.isEarner) || realMembers[0])?.id || '';

  // Editing starts from the record as saved; adding starts from the defaults.
  const [type, setType] = useState(editingTx?.type || 'expense');
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount ?? '') : '');
  const [category, setCategory] = useState(
    editingTx?.type === 'expense' ? (editingTx.category || categories[0]?.id || '') : (categories[0]?.id || '')
  );
  const [incomeSource, setIncomeSource] = useState(
    editingTx?.type === 'income' && INCOME_SOURCES.some((s) => s.id === editingTx.category)
      ? editingTx.category
      : INCOME_SOURCES[0].id
  );
  const [memberId, setMemberId] = useState(editingTx?.memberId || defaultSpenderId);
  const [title, setTitle] = useState(editingTx?.title || '');
  const [showMore, setShowMore] = useState(Boolean(editingTx?.notes));
  const [paymentMethod, setPaymentMethod] = useState(editingTx?.paymentMethod || 'UPI');
  const [notes, setNotes] = useState(editingTx?.notes || '');
  const [amountError, setAmountError] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setMemberId(singleEarner ? singleEarner.id : defaultSpenderId);
    } else {
      setMemberId(defaultSpenderId);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Enter an amount greater than ₹0');
      return;
    }
    setAmountError('');

    const catObj = categories.find(c => c.id === category);
    const sourceObj = INCOME_SOURCES.find(s => s.id === incomeSource);
    const defaultTitle = type === 'income'
      ? (sourceObj ? sourceObj.name : 'Income')
      : (catObj ? catObj.name : 'Expense');

    onSave({
      // Editing keeps the record's identity and its original date; only what
      // the form covers is replaced.
      id: editingTx?.id || generateId('tx'),
      date: editingTx?.date || new Date().toISOString().split('T')[0],
      type,
      title: title.trim() || defaultTitle,
      amount: parsedAmount,
      category: type === 'income' ? incomeSource : category,
      memberId,
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
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card-hover)', padding: '3px', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                border: 'none',
                background: type === 'expense' ? 'var(--accent-strong)' : 'transparent',
                color: type === 'expense' ? 'var(--text-on-accent-strong)' : 'var(--text-muted)',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <Emoji size="13px">💸</Emoji> Add Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                border: 'none',
                background: type === 'income' ? 'var(--positive)' : 'transparent',
                color: type === 'income' ? 'var(--text-on-accent-strong)' : 'var(--text-muted)',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <Emoji size="13px">💰</Emoji> Income
            </button>
          </div>

          <button onClick={onClose} aria-label="Close" style={{ background: 'var(--bg-card-hover)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* FIELD 1: AMOUNT (₹) */}
          <div className="form-group" style={{ marginBottom: '4px' }}>
            <label className="form-label" style={{ fontSize: '0.72rem' }}>1. AMOUNT (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--positive)' }}>
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '1.4rem', fontWeight: '800', height: '52px', borderColor: amountError ? 'var(--danger)' : undefined }}
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); if (amountError) setAmountError(''); }}
                required
                autoFocus
              />
            </div>
            {amountError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.72rem', fontWeight: '600', marginTop: '4px' }}>
                {amountError}
              </div>
            )}
          </div>

          {/* FIELD 2: WHO SPENT OR EARNED */}
          <div className="form-group" style={{ marginBottom: '4px' }}>
            <label className="form-label" style={{ fontSize: '0.72rem' }}>
              {type === 'income' ? '2. EARNED BY' : '2. WHO SPENT THIS MONEY?'}
            </label>

            {type === 'income' && singleEarner ? (
              <div style={{ background: 'var(--positive-tint)', border: '1px solid var(--positive-border)', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Emoji size="1.3rem">{singleEarner.avatar}</Emoji>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--positive)' }}>{singleEarner.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Logged as household income</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                {realMembers.map((m) => {
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
                        background: isSelected ? 'var(--positive-tint)' : 'var(--hairline)',
                        border: `1px solid ${isSelected ? 'var(--positive)' : 'var(--bg-card-border)'}`,
                        color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Emoji size="15px">{m.avatar || '👤'}</Emoji>
                      <span>{(m.name || 'Member').split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FIELD 3a: INCOME SOURCE. Income used to be filed under one
              undifferentiated 'income' bucket, so a salary and a rent receipt
              were indistinguishable once saved. */}
          {type === 'income' && (
            <div className="form-group" style={{ marginBottom: '4px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>3. INCOME SOURCE</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {INCOME_SOURCES.map((s) => {
                  const isSelected = incomeSource === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setIncomeSource(s.id)}
                      aria-pressed={isSelected}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px 6px', borderRadius: '12px',
                        background: isSelected ? 'var(--positive-tint)' : 'var(--hairline)',
                        border: `1px solid ${isSelected ? 'var(--positive)' : 'var(--bg-card-border)'}`,
                        color: isSelected ? 'var(--positive-strong)' : 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '0.75rem',
                        fontWeight: isSelected ? '700' : '500'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FIELD 3: CATEGORY GRID (FOR EXPENSES) */}
          {type === 'expense' && (
            <div className="form-group" style={{ marginBottom: '4px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>3. CATEGORY</label>
              {/* Every category, not the first six: the tail of the default
                  list was already unreachable here, and a category added in
                  Budgets could never be spent against. The sheet scrolls. */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {categories.map((c) => {
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
                        background: isSelected ? 'var(--positive-tint)' : 'var(--hairline)',
                        border: `1px solid ${isSelected ? 'var(--positive)' : 'var(--bg-card-border)'}`,
                        color: isSelected ? 'var(--positive-strong)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        textAlign: 'center',
                        gap: '2px'
                      }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color || 'var(--text-muted)' }} />
                      <span style={{ fontWeight: isSelected ? '700' : '500' }}>{(c.name || 'Category').split(' ')[0]}</span>
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
                placeholder={type === 'income' ? 'e.g. July Salary / Bonus' : 'Item Title (e.g. Groceries / School Books)'}
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
            {isEditing
              ? 'Save changes (₹)'
              : type === 'income' ? 'Log Income (₹)' : 'Add Expense Entry (₹)'}
          </button>
        </form>
      </div>
    </div>
  );
}
