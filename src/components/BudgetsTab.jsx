import React, { useState } from 'react';
import { Edit2, Check, Calendar, ArrowRightLeft } from 'lucide-react';
import { formatRupees } from '../utils/mockData';
import { getMonthOptions } from '../utils/dates';

export default function BudgetsTab({
  categories = [],
  transactions = [],
  activeMemberId = 'all',
  selectedMonth = '2026-07',
  setSelectedMonth,
  enableRollover = true,
  setEnableRollover,
  onUpdateCategoryLimit
}) {
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');

  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditLimit(cat.limit);
  };

  const handleSaveEdit = (catId) => {
    const val = parseFloat(editLimit);
    if (!isNaN(val) && val >= 0 && typeof onUpdateCategoryLimit === 'function') {
      onUpdateCategoryLimit(catId, val);
    }
    setEditingId(null);
  };

  const monthDisplayLabel = selectedMonth === 'all' 
    ? 'All Months' 
    : new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  // Rollover calculation from last month (June)
  const lastMonthKey = '2026-06';
  const lastMonthTxs = safeTxs.filter(t => (activeMemberId === 'all' || t.memberId === activeMemberId) && t.date && t.date.startsWith(lastMonthKey));
  const lastMonthInc = lastMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const lastMonthExp = lastMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const lastMonthSavings = Math.max(0, lastMonthInc - lastMonthExp);
  const rolloverAmount = Math.round(lastMonthSavings * 0.15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Month Filter Selector */}
      <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#f9812f" />
          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Budget Period</span>
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700' }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
        >
          {getMonthOptions(transactions).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* MONTHLY ROLLOVER CARD TOGGLE */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(249, 129, 47, 0.1) 0%, rgba(94, 195, 157, 0.1) 100%)', border: '1px solid rgba(249, 129, 47, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowRightLeft size={20} color="#f9812f" />
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700' }}>Monthly Rollover Carry-Forward</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {enableRollover ? `Adding +${formatRupees(rolloverAmount)} leftover from June savings` : 'Rollover is disabled'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEnableRollover && setEnableRollover(!enableRollover)}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: `1px solid ${enableRollover ? '#f9812f' : 'var(--bg-card-border)'}`,
              background: enableRollover ? 'rgba(249, 129, 47, 0.2)' : 'transparent',
              color: enableRollover ? '#f9812f' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {enableRollover ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Category List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
          Full Category Breakdown ({monthDisplayLabel})
        </div>

        {safeCategories.map((cat) => {
          const spent = safeTxs
            .filter(t => t.category === cat.id && t.type === 'expense' && (activeMemberId === 'all' || t.memberId === activeMemberId) && (selectedMonth === 'all' || (t.date && t.date.startsWith(selectedMonth))))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          const pct = cat.limit > 0 ? Math.min(100, Math.round((spent / cat.limit) * 100)) : 0;
          const isOver = spent > cat.limit;
          const isNear = pct >= 80 && !isOver;
          const hasSpending = spent > 0;

          return (
            <div key={cat.id} className="glass-card" style={{ padding: '14px 16px', opacity: hasSpending ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{cat.icon || '📦'}</span>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '700' }}>{cat.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {hasSpending ? `${formatRupees(spent)} spent` : 'No spending yet'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {editingId === cat.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '90px', padding: '4px 8px', height: '30px', fontSize: '0.85rem' }}
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        style={{ background: '#f9812f', border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{formatRupees(cat.limit || 0)}</span>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="bar" style={{ background: '#2a251d' }}>
                <i
                  style={{
                    width: `${hasSpending ? pct : 0}%`,
                    background: isOver ? '#f87171' : isNear ? '#f59e0b' : cat.color || '#f26a1b'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem' }}>
                <span style={{ color: isOver ? '#f87171' : isNear ? '#f59e0b' : 'var(--text-dim)' }}>
                  {!hasSpending ? 'No spending recorded' : isOver ? '⚠️ Over budget!' : isNear ? '⚡ Approaching limit' : `${100 - pct}% remaining`}
                </span>
                <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                  {pct}% Used
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
