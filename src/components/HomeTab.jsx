import React from 'react';
import { formatRupees, getPreviousMonthKey } from '../utils/mockData';

export default function HomeTab({
  transactions = [],
  categories = [],
  members = [],
  bills = [],
  activeMemberId = 'all',
  selectedMonth = '2026-07',
  activeDirection = '2b',
  onNavigateToExpenses,
  onNavigateToBudgets,
  onNavigateToBills,
  onOpenAddModal
}) {
  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeMembers = Array.isArray(members) ? members : [];
  const safeBills = Array.isArray(bills) ? bills : [];

  // Filter transactions by active member & month
  const filteredTxs = safeTxs.filter(t => {
    const matchesMember = activeMemberId === 'all' || t.memberId === activeMemberId;
    const matchesMonth = selectedMonth === 'all' || (t.date && t.date.startsWith(selectedMonth));
    return matchesMember && matchesMonth;
  });

  const totalExpense = filteredTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalBudgetLimit = safeCategories.reduce((sum, c) => sum + (c.limit || 0), 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalExpense);
  const budgetUtilization = totalBudgetLimit > 0 ? Math.min(100, Math.round((totalExpense / totalBudgetLimit) * 100)) : 0;

  // Daily average: real spend so far / days in the selected month (only meaningful for a specific month)
  const daysInSelectedMonth = (() => {
    if (selectedMonth === 'all') return null;
    const [y, m] = selectedMonth.split('-').map(Number);
    return y && m ? new Date(y, m, 0).getDate() : null;
  })();
  const dailyAverage = daysInSelectedMonth ? totalExpense / daysInSelectedMonth : null;

  // Compare to the previous month's spend, when there is one to compare against
  const prevMonthKey = selectedMonth !== 'all' ? getPreviousMonthKey(selectedMonth) : null;
  const prevMonthExpense = prevMonthKey
    ? safeTxs
        .filter(t => (activeMemberId === 'all' || t.memberId === activeMemberId) && t.type === 'expense' && t.date && t.date.startsWith(prevMonthKey))
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    : 0;
  const expenseDeltaPct = prevMonthExpense > 0
    ? Math.round(((totalExpense - prevMonthExpense) / prevMonthExpense) * 100)
    : null;

  const activeMember = safeMembers.find(m => m.id === activeMemberId) || { name: 'Our Family', avatar: '👨‍👩‍👧‍👦' };

  // Category Colors matching design doc
  const categoryColors = {
    groceries: 'var(--accent)',
    education: 'var(--coral)',
    housing: 'var(--gold)',
    utilities: 'var(--gold)',
    dining: 'var(--positive-strong)',
    entertainment: 'var(--positive-strong)',
    health: 'var(--cat-6)',
    transport: 'var(--cat-6)',
    shopping: 'var(--cat-9)'
  };

  const recentTxs = [...filteredTxs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  const upcomingBills = safeBills.filter(b => !b.paid && (b.daysUntilDue || 0) <= 7);

  // =========================================================================
  // DIRECTION 2c: PLAYFUL DARK (VIVID CATEGORY TILES)
  // =========================================================================
  if (activeDirection === '2c') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Header Greeting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-main)' }}>Hey, {activeMember.name}</div>
            <div style={{ font: '500 12px Manrope', color: 'var(--text-muted)', marginTop: '2px' }}>Let's keep this month on budget</div>
          </div>
          <div className="member-avatar-wrapper" style={{ width: '42px', height: '42px', fontSize: '19px' }}>
            {activeMember.avatar || '👨‍👩‍👧‍👦'}
          </div>
        </div>

        {/* Feature card: a solid ink-on-accent panel rather than a black gradient. */}
        <div style={{ background: 'var(--accent-strong)', borderRadius: '16px', padding: '20px 22px', border: '1px solid var(--accent-strong)' }}>
          <div style={{ font: '600 10px Manrope', color: 'var(--accent-tint)', letterSpacing: '.12em' }}>
            TOTAL SPENT / {formatRupees(totalBudgetLimit)} BUDGET
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '44px', lineHeight: 1, color: 'var(--text-on-accent-strong)', marginTop: '8px' }}>
            {formatRupees(totalExpense)}
          </div>
          <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,250,243,0.28)', overflow: 'hidden', marginTop: '18px' }}>
            <i style={{ display: 'block', height: '100%', width: `${budgetUtilization}%`, background: 'var(--text-on-accent-strong)', borderRadius: '2px' }} />
          </div>
          <div style={{ font: '500 11.5px Manrope', color: 'var(--accent-tint)', marginTop: '10px' }}>
            {formatRupees(remainingBudget)} left to spend
          </div>
        </div>

        {/* Action Pills */}
        <div style={{ display: 'flex', gap: '9px', overflow: 'hidden' }}>
          <button className="action-pill" onClick={onOpenAddModal}>＋ Add expense</button>
          <button className="action-pill secondary" onClick={onOpenAddModal}>Scan receipt</button>
          <button className="action-pill secondary" onClick={onNavigateToBudgets}>Split</button>
        </div>

        {/* 2x2 Vivid Category Tiles */}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--text-main)', marginBottom: '12px' }}>Where it's going</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {safeCategories.slice(0, 4).map((cat) => {
              const spent = filteredTxs
                .filter(t => t.category === cat.id && t.type === 'expense')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
              const pct = cat.limit > 0 ? Math.min(100, Math.round((spent / cat.limit) * 100)) : 0;
              const bg = categoryColors[cat.id] || cat.color || 'var(--accent)';

              return (
                <div key={cat.id} style={{ background: bg, borderRadius: '14px', padding: '15px 16px', color: '#FFFAF3' }}>
                  <div style={{ font: '700 13px Manrope' }}>{cat.icon || '📦'} {(cat.name || 'Category').split(' ')[0]}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', lineHeight: 1.1, marginTop: '12px' }}>{formatRupees(spent)}</div>
                  <div style={{ font: '500 11px Manrope', color: 'rgba(255,250,243,0.85)', marginTop: '2px' }}>
                    {pct}% of {formatRupees(cat.limit)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // DIRECTION 2b: BOLD HERO DARK (DEFAULT MAIN VIEW)
  // =========================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Hero: a flat accent-tinted surface rather than a gradient panel. */}
      <div style={{ background: 'var(--bg-hero)', border: '1px solid var(--bg-hero-border)', borderRadius: '16px', padding: '20px 22px 18px 22px', flex: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--text-main)' }}>
            Hi, {activeMember.name}
          </div>
          <div style={{ font: '600 10px Manrope', letterSpacing: '.09em', color: 'var(--text-dim)' }}>
            {selectedMonth === 'all' ? 'ALL TIME' : new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long' }).toUpperCase()}
          </div>
        </div>

        <div style={{ font: '600 10px Manrope', color: 'var(--text-dim)', marginTop: '18px', letterSpacing: '.12em' }}>SPENT THIS MONTH</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '54px', lineHeight: 1, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{formatRupees(totalExpense)}</div>
          <div style={{ font: '500 12.5px Manrope', color: 'var(--text-dim)' }}>of {formatRupees(totalBudgetLimit)}</div>
        </div>

        <div style={{ height: '4px', borderRadius: '2px', background: 'var(--track-hero)', overflow: 'hidden', marginTop: '20px' }}>
          <i style={{ display: 'block', height: '100%', width: `${budgetUtilization}%`, background: 'var(--accent)', borderRadius: '2px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', font: '500 11.5px Manrope', color: 'var(--text-muted)' }}>
          <span>{budgetUtilization}% used</span>
          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{formatRupees(remainingBudget)} left</span>
        </div>
      </div>

      {/* Content Below Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Action Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button className="action-pill" onClick={onOpenAddModal}>＋ Add expense</button>
          <button className="action-pill secondary" onClick={onOpenAddModal}>Scan receipt</button>
          <button className="action-pill secondary" onClick={onNavigateToBudgets}>Split</button>
        </div>

        {/* 2 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '15px 16px' }}>
            <div style={{ font: '600 10px Manrope', letterSpacing: '.08em', color: 'var(--text-dim)' }}>DAILY AVERAGE</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '27px', lineHeight: 1.1, color: 'var(--text-main)', marginTop: '6px' }}>
              {dailyAverage !== null ? formatRupees(Math.round(dailyAverage)) : '—'}
            </div>
            <div style={{ font: '500 11px Manrope', color: expenseDeltaPct !== null && expenseDeltaPct <= 0 ? 'var(--positive)' : 'var(--danger)', marginTop: '4px' }}>
              {expenseDeltaPct !== null
                ? `${expenseDeltaPct <= 0 ? '↓' : '↑'} ${Math.abs(expenseDeltaPct)}% vs last month`
                : 'No prior month to compare'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '15px 16px' }} onClick={onNavigateToBills} className="cursor-pointer">
            <div style={{ font: '600 10px Manrope', letterSpacing: '.08em', color: 'var(--text-dim)' }}>BILLS DUE SOON</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '27px', lineHeight: 1.1, color: 'var(--text-main)', marginTop: '6px' }}>
              {formatRupees(upcomingBills.reduce((sum, b) => sum + (b.amount || 0), 0))}
            </div>
            <div style={{ font: '500 11px Manrope', color: 'var(--accent-strong)', marginTop: '4px' }}>
              {upcomingBills.length > 0 ? `${upcomingBills.length} upcoming` : 'All caught up'}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-main)' }}>Recent</div>
            <div style={{ font: '600 11.5px Manrope', color: 'var(--accent-strong)', cursor: 'pointer' }} onClick={onNavigateToExpenses}>All activity</div>
          </div>

          {recentTxs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 10px', color: 'var(--text-dim)' }}>
              <p style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🧾</p>
              <p style={{ font: '700 13px Manrope', color: 'var(--text-muted)' }}>No expenses yet</p>
              <p style={{ font: '600 11.5px Manrope', marginTop: '2px' }}>Tap + Add expense to log your first one</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTxs.map((tx) => {
                const catObj = safeCategories.find(c => c.id === tx.category) || { icon: '📦', name: tx.category };
                const bg = categoryColors[tx.category] || 'var(--accent)';

                return (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '13px 0', borderBottom: '1px solid var(--divider)' }}>
                    <div className="catic" style={{ width: '38px', height: '38px', background: bg, borderRadius: '50%' }}>
                      {catObj.icon || (tx.title || '?').charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ font: '600 13px Manrope', color: 'var(--text-main)' }}>{tx.title}</div>
                      <div style={{ font: '500 11px Manrope', color: 'var(--text-dim)', marginTop: '2px' }}>{catObj.name} · {tx.date}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--text-main)' }}>−{formatRupees(tx.amount)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
