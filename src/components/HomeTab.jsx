import React from 'react';
import { Users } from 'lucide-react';
import { formatRupees } from '../utils/mockData';
import { getMonthProgress, getCurrentMonth } from '../utils/dates';

export default function HomeTab({
  transactions = [],
  categories = [],
  members = [],
  bills = [],
  activeMemberId = 'all',
  selectedMonth = getCurrentMonth(),
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
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalBudgetLimit = safeCategories.reduce((sum, c) => sum + (c.limit || 0), 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalExpense);
  const budgetUtilization = totalBudgetLimit > 0 ? Math.min(100, Math.round((totalExpense / totalBudgetLimit) * 100)) : 0;

  const activeMember = safeMembers.find(m => m.id === activeMemberId) || { id: 'all', name: 'Our Family' };

  const recentTxs = [...filteredTxs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  const upcomingBills = safeBills.filter(b => !b.paid && (b.daysUntilDue || 0) <= 7);
  const upcomingBillsTotal = upcomingBills.reduce((sum, b) => sum + (b.amount || 0), 0);

  const { daysElapsed, daysRemaining } = getMonthProgress(selectedMonth);
  const dailyAverage = daysElapsed > 0 ? Math.round(totalExpense / daysElapsed) : 0;

  return (
    <div style={{ margin: '-16px -20px 0 -20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Orange Panel */}
      <div style={{ background: 'linear-gradient(155deg, #f9812f, #e8590c)', padding: '20px 24px 26px 24px', flex: 'none', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ font: '700 14px Manrope', color: '#fff' }}>Hi, {activeMember.name} 👋</div>
          <div className="avat" style={{ background: 'rgba(0,0,0,0.22)', width: '38px', height: '38px', fontSize: '18px' }}>
            {activeMember.id === 'all'
              ? <Users size={18} color="#fff" />
              : (activeMember.avatar || <Users size={18} color="#fff" />)}
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
          <span>{formatRupees(remainingBudget)} left{selectedMonth === getCurrentMonth() ? ` · ${daysRemaining} days` : ''}</span>
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
            <div style={{ font: '800 20px Manrope', color: '#f3ece0', marginTop: '4px' }}>{formatRupees(dailyAverage)}</div>
            <div style={{ font: '700 11px Manrope', color: '#8a7d6d', marginTop: '2px' }}>over {daysElapsed} day{daysElapsed === 1 ? '' : 's'}</div>
          </div>

          <div style={{ background: '#211c15', border: '1px solid #2f281f', borderRadius: '18px', padding: '16px' }} onClick={onNavigateToBudgets} className="cursor-pointer">
            <div style={{ font: '600 11px Manrope', color: '#8a7d6d' }}>Bills due soon</div>
            <div style={{ font: '800 20px Manrope', color: '#f3ece0', marginTop: '4px' }}>{formatRupees(upcomingBillsTotal)}</div>
            <div style={{ font: '700 11px Manrope', color: '#f9812f', marginTop: '2px' }}>{upcomingBills.length} upcoming</div>
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
              const catObj = safeCategories.find(c => c.id === tx.category) || { icon: '📦', name: tx.category, color: '#f26a1b' };
              const bg = catObj.color || '#f26a1b';

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
