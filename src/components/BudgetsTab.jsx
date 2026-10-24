import React, { useState, useMemo } from 'react';
import { Edit2, Check, Calendar, ArrowRightLeft, Trash2 } from 'lucide-react';
import {
  formatRupees, getBudgetMonths, getPreviousMonthKey, limitFor, hasMonthOverride,
  generateId, CATEGORY_COLORS
} from '../utils/mockData';
import Emoji from './Emoji';
import RadialGauge from './RadialGauge';

export default function BudgetsTab({
  categories = [],
  transactions = [],
  members = [],
  activeMemberId = 'all',
  selectedMonth = '2026-07',
  setSelectedMonth,
  enableRollover = true,
  setEnableRollover,
  onUpdateCategory,
  onAddCategory,
  onDeleteCategory
}) {
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');
  const [editName, setEditName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [detailCat, setDetailCat] = useState(null);

  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeMembers = Array.isArray(members) ? members : [];

  const editingMonth = selectedMonth !== 'all';

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || typeof onAddCategory !== 'function') return;

    const amount = parseFloat(newLimit);
    const limit = !isNaN(amount) && amount >= 0 ? amount : 0;

    // A generated id rather than one derived from the name: transactions
    // reference categories by id, so two categories that normalise to the same
    // slug would collide and silently merge each other's spending.
    onAddCategory({
      id: generateId('cat'),
      name,
      color: newColor,
      limit,
      // Entered while a month is in view, the amount is that month's budget —
      // matching what editing an existing category does here.
      ...(editingMonth && limit > 0 ? { limits: { [selectedMonth]: limit } } : {})
    });

    setNewName('');
    setNewLimit('');
    setNewColor(CATEGORY_COLORS[0]);
    setShowAdd(false);
  };

  const handleRemoveCategory = (cat) => {
    const spent = safeTxs
      .filter((t) => t.category === cat.id && t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const warning = spent > 0
      ? `Remove "${cat.name}"? Its ${formatRupees(spent)} of past expenses stay in your history, but they will no longer show a category name.`
      : `Remove "${cat.name}"?`;

    if (window.confirm(warning) && typeof onDeleteCategory === 'function') {
      onDeleteCategory(cat.id);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditLimit(limitFor(cat, selectedMonth));
    setEditName(cat.name || '');
  };

  const handleSaveEdit = (catId) => {
    const updates = {};
    const val = parseFloat(editLimit);
    if (!isNaN(val) && val >= 0) {
      // With a month in view the edit belongs to that month alone, which is
      // what makes filling in a month you missed possible without disturbing
      // the others. On "All Time" there is no month to attach it to, so it
      // moves the standing default instead.
      if (editingMonth) updates.limits = { [selectedMonth]: val };
      else updates.limit = val;
    }
    // An emptied name keeps the old one rather than saving a blank label —
    // the id is what transactions reference, so renaming never orphans them.
    const name = editName.trim();
    if (name) updates.name = name;
    if (Object.keys(updates).length && typeof onUpdateCategory === 'function') {
      onUpdateCategory(catId, updates);
    }
    setEditingId(null);
  };

  const monthDisplayLabel = selectedMonth === 'all'
    ? 'All Months'
    : new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  const availableMonths = getBudgetMonths(safeTxs, safeCategories);

  // Rollover calculation from the month before the selected one
  const lastMonthKey = selectedMonth === 'all' ? null : getPreviousMonthKey(selectedMonth);
  const lastMonthLabel = lastMonthKey
    ? new Date(lastMonthKey + '-01').toLocaleString('default', { month: 'long' })
    : 'last month';
  const lastMonthTxs = lastMonthKey
    ? safeTxs.filter(t => (activeMemberId === 'all' || t.memberId === activeMemberId) && t.date && t.date.startsWith(lastMonthKey))
    : [];
  const lastMonthInc = lastMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const lastMonthExp = lastMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const lastMonthSavings = Math.max(0, lastMonthInc - lastMonthExp);
  const rolloverAmount = Math.round(lastMonthSavings * 0.15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Month Filter Selector */}
      <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--accent-strong)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Budget Period</span>
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700' }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
        >
          {availableMonths.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
          <option value="all">📅 All Time</option>
        </select>
      </div>

      {/* MONTHLY ROLLOVER CARD TOGGLE */}
      <div className="glass-card" style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowRightLeft size={20} color="var(--accent-strong)" />
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700' }}>Monthly Rollover Carry-Forward</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {enableRollover ? `Adding +${formatRupees(rolloverAmount)} leftover from ${lastMonthLabel} savings` : 'Rollover is disabled'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEnableRollover && setEnableRollover(!enableRollover)}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: `1px solid ${enableRollover ? 'var(--accent-strong)' : 'var(--bg-card-border)'}`,
              background: enableRollover ? 'var(--accent-tint)' : 'transparent',
              color: enableRollover ? 'var(--accent-strong)' : 'var(--text-muted)',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              Full Category Breakdown ({monthDisplayLabel})
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {editingMonth
                ? `Edits apply to ${monthDisplayLabel} only — pick an earlier month above to fill one in.`
                : 'Editing here changes the default budget used by every month.'}
            </div>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            aria-expanded={showAdd}
            style={{
              background: showAdd ? 'transparent' : 'var(--positive-tint)',
              border: `1px solid ${showAdd ? 'var(--bg-card-border)' : 'var(--positive-border)'}`,
              color: showAdd ? 'var(--text-muted)' : 'var(--positive-strong)',
              padding: '5px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            {showAdd ? 'Close' : '+ Add category'}
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleCreateCategory} className="glass-card" style={{ background: 'var(--hairline)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '10px' }}>New budget category</h4>

            <div className="form-group">
              <label className="form-label" htmlFor="new-cat-name">Category name</label>
              <input
                id="new-cat-name"
                type="text"
                className="form-input"
                placeholder="e.g. Gym & Fitness"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-cat-limit">
                {editingMonth ? `Budget for ${monthDisplayLabel} (₹)` : 'Monthly budget (₹)'}
              </label>
              <input
                id="new-cat-limit"
                type="number"
                min="0"
                className="form-input"
                placeholder="0 — you can set this later"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Colour</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '2px 0' }}>
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    aria-label={`Use colour ${c}`}
                    aria-pressed={newColor === c}
                    style={{
                      width: '28px', height: '28px', borderRadius: '8px', background: c, cursor: 'pointer',
                      border: newColor === c ? '2px solid var(--text-main)' : '2px solid transparent',
                      outline: newColor === c ? '2px solid var(--bg-card)' : 'none', outlineOffset: '-4px'
                    }}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '10px', fontSize: '0.88rem', marginTop: '4px' }}>
              Add category
            </button>
          </form>
        )}

        {safeCategories.map((cat) => {
          const spent = safeTxs
            .filter(t => t.category === cat.id && t.type === 'expense' && (activeMemberId === 'all' || t.memberId === activeMemberId) && (selectedMonth === 'all' || (t.date && t.date.startsWith(selectedMonth))))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          const monthLimit = limitFor(cat, selectedMonth);
          const isOwnBudget = hasMonthOverride(cat, selectedMonth);
          const hasLimit = monthLimit > 0;
          const pct = hasLimit ? Math.min(100, Math.round((spent / monthLimit) * 100)) : 0;
          // No limit set is not the same as a limit of zero — without this
          // every unbudgeted category with any spending reads "Over budget!".
          const isOver = hasLimit && spent > monthLimit;
          const isNear = hasLimit && pct >= 80 && !isOver;
          const hasSpending = spent > 0;

          return (
            <CategoryCard
              key={cat.id}
              cat={cat}
              spent={spent}
              monthLimit={monthLimit}
              isOwnBudget={isOwnBudget}
              hasLimit={hasLimit}
              pct={pct}
              isOver={isOver}
              isNear={isNear}
              hasSpending={hasSpending}
              editingId={editingId}
              editName={editName}
              editLimit={editLimit}
              editingMonth={editingMonth}
              showAdd={showAdd}
              onOpenDetail={() => setDetailCat(cat)}
              onEditName={setEditName}
              onEditLimit={setEditLimit}
              onSaveEdit={handleSaveEdit}
              onStartEdit={handleStartEdit}
              onCancelEdit={() => setEditingId(null)}
              onRemove={handleRemoveCategory}
            />
          );
        })}

        {safeCategories.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-dim)' }}>
            <p style={{ marginBottom: '6px' }}><Emoji size="1.6rem">🗂️</Emoji></p>
            <p style={{ font: '700 13px Manrope', color: 'var(--text-muted)' }}>No categories yet</p>
            <p style={{ font: '600 11.5px Manrope', marginTop: '2px' }}>Add one above to start budgeting.</p>
          </div>
        )}
      </div>

      {/* Category Spending Detail Modal */}
      {detailCat && (
        <CategoryDetailModal
          cat={detailCat}
          safeTxs={safeTxs}
          safeMembers={safeMembers}
          activeMemberId={activeMemberId}
          selectedMonth={selectedMonth}
          monthDisplayLabel={monthDisplayLabel}
          onClose={() => setDetailCat(null)}
        />
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryCard — a single budget row. Tapping it opens the detail modal.
// ---------------------------------------------------------------------------
function CategoryCard({
  cat, spent, monthLimit, isOwnBudget, hasLimit, pct, isOver, isNear, hasSpending,
  editingId, editName, editLimit, editingMonth, showAdd,
  onOpenDetail, onEditName, onEditLimit, onSaveEdit, onStartEdit, onCancelEdit, onRemove
}) {
  const isEditing = editingId === cat.id;

  return (
    <div
      className="glass-card"
      style={{
        padding: '14px 16px', opacity: hasSpending ? 1 : 0.7,
        cursor: hasSpending && !isEditing ? 'pointer' : 'default',
      }}
      onClick={(e) => {
        if (e.target.closest('button, input, select, textarea')) return;
        if (hasSpending && !isEditing) onOpenDetail();
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {hasLimit ? (
            <RadialGauge
              percent={monthLimit > 0 ? (spent / monthLimit) * 100 : 0}
              size={40}
              strokeWidth={4}
              accentColor={cat.color || 'var(--accent)'}
              labelSize="0.62rem"
            />
          ) : (
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: cat.color || 'var(--text-muted)', flexShrink: 0 }} />
          )}
          <div>
            {isEditing ? (
              <input
                type="text"
                className="form-input"
                style={{ width: '150px', padding: '4px 8px', height: '30px', fontSize: '0.85rem', fontWeight: '700' }}
                value={editName}
                onChange={(e) => onEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveEdit(cat.id);
                  if (e.key === 'Escape') onCancelEdit();
                }}
                aria-label="Category name"
                autoFocus
              />
            ) : (
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700' }}>{cat.name}</h4>
            )}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {hasSpending ? `${formatRupees(spent)} spent` : 'No spending yet'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                className="form-input"
                style={{ width: '90px', padding: '4px 8px', height: '30px', fontSize: '0.85rem' }}
                value={editLimit}
                onChange={(e) => onEditLimit(e.target.value)}
                autoFocus
              />
              <button
                onClick={() => onSaveEdit(cat.id)}
                style={{ background: 'var(--accent-strong)', border: 'none', borderRadius: '6px', padding: '4px 8px', color: 'var(--text-on-accent-strong)', fontWeight: '700', cursor: 'pointer' }}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{formatRupees(monthLimit)}</span>
                <button
                  onClick={() => onStartEdit(cat)}
                  aria-label={`Edit ${cat.name || 'category'} budget`}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                >
                  <Edit2 size={13} />
                </button>
              </div>
              {editingMonth && (
                <span style={{ fontSize: '0.62rem', color: isOwnBudget ? 'var(--accent-strong)' : 'var(--text-dim)', fontWeight: '700', letterSpacing: '.02em' }}>
                  {isOwnBudget ? 'THIS MONTH' : 'DEFAULT'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bar" style={{ background: 'var(--bg-card-hover)' }}>
        <i
          style={{
            width: `${hasSpending ? pct : 0}%`,
            background: isOver ? 'var(--danger)' : isNear ? 'var(--gold)' : cat.color || 'var(--accent)'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem' }}>
        <span style={{ color: isOver ? 'var(--danger)' : isNear ? 'var(--gold)' : 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {!hasSpending
            ? 'No spending recorded'
            : !hasLimit
              ? 'No budget set'
              : isOver
                ? <><Emoji size="0.85em">⚠️</Emoji> Over budget!</>
                : isNear
                  ? <><Emoji size="0.85em">⚡</Emoji> Approaching limit</>
                  : `${100 - pct}% remaining`}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
            {hasLimit ? `${pct}% Used` : '—'}
          </span>
          {showAdd && (
            <button
              onClick={() => onRemove(cat)}
              title={`Remove ${cat.name}`}
              aria-label={`Remove ${cat.name}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', borderRadius: '6px' }}
            >
              <Trash2 size={13} color="var(--danger)" opacity={0.6} />
            </button>
          )}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryDetailModal — bottom-sheet popup showing all transactions for a
// budget category, grouped by day, with member avatars and a day-strip.
// ---------------------------------------------------------------------------
function CategoryDetailModal({
  cat, safeTxs, safeMembers, activeMemberId, selectedMonth, monthDisplayLabel, onClose
}) {
  const catTxs = useMemo(() =>
    safeTxs
      .filter(t =>
        t.category === cat.id &&
        t.type === 'expense' &&
        (activeMemberId === 'all' || t.memberId === activeMemberId) &&
        (selectedMonth === 'all' || (t.date && t.date.startsWith(selectedMonth)))
      )
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [safeTxs, cat.id, activeMemberId, selectedMonth]
  );

  const totalSpent = catTxs.reduce((s, t) => s + (t.amount || 0), 0);

  const groupedByDay = useMemo(() => {
    const map = {};
    catTxs.forEach(tx => {
      const d = tx.date || 'Unknown';
      if (!map[d]) map[d] = [];
      map[d].push(tx);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [catTxs]);

  const getMember = (id) => safeMembers.find(m => m.id === id);

  return (
    <div
      className="sheet-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sheet-modal" style={{ maxHeight: '85vh' }}>
        {/* Handle */}
        <div className="sheet-handle" style={{ margin: '0 auto 16px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: `color-mix(in srgb, ${cat.color || 'var(--accent)'} 20%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${cat.color || 'var(--accent)'}`,
            }}>
              <Emoji size="1.1rem">{cat.icon || '📂'}</Emoji>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>{cat.name}</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{monthDisplayLabel}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card-hover)', border: '1px solid var(--bg-card-border)',
              borderRadius: '10px', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Summary stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          marginBottom: '16px',
        }}>
          <div style={{
            background: 'var(--bg-hero)', borderRadius: '12px', padding: '10px 12px',
            border: '1px solid var(--bg-hero-border)',
          }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700', marginBottom: '3px' }}>
              Total Spent
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-strong)' }}>
              {formatRupees(totalSpent)}
            </div>
          </div>
          <div style={{
            background: 'var(--bg-hero)', borderRadius: '12px', padding: '10px 12px',
            border: '1px solid var(--bg-hero-border)',
          }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700', marginBottom: '3px' }}>
              Transactions
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {catTxs.length}
              <span style={{ fontSize: '0.65rem', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '4px' }}>
                across {groupedByDay.length} day{groupedByDay.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Day-strip calendar */}
        <DayStrip catTxs={catTxs} selectedMonth={selectedMonth} catColor={cat.color} />

        {/* Transactions grouped by day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          {groupedByDay.map(([dateKey, txs]) => {
            const dayTotal = txs.reduce((s, t) => s + (t.amount || 0), 0);
            const dateLabel = dateKey !== 'Unknown'
              ? new Date(dateKey + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short'
                })
              : 'Unknown date';
            const dayOfWeek = dateKey !== 'Unknown'
              ? new Date(dateKey + 'T00:00:00').getDay()
              : -1;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <div key={dateKey}>
                {/* Day header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '8px', paddingBottom: '4px',
                  borderBottom: '1px solid var(--divider)',
                }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: '700',
                    color: isWeekend ? 'var(--accent-strong)' : 'var(--text-muted)',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                  }}>
                    {isWeekend && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />}
                    {dateLabel}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {formatRupees(dayTotal)}
                  </span>
                </div>

                {/* Transaction rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {txs.map((tx) => {
                    const member = getMember(tx.memberId);
                    return (
                      <div
                        key={tx.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 10px',
                          borderRadius: '10px', background: 'var(--bg-card)',
                          border: '1px solid var(--bg-card-border)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          {member && (
                            <span style={{
                              fontSize: '0.95rem', width: '28px', height: '28px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '8px', background: 'var(--bg-hero)',
                              border: '1px solid var(--bg-hero-border)', flexShrink: 0,
                            }}>
                              {member.avatar || '👤'}
                            </span>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-main)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {tx.title || cat.name}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '1px' }}>
                              {member ? member.name?.split(' ')[0] : ''}
                              {member && tx.notes ? ' · ' : ''}
                              {tx.notes || ''}
                              {!member && !tx.notes ? 'No details' : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            {formatRupees(tx.amount)}
                          </span>
                          {tx.paymentMethod && (
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                              {tx.paymentMethod}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {catTxs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            No expenses recorded for this filter.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DayStrip — a row of small squares for each day in the month, filled when
// the category had spending that day.
// ---------------------------------------------------------------------------
function DayStrip({ catTxs, selectedMonth, catColor }) {
  const { days, spendingDays } = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'all') return { days: 0, spendingDays: new Set() };
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const sd = new Set();
    catTxs.forEach(tx => {
      if (tx.date) {
        const d = parseInt(tx.date.split('-')[2], 10);
        if (d) sd.add(d);
      }
    });
    return { days: daysInMonth, spendingDays: sd };
  }, [catTxs, selectedMonth]);

  if (days === 0) return null;

  const cells = [];
  for (let d = 1; d <= days; d++) {
    const active = spendingDays.has(d);
    cells.push(
      <div
        key={d}
        title={`Day ${d}${active ? ' — spent' : ''}`}
        style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: '3px',
          background: active ? (catColor || 'var(--accent)') : 'var(--bg-card-hover)',
          opacity: active ? 1 : 0.4,
          position: 'relative',
        }}
      >
        {active && (
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.42rem', fontWeight: '800', color: '#fff', lineHeight: 1,
          }}>
            {d}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Days with spending ({spendingDays.size} of {days})
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(days, 31)}, 1fr)`,
        gap: '2px',
      }}>
        {cells}
      </div>
    </div>
  );
}

