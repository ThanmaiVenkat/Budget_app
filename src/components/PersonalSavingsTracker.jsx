import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft, PiggyBank, Target, Trash2, Pencil, Calendar,
  ChevronLeft, ChevronRight, Camera, Repeat, TrendingUp,
  FileText, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupees, generateId, getPreviousMonthKey } from '../utils/mockData';
import { compressImageFile } from '../utils/imageCompressor';
import Emoji from './Emoji';
import ReceiptModal from './ReceiptModal';

export default function PersonalSavingsTracker({
  personalState,
  setPersonalState,
  selectedMonth: propSelectedMonth,
  setSelectedMonth: propSetSelectedMonth,
  onBack
}) {
  const { salary = 0, goals = [], transactions = [] } = personalState || {};

  const currentMonthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [localMonth, setLocalMonth] = useState(currentMonthKey);
  const selectedMonth = propSelectedMonth !== undefined ? propSelectedMonth : localMonth;
  const setSelectedMonth = propSetSelectedMonth || setLocalMonth;

  // Modals state
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showEditSalaryModal, setShowEditSalaryModal] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(salary || ''));
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [activeReceiptTx, setActiveReceiptTx] = useState(null);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState('Investment');
  const [sipEnabled, setSipEnabled] = useState(false);
  const [sipAmount, setSipAmount] = useState('');
  const [sipDay, setSipDay] = useState('5');

  // Personal Tx Form State
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('expense');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txReceipt, setTxReceipt] = useState(null);
  const [isCompressingTx, setIsCompressingTx] = useState(false);
  const txFileInputRef = useRef(null);

  const isAllTime = selectedMonth === 'all';
  const isCurrentMonth = selectedMonth === currentMonthKey;

  // Month navigation & labels
  const selectedMonthLabel = useMemo(() => {
    if (isAllTime) return 'All Time (Lifetime)';
    return new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [isAllTime, selectedMonth]);

  // Build selectable months list (last 6 months + all months with transactions)
  const availableMonths = useMemo(() => {
    const keys = new Set();
    const now = new Date();
    for (let i = 0; i <= 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    (transactions || []).forEach((t) => {
      if (t.date && t.date.length >= 7) keys.add(t.date.slice(0, 7));
    });
    return Array.from(keys)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((key) => ({
        value: key,
        label: new Date(key + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
      }));
  }, [transactions]);

  // Active month transactions
  const currentMonthTransactions = useMemo(() => {
    if (isAllTime) return transactions || [];
    return (transactions || []).filter(t => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, isAllTime, selectedMonth]);

  // Month stats: Starts at 0 every fresh month!
  const totalPersonalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [currentMonthTransactions]);

  const totalPersonalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [currentMonthTransactions]);

  const totalPersonalSavings = totalPersonalIncome - totalPersonalExpense;
  const personalSavingsRate = totalPersonalIncome > 0
    ? Math.max(0, Math.round((totalPersonalSavings / totalPersonalIncome) * 100))
    : 0;
  const totalSavedInGoals = (goals || []).reduce((sum, g) => sum + (g.current || 0), 0);

  // Last Month Data (Saved Record)
  const lastMonthKey = useMemo(() => {
    const base = isAllTime ? currentMonthKey : selectedMonth;
    return getPreviousMonthKey(base);
  }, [isAllTime, currentMonthKey, selectedMonth]);

  const lastMonthLabel = useMemo(() => {
    if (!lastMonthKey) return '';
    return new Date(lastMonthKey + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [lastMonthKey]);

  const lastMonthTransactions = useMemo(() => {
    if (!lastMonthKey) return [];
    return (transactions || []).filter(t => t.date && t.date.startsWith(lastMonthKey));
  }, [transactions, lastMonthKey]);

  const lastMonthIncome = useMemo(() => {
    return lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [lastMonthTransactions]);

  const lastMonthExpense = useMemo(() => {
    return lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [lastMonthTransactions]);

  const lastMonthSavings = lastMonthIncome - lastMonthExpense;
  const lastMonthSavingsRate = lastMonthIncome > 0
    ? Math.max(0, Math.round((lastMonthSavings / lastMonthIncome) * 100))
    : 0;

  // Monthly History Archive across all recorded months
  const monthlyHistory = useMemo(() => {
    const map = {};
    (transactions || []).forEach(t => {
      const m = t.date && t.date.length >= 7 ? t.date.slice(0, 7) : null;
      if (!m) return;
      if (!map[m]) {
        map[m] = { monthKey: m, income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') map[m].income += (t.amount || 0);
      else if (t.type === 'expense') map[m].expense += (t.amount || 0);
      map[m].count += 1;
    });

    return Object.values(map)
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .map(item => {
        const net = item.income - item.expense;
        const rate = item.income > 0 ? Math.max(0, Math.round((net / item.income) * 100)) : 0;
        const label = new Date(item.monthKey + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
        return { ...item, net, rate, label };
      });
  }, [transactions]);

  // Average Monthly Savings Velocity for Goal Forecasting
  const avgMonthlyVelocity = useMemo(() => {
    const positiveMonths = monthlyHistory.filter(m => m.net > 0);
    if (positiveMonths.length > 0) {
      const sum = positiveMonths.reduce((s, m) => s + m.net, 0);
      return Math.round(sum / positiveMonths.length);
    }
    if (totalPersonalSavings > 0) return totalPersonalSavings;
    if (salary > 0) return Math.round(salary * 0.2); // fallback estimate
    return 0;
  }, [monthlyHistory, totalPersonalSavings, salary]);

  // Goal Forecasting Calculator
  const getGoalForecast = (goal) => {
    const current = goal.current || 0;
    const target = goal.target || 0;
    const remaining = Math.max(0, target - current);

    if (remaining <= 0) {
      return { achieved: true, text: 'Goal achieved! 🎉' };
    }

    // If goal has its own SIP, use that pace; otherwise use average savings velocity
    const velocity = (goal.sipEnabled && goal.sipAmount > 0)
      ? goal.sipAmount
      : avgMonthlyVelocity;

    if (!velocity || velocity <= 0) {
      return {
        achieved: false,
        velocity: 0,
        text: 'Save this month or set an SIP to project completion date'
      };
    }

    const months = Math.ceil(remaining / velocity);
    const estDate = new Date();
    estDate.setMonth(estDate.getMonth() + months);
    const estLabel = estDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    return {
      achieved: false,
      velocity,
      months,
      estLabel,
      text: `At pace of ${formatRupees(velocity)}/mo, reaches target in ~${months} mo (${estLabel})`
    };
  };

  // Pending SIP check for current month
  const todayDay = new Date().getDate();
  const pendingSipGoals = useMemo(() => {
    return (goals || []).filter(g =>
      g.sipEnabled &&
      g.sipAmount > 0 &&
      g.lastSipCreditedMonth !== currentMonthKey &&
      todayDay >= (g.sipDay || 1)
    );
  }, [goals, currentMonthKey, todayDay]);

  // Execute Monthly SIP for a goal
  const handleExecuteSip = (goal) => {
    const amount = goal.sipAmount;
    if (!amount || amount <= 0) return;

    const newTx = {
      id: generateId('ptx'),
      title: `Monthly SIP: ${goal.title}`,
      amount,
      type: 'expense',
      date: `${currentMonthKey}-${String(goal.sipDay || 5).padStart(2, '0')}`
    };

    setPersonalState(prev => ({
      ...prev,
      goals: (prev.goals || []).map(g =>
        g.id === goal.id
          ? {
              ...g,
              current: (g.current || 0) + amount,
              lastSipCreditedMonth: currentMonthKey
            }
          : g
      ),
      transactions: [newTx, ...(prev.transactions || [])]
    }));

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
  };

  // Stepper handlers
  const handlePrevMonth = () => {
    if (isAllTime) {
      setSelectedMonth(currentMonthKey);
      return;
    }
    const prev = getPreviousMonthKey(selectedMonth);
    if (prev) setSelectedMonth(prev);
  };

  const handleNextMonth = () => {
    if (isAllTime) {
      setSelectedMonth(currentMonthKey);
      return;
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextKey);
  };

  // Quick Credit Salary
  const handleQuickCreditSalary = () => {
    if (!salary || salary <= 0) return;
    const targetMonth = isAllTime ? currentMonthKey : selectedMonth;
    const newTx = {
      id: generateId('ptx'),
      title: 'Monthly Salary',
      amount: parseFloat(salary),
      type: 'income',
      date: `${targetMonth}-01`
    };
    setPersonalState(prev => ({
      ...prev,
      transactions: [newTx, ...(prev.transactions || [])]
    }));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  // Save base salary
  const handleSaveSalary = (e) => {
    e.preventDefault();
    const val = parseFloat(salaryInput);
    const newSalary = !isNaN(val) && val >= 0 ? val : 0;
    setPersonalState(prev => ({
      ...prev,
      salary: newSalary
    }));
    setShowEditSalaryModal(false);
  };

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

    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount) || 0;
    const parsedSipAmount = parseFloat(sipAmount) || 0;
    const parsedSipDay = parseInt(sipDay, 10) || 5;

    if (editingGoalId) {
      setPersonalState(prev => ({
        ...prev,
        goals: (prev.goals || []).map(g => g.id === editingGoalId
          ? {
              ...g,
              title: goalTitle,
              target: parsedTarget,
              current: parsedCurrent,
              category,
              sipEnabled,
              sipAmount: parsedSipAmount,
              sipDay: parsedSipDay
            }
          : g)
      }));
    } else {
      const newGoal = {
        id: generateId('g'),
        title: goalTitle,
        target: parsedTarget,
        current: parsedCurrent,
        category,
        sipEnabled,
        sipAmount: parsedSipAmount,
        sipDay: parsedSipDay,
        lastSipCreditedMonth: null
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
    setSipEnabled(false);
    setSipAmount('');
    setSipDay('5');
    setEditingGoalId(null);
    setShowAddGoalModal(false);
  };

  const handleStartEditGoal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    setTargetAmount(String(goal.target));
    setCurrentAmount(String(goal.current || 0));
    setCategory(goal.category);
    setSipEnabled(Boolean(goal.sipEnabled));
    setSipAmount(String(goal.sipAmount || ''));
    setSipDay(String(goal.sipDay || '5'));
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

  // Handle Receipt Upload in Personal Tx
  const handleTxFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingTx(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 900, 0.75);
      setTxReceipt(compressedDataUrl);
    } catch {
      alert('Could not attach receipt photo. Please try another image.');
    } finally {
      setIsCompressingTx(false);
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
      date: txDate || new Date().toISOString().split('T')[0],
      ...(txReceipt ? { receipt: txReceipt } : {})
    };

    setPersonalState(prev => ({
      ...prev,
      transactions: [newTx, ...(prev.transactions || [])]
    }));

    setTxTitle('');
    setTxAmount('');
    setTxReceipt(null);
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

      {/* MONTH SELECTOR BAR */}
      <div
        className="glass-card"
        style={{
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--positive)" />
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Savings Period</span>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {isAllTime ? 'Viewing all time records' : isCurrentMonth ? 'Active month (starts at ₹0)' : 'Archived month'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handlePrevMonth}
            title="Previous Month"
            aria-label="Previous Month"
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--bg-card-border)',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <ChevronLeft size={14} />
          </button>

          <select
            className="form-select"
            style={{
              width: 'auto',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '700',
              borderRadius: '8px'
            }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} {m.value === currentMonthKey ? '• Current' : ''}
              </option>
            ))}
            <option value="all">📅 All Time (Lifetime)</option>
          </select>

          <button
            onClick={handleNextMonth}
            title="Next Month"
            aria-label="Next Month"
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--bg-card-border)',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* PENDING MONTHLY SIP NOTIFICATION BANNER */}
      {pendingSipGoals.length > 0 && isCurrentMonth && (
        <div
          className="glass-card"
          style={{
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            padding: '12px 14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Repeat size={18} color="var(--accent-strong)" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Scheduled Monthly SIP Due Today
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {pendingSipGoals.length} goal{pendingSipGoals.length !== 1 ? 's' : ''} scheduled for auto-deposit this month.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {pendingSipGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => handleExecuteSip(goal)}
                  style={{
                    background: 'var(--accent-strong)',
                    border: 'none',
                    color: 'var(--text-on-accent-strong)',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={11} /> Auto-Deposit {formatRupees(goal.sipAmount)} ({goal.title})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PERSONAL HERO SAVINGS CARD */}
      <div
        className="glass-card"
        style={{
          background: 'var(--positive-tint)',
          border: '1px solid var(--positive-border)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PiggyBank size={18} color="var(--positive)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Personal Savings ({isAllTime ? 'All Time' : selectedMonthLabel})
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { setSalaryInput(String(salary || '')); setShowEditSalaryModal(true); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.68rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Set base monthly salary"
            >
              <Pencil size={11} /> {salary > 0 ? `Base: ${formatRupees(salary)}` : 'Set Base Salary'}
            </button>
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
        </div>

        <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.8px', marginBottom: '4px' }}>
          {formatRupees(totalPersonalSavings)}
        </div>

        {/* Informative helper for month start */}
        {!isAllTime && currentMonthTransactions.length === 0 && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            ✨ Fresh month starting at ₹0. Add income or expenses below to begin tracking.
          </div>
        )}

        {/* Quick credit salary action if income is currently 0 */}
        {!isAllTime && totalPersonalIncome === 0 && salary > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={handleQuickCreditSalary}
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--positive-border)',
                color: 'var(--positive)',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              💰 Credit Monthly Salary ({formatRupees(salary)})
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {isAllTime ? 'Total Income' : 'Month Income'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--positive)', marginTop: '2px' }}>
              {formatRupees(totalPersonalIncome)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {isAllTime ? 'Total Expenses' : 'Month Expenses'}
            </div>
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

      {/* LAST MONTH SAVED DATA CARD (Preserved Record) */}
      {lastMonthKey && (
        <div
          className="glass-card"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-card-border)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="var(--accent-strong)" />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Last Month's Saved Record ({lastMonthLabel})
              </span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                background: lastMonthSavings >= 0 ? 'var(--positive-tint)' : 'var(--danger-tint, #FFEBEE)',
                color: lastMonthSavings >= 0 ? 'var(--positive)' : 'var(--danger)',
                border: `1px solid ${lastMonthSavings >= 0 ? 'var(--positive-border)' : 'rgba(239,68,68,0.3)'}`
              }}
            >
              {lastMonthSavingsRate}% Saved
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Net Saved in {lastMonthLabel.split(' ')[0]}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: lastMonthSavings >= 0 ? 'var(--positive)' : 'var(--danger)' }}>
                {formatRupees(lastMonthSavings)}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <div>Income: <strong style={{ color: 'var(--text-main)' }}>{formatRupees(lastMonthIncome)}</strong></div>
              <div>Expenses: <strong style={{ color: 'var(--text-main)' }}>{formatRupees(lastMonthExpense)}</strong></div>
            </div>
          </div>

          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {lastMonthTransactions.length} transaction{lastMonthTransactions.length !== 1 ? 's' : ''} saved
            </span>
            <button
              onClick={() => setSelectedMonth(lastMonthKey)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-strong)',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                padding: 0
              }}
            >
              View {lastMonthLabel.split(' ')[0]} details →
            </button>
          </div>
        </div>
      )}

      {/* PERSONAL SAVINGS GOALS & TARGETS (With Forecasting & SIP) */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--positive)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>My Savings Goals & Targets</h3>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              With automated SIP & completion forecasting
            </div>
          </div>
          <button
            onClick={() => {
              setEditingGoalId(null);
              setGoalTitle('');
              setTargetAmount('');
              setCurrentAmount('');
              setCategory('Investment');
              setSipEnabled(false);
              setSipAmount('');
              setSipDay('5');
              setShowAddGoalModal(true);
            }}
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
              <p style={{ fontSize: '0.72rem' }}>Tap "+ New Goal" to set your first target with automated SIP.</p>
            </div>
          )}
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round(((goal.current || 0) / (goal.target || 1)) * 100));
            const forecast = getGoalForecast(goal);
            const isSipCreditedThisMonth = goal.lastSipCreditedMonth === currentMonthKey;

            return (
              <div key={goal.id} style={{ background: 'var(--hairline)', padding: '12px', borderRadius: '14px', border: '1px solid var(--bg-card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{goal.title || 'Savings Goal'}</span>
                      {goal.sipEnabled && (
                        <span style={{
                          fontSize: '0.62rem',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          background: isSipCreditedThisMonth ? 'var(--positive-tint)' : 'var(--accent-tint)',
                          color: isSipCreditedThisMonth ? 'var(--positive)' : 'var(--accent-strong)',
                          border: `1px solid ${isSipCreditedThisMonth ? 'var(--positive-border)' : 'var(--accent-border)'}`,
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Repeat size={9} /> SIP: {formatRupees(goal.sipAmount)} on {goal.sipDay}th {isSipCreditedThisMonth ? '✓' : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{goal.category}</div>
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

                {/* FORECASTING CALLOUT */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.68rem',
                  color: forecast.achieved ? 'var(--positive)' : 'var(--text-muted)',
                  marginTop: '6px',
                  background: 'var(--bg-card)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--bg-card-border)'
                }}>
                  <TrendingUp size={12} color={forecast.achieved ? 'var(--positive)' : 'var(--accent-strong)'} />
                  <span style={{ fontWeight: forecast.achieved ? '700' : '500' }}>
                    {forecast.text}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{pct}% achieved</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {goal.sipEnabled && !isSipCreditedThisMonth && (
                      <button
                        onClick={() => handleExecuteSip(goal)}
                        style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-border)', color: 'var(--accent-strong)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.65rem' }}
                        title="Run SIP deposit now"
                      >
                        ⚡ Run SIP ({formatRupees(goal.sipAmount)})
                      </button>
                    )}
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

      {/* MONTHLY SAVINGS HISTORY ARCHIVE */}
      {monthlyHistory.length > 0 && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="var(--positive)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Monthly Savings History</h3>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {monthlyHistory.length} month{monthlyHistory.length !== 1 ? 's' : ''} tracked
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {monthlyHistory.map((m) => {
              const isCurrent = m.monthKey === currentMonthKey;
              const isSelected = m.monthKey === selectedMonth;
              return (
                <div
                  key={m.monthKey}
                  onClick={() => setSelectedMonth(m.monthKey)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--positive-tint)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--positive-border)' : 'var(--bg-card-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {m.label}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--accent-tint)', color: 'var(--accent-strong)', fontWeight: '700' }}>
                          Current
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Income: {formatRupees(m.income)} • Expense: {formatRupees(m.expense)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: m.net >= 0 ? 'var(--positive)' : 'var(--danger)' }}>
                      {m.net >= 0 ? '+' : ''}{formatRupees(m.net)}
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                      {m.rate}% saved
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PERSONAL TRANSACTION LOG */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>
              {isAllTime ? 'All Personal Transactions' : `${selectedMonthLabel} Transactions`}
            </h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {currentMonthTransactions.length} item{currentMonthTransactions.length !== 1 ? 's' : ''} recorded
            </span>
          </div>
          <button
            onClick={() => {
              setTxTitle('');
              setTxAmount('');
              setTxType('expense');
              setTxReceipt(null);
              const defaultDate = isAllTime || selectedMonth === currentMonthKey
                ? new Date().toISOString().split('T')[0]
                : `${selectedMonth}-01`;
              setTxDate(defaultDate);
              setShowAddTxModal(true);
            }}
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
            + Add Personal Item
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {currentMonthTransactions.length === 0 && (
            <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <p style={{ marginBottom: '8px' }}><Emoji size="1.8rem">🧾</Emoji></p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                No transactions for {isAllTime ? 'personal tracker' : selectedMonthLabel}
              </p>
              <p style={{ fontSize: '0.72rem' }}>
                Starts at ₹0. Tap "+ Add Personal Item" to record income or expenses.
              </p>
            </div>
          )}
          {currentMonthTransactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{tx.title}</span>
                  {tx.receipt && (
                    <button
                      type="button"
                      onClick={() => setActiveReceiptTx(tx)}
                      title="View receipt attachment"
                      style={{
                        background: 'var(--accent-tint)',
                        border: '1px solid var(--accent-border)',
                        borderRadius: '4px',
                        padding: '1px 5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.6rem',
                        color: 'var(--accent-strong)',
                        fontWeight: '700'
                      }}
                    >
                      <FileText size={10} /> Receipt
                    </button>
                  )}
                </div>
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

      {/* EDIT BASE SALARY MODAL */}
      {showEditSalaryModal && (
        <div className="sheet-overlay" onClick={() => setShowEditSalaryModal(false)}>
          <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
              Set Base Monthly Salary
            </h3>
            <form onSubmit={handleSaveSalary} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Monthly Salary (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 85000"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  autoFocus
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  This allows you to quickly credit your salary in one tap each month.
                </span>
              </div>
              <button type="submit" className="btn-primary">
                Save Base Salary
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT GOAL MODAL (With SIP Settings) */}
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
                  <option value="Investment">Investment / Mutual Fund</option>
                  <option value="Emergency">Emergency Fund</option>
                  <option value="Vacation">Vacation / Dream Goal</option>
                  <option value="Gadget">Gadget / Tech</option>
                </select>
              </div>

              {/* AUTOMATED MONTHLY SIP SECTION */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--bg-card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setSipEnabled(!sipEnabled)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Repeat size={16} color="var(--accent-strong)" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>Schedule Monthly SIP</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Auto-credit into this goal monthly</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sipEnabled}
                    onChange={(e) => setSipEnabled(e.target.checked)}
                    style={{ accentColor: 'var(--accent-strong)', cursor: 'pointer' }}
                  />
                </div>

                {sipEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--hairline)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">SIP Amount (₹/mo)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="5000"
                        value={sipAmount}
                        onChange={(e) => setSipAmount(e.target.value)}
                        required={sipEnabled}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Day of Month</label>
                      <select
                        className="form-select"
                        value={sipDay}
                        onChange={(e) => setSipDay(e.target.value)}
                      >
                        {[1, 5, 10, 15, 20, 25, 28].map(d => (
                          <option key={d} value={d}>{d}th of month</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary">
                {editingGoalId ? 'Update Savings Goal' : 'Save Savings Goal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PERSONAL TX MODAL (With Receipt Photo) */}
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
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    background: txType === 'expense' ? 'var(--accent-strong)' : 'transparent',
                    color: txType === 'expense' ? 'var(--text-on-accent-strong)' : 'var(--text-muted)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    background: txType === 'income' ? 'var(--positive)' : 'transparent',
                    color: txType === 'income' ? 'var(--text-on-accent-strong)' : 'var(--text-muted)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Receipt Attachment Section */}
              <div className="form-group">
                <label className="form-label">Receipt Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={txFileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleTxFileChange}
                />

                {txReceipt ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--accent-border)', borderRadius: '10px', padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={txReceipt}
                        alt="Receipt thumbnail"
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--bg-card-border)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Receipt attached</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--positive)' }}>Ready to save</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTxReceipt(null)}
                      style={{ background: 'var(--danger-tint)', border: 'none', borderRadius: '6px', color: 'var(--danger)', padding: '6px', cursor: 'pointer', display: 'flex' }}
                      title="Remove receipt"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => txFileInputRef.current?.click()}
                    disabled={isCompressingTx}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      background: 'var(--bg-card)',
                      border: '1px dashed var(--accent-border)',
                      borderRadius: '10px',
                      padding: '8px',
                      color: 'var(--accent-strong)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: isCompressingTx ? 'default' : 'pointer'
                    }}
                  >
                    <Camera size={14} />
                    <span>{isCompressingTx ? 'Compressing photo…' : 'Attach Receipt Photo'}</span>
                  </button>
                )}
              </div>

              <button type="submit" className="btn-primary">
                Save Personal Item (₹)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {activeReceiptTx && (
        <ReceiptModal
          receiptUrl={activeReceiptTx.receipt}
          title={activeReceiptTx.title}
          amount={activeReceiptTx.amount}
          date={activeReceiptTx.date}
          onClose={() => setActiveReceiptTx(null)}
          onRemoveReceipt={() => {
            setPersonalState(prev => ({
              ...prev,
              transactions: (prev.transactions || []).map(t =>
                t.id === activeReceiptTx.id ? { ...t, receipt: null } : t
              )
            }));
            setActiveReceiptTx(null);
          }}
        />
      )}

    </div>
  );
}
