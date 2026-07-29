import React, { useState } from 'react';
import { PiggyBank, Target, Sparkles, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupees } from '../utils/mockData';

export default function PersonalSavingsTracker({ personalState, setPersonalState }) {
  const { salary = 145000, goals = [], transactions = [] } = personalState || {};

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
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

  // SIP Calculator State (String representation for glitch-free typing)
  const [sipAmountStr, setSipAmountStr] = useState('15000');
  const [sipReturnStr, setSipReturnStr] = useState('12');
  const [sipYearsStr, setSipYearsStr] = useState('5');

  const totalPersonalIncome = (transactions || [])
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || salary;

  const totalPersonalExpense = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPersonalSavings = totalPersonalIncome - totalPersonalExpense;
  const personalSavingsRate = totalPersonalIncome > 0 ? Math.round((totalPersonalSavings / totalPersonalIncome) * 100) : 0;
  const totalSavedInGoals = (goals || []).reduce((sum, g) => sum + (g.current || 0), 0);

  // SAFE SIP MATH CALCULATION (Glitch-free, handles 0% return & empty inputs)
  const numSipAmount = parseFloat(sipAmountStr) > 0 ? parseFloat(sipAmountStr) : 0;
  const numSipReturn = parseFloat(sipReturnStr) >= 0 ? parseFloat(sipReturnStr) : 0;
  const numSipYears = parseInt(sipYearsStr) > 0 ? parseInt(sipYearsStr) : 1;

  const monthlyRate = (numSipReturn / 100) / 12;
  const totalMonths = numSipYears * 12;

  let rawProjectedWealth = 0;
  if (monthlyRate === 0) {
    rawProjectedWealth = numSipAmount * totalMonths;
  } else {
    rawProjectedWealth = Math.round(
      numSipAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate))
    );
  }

  const projectedWealth = isNaN(rawProjectedWealth) || !isFinite(rawProjectedWealth) ? 0 : rawProjectedWealth;
  const totalInvested = numSipAmount * totalMonths;
  const estimatedReturns = Math.max(0, projectedWealth - totalInvested);
  const returnsPercent = totalInvested > 0 ? Math.round((estimatedReturns / totalInvested) * 100) : 0;

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

  // Add New Goal
  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!goalTitle || !targetAmount) return;

    const newGoal = {
      id: 'g-' + Date.now(),
      title: goalTitle,
      target: parseFloat(targetAmount),
      current: parseFloat(currentAmount) || 0,
      category,
      icon: category === 'Emergency' ? '🛡️' : category === 'Investment' ? '📈' : '🌴'
    };

    setPersonalState(prev => ({
      ...prev,
      goals: [...(prev.goals || []), newGoal]
    }));

    setGoalTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setShowAddGoalModal(false);
  };

  // Add Personal Tx
  const handleAddPersonalTx = (e) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    const newTx = {
      id: 'ptx-' + Date.now(),
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
      
      {/* PERSONAL HERO SAVINGS CARD */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
          border: '1px solid rgba(52, 211, 153, 0.35)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PiggyBank size={18} color="#34d399" />
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
              background: 'rgba(52, 211, 153, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#34d399'
            }}
          >
            {personalSavingsRate}% Savings Rate
          </span>
        </div>

        <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.8px', marginBottom: '12px' }}>
          {formatRupees(totalPersonalSavings)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Salary / Income</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399', marginTop: '2px' }}>
              {formatRupees(totalPersonalIncome)}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Personal Expenses</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f87171', marginTop: '2px' }}>
              {formatRupees(totalPersonalExpense)}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Saved in Goals</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#818cf8', marginTop: '2px' }}>
              {formatRupees(totalSavedInGoals)}
            </div>
          </div>
        </div>
      </div>

      {/* GLITCH-FREE SIP MUTUAL FUND WEALTH PROJECTION CALCULATOR */}
      <div className="glass-card" style={{ background: 'rgba(18, 18, 28, 0.95)', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#818cf8" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>SIP Mutual Fund Wealth Projection</h3>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#818cf8', background: 'rgba(129, 140, 248, 0.15)', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
            +{returnsPercent}% Growth
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Inputs Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.68rem' }}>Monthly SIP (₹)</label>
              <input
                type="number"
                className="form-input"
                style={{ padding: '8px', fontSize: '0.88rem', fontWeight: '700' }}
                value={sipAmountStr}
                onChange={(e) => setSipAmountStr(e.target.value)}
                placeholder="15000"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.68rem' }}>Return (% p.a.)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                style={{ padding: '8px', fontSize: '0.88rem', fontWeight: '700' }}
                value={sipReturnStr}
                onChange={(e) => setSipReturnStr(e.target.value)}
                placeholder="12"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.68rem' }}>Years</label>
              <input
                type="number"
                className="form-input"
                style={{ padding: '8px', fontSize: '0.88rem', fontWeight: '700' }}
                value={sipYearsStr}
                onChange={(e) => setSipYearsStr(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          {/* Quick Presets for glitch-free 1-tap testing */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SIP Presets:</span>
            {['5000', '10000', '15000', '25000', '50000'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setSipAmountStr(val)}
                style={{
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--bg-card-border)',
                  background: sipAmountStr === val ? 'rgba(129, 140, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                  color: sipAmountStr === val ? '#818cf8' : 'var(--text-muted)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ₹{parseInt(val)/1000}k
              </button>
            ))}
          </div>

          {/* Projection Results Box */}
          <div style={{ background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estimated Future Wealth ({numSipYears} Years)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#818cf8', letterSpacing: '-0.5px' }}>
                  {formatRupees(projectedWealth)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: '700' }}>
                  +{formatRupees(estimatedReturns)}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Estimated Profit</div>
              </div>
            </div>

            {/* Visual Bar Breakdown: Invested vs Wealth Gain */}
            <div className="progress-bar-bg" style={{ height: '10px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${projectedWealth > 0 ? Math.round((totalInvested / projectedWealth) * 100) : 100}%`,
                  background: '#3b82f6'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} />
                Invested Capital: {formatRupees(totalInvested)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#34d399' }} />
                Wealth Gain: {formatRupees(estimatedReturns)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL SAVINGS GOALS & TARGETS */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#34d399" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>My Savings Goals & Targets</h3>
          </div>
          <button
            onClick={() => setShowAddGoalModal(true)}
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
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
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round(((goal.current || 0) / (goal.target || 1)) * 100));

            return (
              <div key={goal.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '14px', border: '1px solid var(--bg-card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{goal.icon}</span>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{goal.title}</span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{goal.category}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#34d399' }}>
                      {formatRupees(goal.current)}
                    </span>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      Target: {formatRupees(goal.target)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #34d399, #059669)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{pct}% achieved</span>
                  <button
                    onClick={() => setSelectedGoalId(goal.id)}
                    style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + Quick Deposit
                  </button>
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
            style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
          >
            + Add Personal Item
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{tx.title}</span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{tx.date}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: tx.type === 'income' ? '#34d399' : '#f87171' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupees(tx.amount)}
                </span>
                <button
                  onClick={() => handleDeleteTx(tx.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                >
                  <Trash2 size={13} color="#f87171" opacity={0.6} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE NEW GOAL MODAL */}
      {showAddGoalModal && (
        <div className="sheet-overlay" onClick={() => setShowAddGoalModal(false)}>
          <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
              Create Personal Savings Goal
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
                Save Savings Goal
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  style={{ padding: '6px', borderRadius: '8px', border: 'none', background: txType === 'expense' ? '#f87171' : 'transparent', color: '#fff', fontWeight: '700' }}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  style={{ padding: '6px', borderRadius: '8px', border: 'none', background: txType === 'income' ? '#34d399' : 'transparent', color: txType === 'income' ? '#040407' : '#fff', fontWeight: '700' }}
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
