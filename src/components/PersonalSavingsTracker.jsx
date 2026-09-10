import React, { useState } from 'react';
import { ArrowLeft, PiggyBank, Target, Trash2, Pencil } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupees, generateId } from '../utils/mockData';
import Emoji from './Emoji';

export default function PersonalSavingsTracker({ personalState, setPersonalState, onBack }) {
  const { salary = 0, goals = [], transactions = [] } = personalState || {};

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState('Investment');

  // Personal Tx Form State
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('expense');

  const totalPersonalIncome = (transactions || [])
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || salary;

  const totalPersonalExpense = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPersonalSavings = totalPersonalIncome - totalPersonalExpense;
  const personalSavingsRate = totalPersonalIncome > 0 ? Math.round((totalPersonalSavings / totalPersonalIncome) * 100) : 0;
  const totalSavedInGoals = (goals || []).reduce((sum, g) => sum + (g.current || 0), 0);

  // Add Deposit to Goal
  const handleDepositToGoal = (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!selectedGoalId || isNaN(amount) || amount <= 0) return;

    setPersonalState(prev => ({
      ...prev,
      goals: (prev.goals || []).map(g => g.id === selectedGoalId ? { ...g, current: (g.current || 0) + amount } : g)
    }));

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    setSelectedGoalId(null);
    setDepositAmount('');
  };

  // Add or Update a Goal
  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!goalTitle || !targetAmount) return;

    const icon = category === 'Emergency' ? '🛡️' : category === 'Investment' ? '📈' : '🌴';

    if (editingGoalId) {
      setPersonalState(prev => ({
        ...prev,
        goals: (prev.goals || []).map(g => g.id === editingGoalId
          ? { ...g, title: goalTitle, target: parseFloat(targetAmount), current: parseFloat(currentAmount) || 0, category, icon }
          : g)
      }));
    } else {
      const newGoal = {
        id: generateId('g'),
        title: goalTitle,
        target: parseFloat(targetAmount),
        current: parseFloat(currentAmount) || 0,
        category,
        icon
      };

      setPersonalState(prev => ({
        ...prev,
        goals: [...(prev.goals || []), newGoal]
      }));
    }

    resetGoalForm();
  };

  const resetGoalForm = () => {
    setGoalTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setCategory('Investment');
    setEditingGoalId(null);
    setShowAddGoalModal(false);
  };

  const handleStartEditGoal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    setTargetAmount(String(goal.target));
    setCurrentAmount(String(goal.current || 0));
    setCategory(goal.category);
    setShowAddGoalModal(true);
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Delete this savings goal?')) {
      setPersonalState(prev => ({
        ...prev,
        goals: (prev.goals || []).filter(g => g.id !== goalId)
      }));
    }
  };

  // Add Personal Tx
  const handleAddPersonalTx = (e) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    const newTx = {
      id: generateId('ptx'),
      title: txTitle,
      amount: parseFloat(txAmount),
      type: txType,
      date: new Date().toISOString().split('T')[0]
    };

    setPersonalState(prev => ({
      ...prev,
      transactions: [newTx, ...(prev.transactions || [])]
    }));

    setTxTitle('');
    setTxAmount('');
    setShowAddTxModal(false);
  };

  // Delete Personal Tx
  const handleDeleteTx = (id) => {
    setPersonalState(prev => ({
      ...prev,
      transactions: (prev.transactions || []).filter(t => t.id !== id)
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Back to main dashboard */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          font: '700 12px Manrope',
          cursor: 'pointer',
          padding: 0,
          alignSelf: 'flex-start'
        }}
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      {/* PERSONAL HERO SAVINGS CARD */}
      <div
        className="glass-card"
        style={{
          background: 'var(--positive-tint)',
          border: '1px solid var(--positive-border)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PiggyBank size={18} color="var(--positive)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
              My Personal Savings Tracker
            </h3>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'var(--positive-tint)',
              border: '1px solid var(--positive-border)',
              color: 'var(--positive)'
            }}
          >
            {personalSavingsRate}% Savings Rate
          </span>
        </div>

        <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.8px', marginBottom: '12px' }}>
          {formatRupees(totalPersonalSavings)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Salary / Income</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--positive)', marginTop: '2px' }}>
              {formatRupees(totalPersonalIncome)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Personal Expenses</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--danger)', marginTop: '2px' }}>
              {formatRupees(totalPersonalExpense)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Saved in Goals</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--violet)', marginTop: '2px' }}>
              {formatRupees(totalSavedInGoals)}
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL SAVINGS GOALS & TARGETS */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--positive)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>My Savings Goals & Targets</h3>
          </div>
          <button
            onClick={() => { setEditingGoalId(null); setGoalTitle(''); setTargetAmount(''); setCurrentAmount(''); setCategory('Investment'); setShowAddGoalModal(true); }}
            style={{
              background: 'var(--positive-tint)',
              border: '1px solid var(--positive-border)',
              color: 'var(--positive)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            + New Goal
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.length === 0 && (
            <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <p style={{ marginBottom: '8px' }}><Emoji size="1.8rem">🎯</Emoji></p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>No savings goals yet</p>
              <p style={{ fontSize: '0.72rem' }}>Tap "+ New Goal" to set your first target.</p>
            </div>
          )}
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round(((goal.current || 0) / (goal.target || 1)) * 100));

            return (
              <div key={goal.id} style={{ background: 'var(--hairline)', padding: '12px', borderRadius: '14px', border: '1px solid var(--bg-card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Emoji size="1.2rem">{goal.icon || '🎯'}</Emoji>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{goal.title || 'Savings Goal'}</span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{goal.category}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--positive)' }}>
                      {formatRupees(goal.current)}
                    </span>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      Target: {formatRupees(goal.target)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--positive)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{pct}% achieved</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setSelectedGoalId(goal.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--violet)', fontWeight: '700', cursor: 'pointer' }}
                    >
                      + Quick Deposit
                    </button>
                    <button
                      onClick={() => handleStartEditGoal(goal)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      title="Edit goal"
                      aria-label={`Edit ${goal.title || 'goal'}`}
                    >
                      <Pencil size={12} opacity={0.6} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      title="Delete goal"
                      aria-label={`Delete ${goal.title || 'goal'}`}
                    >
                      <Trash2 size={12} color="var(--danger)" opacity={0.6} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK DEPOSIT TO GOAL MODAL */}
      {selectedGoalId && (
        <div className="sheet-overlay" onClick={() => setSelectedGoalId(null)}>
          <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
              Add Deposit to Savings Goal
            </h3>
            <form onSubmit={handleDepositToGoal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Deposit Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary">
                Confirm Deposit (₹)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PERSONAL TRANSACTION LOG */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Personal Income & Expense History</h3>
          <button
            onClick={() => setShowAddTxModal(true)}
            style={{ background: 'var(--positive-tint)', border: '1px solid var(--positive-border)', color: 'var(--positive)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
          >
            + Add Personal Item
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transactions.length === 0 && (
            <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <p style={{ marginBottom: '8px' }}><Emoji size="1.8rem">🧾</Emoji></p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>No personal transactions yet</p>
              <p style={{ fontSize: '0.72rem' }}>Tap "+ Add Personal Item" to log your first one.</p>
            </div>
          )}
          {transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{tx.title}</span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{tx.date}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: tx.type === 'income' ? 'var(--positive)' : 'var(--danger)' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupees(tx.amount)}
                </span>
                <button
                  onClick={() => handleDeleteTx(tx.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                >
                  <Trash2 size={13} color="var(--danger)" opacity={0.6} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE NEW GOAL MODAL */}
      {showAddGoalModal && (
        <div className="sheet-overlay" onClick={resetGoalForm}>
          <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
              {editingGoalId ? 'Edit Personal Savings Goal' : 'Create Personal Savings Goal'}
            </h3>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Emergency Fund / Tech Gear"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Target (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Saved (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Investment">📈 Investment / SIP</option>
                  <option value="Emergency">🛡️ Emergency Fund</option>
                  <option value="Vacation">🌴 Vacation / Dream Goal</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                {editingGoalId ? 'Update Savings Goal' : 'Save Savings Goal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PERSONAL TX MODAL */}
      {showAddTxModal && (
        <div className="sheet-overlay" onClick={() => setShowAddTxModal(false)}>
          <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
              Add Personal Income or Expense
            </h3>

            <form onSubmit={handleAddPersonalTx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-card-hover)', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  style={{ padding: '6px', borderRadius: '8px', border: 'none', background: txType === 'expense' ? 'var(--accent-strong)' : 'transparent', color: txType === 'expense' ? 'var(--text-on-accent-strong)' : 'var(--text-muted)', fontWeight: '700' }}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  style={{ padding: '6px', borderRadius: '8px', border: 'none', background: txType === 'income' ? 'var(--positive)' : 'transparent', color: txType === 'income' ? 'var(--text-on-accent-strong)' : 'var(--text-muted)', fontWeight: '700' }}
                >
                  Income
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Title / Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bonus Credit / Personal Gadget"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Save Personal Item (₹)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
