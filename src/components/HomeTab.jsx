import React from 'react';
import { formatRupees } from '../utils/mockData';

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
  onNavigateToGraphs,
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
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 62000;

  const totalBudgetLimit = safeCategories.reduce((sum, c) => sum + (c.limit || 0), 0) || 90000;
  const remainingBudget = Math.max(0, totalBudgetLimit - totalExpense);
  const budgetUtilization = Math.min(100, Math.round((totalExpense / totalBudgetLimit) * 100));

  const activeMember = safeMembers.find(m => m.id === activeMemberId) || { name: 'Our Family', avatar: '👨‍👩‍👧‍👦' };

  // Category Colors matching design doc
  const categoryColors = {
    groceries: '#f26a1b',
    education: '#e0785a',
    housing: '#d99a3a',
    utilities: '#d99a3a',
    dining: '#3e9e7e',
    entertainment: '#3e9e7e',
    health: '#06b6d4',
    transport: '#14b8a6',
    shopping: '#f43f5e'
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
            <div style={{ font: '800 22px Manrope', color: '#f3ece0' }}>Hey, {activeMember.name}!</div>
            <div style={{ font: '600 12.5px Manrope', color: '#c08a52', marginTop: '2px' }}>Let's keep July on budget 🎯</div>
          </div>
          <div className="avat" style={{ background: '#f26a1b', width: '40px', height: '40px', fontSize: '18px' }}>
            {activeMember.avatar || '👨‍👩‍👧‍👦'}
          </div>
        </div>

        {/* Radial Black Card */}
        <div style={{ background: '#000', borderRadius: '24px', padding: '22px', position: 'relative', overflow: 'hidden', border: '1px solid #2f281f' }}>
          <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle,#f9812f,#e8590c)' }} />
          <div style={{ font: '600 11.5px Manrope', color: 'rgba(255,255,255,0.55)', letterSpacing: '.03em', position: 'relative' }}>
            TOTAL SPENT / {formatRupees(totalBudgetLimit)} BUDGET
          </div>
          <div style={{ font: '800 40px Manrope', color: '#fff', letterSpacing: '-.02em', marginTop: '6px', position: 'relative' }}>
            {formatRupees(totalExpense)}
          </div>
          <div style={{ height: '9px', borderRadius: '6px', background: 'rgba(255,255,255,0.14)', overflow: 'hidden', marginTop: '14px', position: 'relative' }}>
            <i style={{ display: 'block', height: '100%', width: `${budgetUtilization}%`, background: 'linear-gradient(90deg,#f9812f,#f26a1b)', borderRadius: '6px' }} />
          </div>
          <div style={{ font: '700 12px Manrope', color: '#ffd9b8', marginTop: '9px', position: 'relative' }}>
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
          <div style={{ font: '800 15px Manrope', color: '#f3ece0', marginBottom: '12px' }}>Where it's going</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {safeCategories.slice(0, 4).map((cat) => {
              const spent = filteredTxs
                .filter(t => t.category === cat.id && t.type === 'expense')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
              const pct = cat.limit > 0 ? Math.min(100, Math.round((spent / cat.limit) * 100)) : 0;
              const bg = categoryColors[cat.id] || cat.color || '#f26a1b';

              return (
                <div key={cat.id} style={{ background: bg, borderRadius: '20px', padding: '16px', color: '#fff' }}>
                  <div style={{ font: '800 15px Manrope' }}>{cat.icon} {cat.name.split(' ')[0]}</div>
                  <div style={{ font: '800 22px Manrope', marginTop: '12px' }}>{formatRupees(spent)}</div>
                  <div style={{ font: '600 11px Manrope', color: 'rgba(255,255,255,0.8)' }}>
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
    <div style={{ margin: '-16px -20px 0 -20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Orange Panel */}
      <div style={{ background: 'linear-gradient(155deg, #f9812f, #e8590c)', padding: '20px 24px 26px 24px', flex: 'none', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ font: '700 14px Manrope', color: '#fff' }}>Hi, {activeMember.name} 👋</div>
          <div className="avat" style={{ background: 'rgba(0,0,0,0.22)', width: '38px', height: '38px', fontSize: '18px' }}>
            {activeMember.avatar || '👨‍👩‍👧‍👦'}
          </div>
        </div>

        <div style={{ font: '600 12px Manrope', color: 'rgba(255,255,255,0.85)', marginTop: '22px', letterSpacing: '.03em' }}>SPENT THIS MONTH</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
          <div style={{ font: '800 42px Manrope', color: '#fff', letterSpacing: '-.02em' }}>{formatRupees(totalExpense)}</div>
          <div style={{ font: '700 14px Manrope', color: 'rgba(255,255,255,0.8)' }}>of {formatRupees(totalBudgetLimit)}</div>
        </div>

        <div style={{ height: '9px', borderRadius: '6px', background: 'rgba(0,0,0,0.22)', overflow: 'hidden', marginTop: '14px' }}>
          <i style={{ display: 'block', height: '100%', width: `${budgetUtilization}%`, background: '#fff', borderRadius: '6px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', font: '700 12px Manrope', color: 'rgba(255,255,255,0.9)' }}>
          <span>{budgetUtilization}% used</span>
          <span>{formatRupees(remainingBudget)} left · 11 days</span>
        </div>
      </div>

      {/* Content Below Panel */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Action Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button className="action-pill" onClick={onOpenAddModal}>＋ Add expense</button>
          <button className="action-pill secondary" onClick={onOpenAddModal}>Scan receipt</button>
          <button className="action-pill secondary" onClick={onNavigateToBudgets}>Split</button>
        </div>

        {/* 2 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#211c15', border: '1px solid #2f281f', borderRadius: '18px', padding: '16px' }} onClick={onNavigateToGraphs} className="cursor-pointer">
            <div style={{ font: '600 11px Manrope', color: '#8a7d6d' }}>Daily average</div>
            <div style={{ font: '800 20px Manrope', color: '#f3ece0', marginTop: '4px' }}>₹3,100</div>
            <div style={{ font: '700 11px Manrope', color: '#5ec39d', marginTop: '2px' }}>↓ 8% vs June</div>
          </div>

          <div style={{ background: '#211c15', border: '1px solid #2f281f', borderRadius: '18px', padding: '16px' }} onClick={onNavigateToBudgets} className="cursor-pointer">
            <div style={{ font: '600 11px Manrope', color: '#8a7d6d' }}>Bills due soon</div>
            <div style={{ font: '800 20px Manrope', color: '#f3ece0', marginTop: '4px' }}>₹7,750</div>
            <div style={{ font: '700 11px Manrope', color: '#f9812f', marginTop: '2px' }}>{upcomingBills.length || 3} upcoming</div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div style={{ font: '800 15px Manrope', color: '#f3ece0' }}>Recent</div>
            <div style={{ font: '600 12px Manrope', color: '#f9812f', cursor: 'pointer' }} onClick={onNavigateToExpenses}>All activity</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTxs.map((tx) => {
              const catObj = safeCategories.find(c => c.id === tx.category) || { icon: '📦', name: tx.category };
              const bg = categoryColors[tx.category] || '#f26a1b';

              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="catic" style={{ width: '42px', height: '42px', background: bg, borderRadius: '13px' }}>
                    {catObj.icon || tx.title.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '700 13.5px Manrope', color: '#f3ece0' }}>{tx.title}</div>
                    <div style={{ font: '600 11.5px Manrope', color: '#8a7d6d' }}>{catObj.name} · {tx.date}</div>
                  </div>
                  <div style={{ font: '800 14px Manrope', color: '#f3ece0' }}>-{formatRupees(tx.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
