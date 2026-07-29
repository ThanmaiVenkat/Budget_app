import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Users, Calendar } from 'lucide-react';
import { formatRupees } from '../utils/mockData';

export default function GraphsTab({
  transactions = [],
  categories = [],
  members = [],
  activeMemberId = 'all',
  selectedMonth = '2026-07',
  setSelectedMonth
}) {
  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeMembers = Array.isArray(members) ? members : [];

  // Filter transactions by selected month AND active family member
  const monthTxs = safeTxs.filter(t => {
    const matchesMember = activeMemberId === 'all' || t.memberId === activeMemberId;
    const matchesMonth = selectedMonth === 'all' || (t.date && t.date.startsWith(selectedMonth));
    return matchesMember && matchesMonth;
  });

  const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);

  // 1. RECHARTS DONUT DATA: Category Breakdown
  const categoryChartData = safeCategories.map(cat => {
    const value = monthTxs
      .filter(t => t.category === cat.id && t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return {
      name: cat.name || cat.id,
      icon: cat.icon || '📦',
      value: value,
      color: cat.color || '#f26a1b'
    };
  }).filter(c => c.value > 0);

  // 2. RECHARTS HORIZONTAL BAR DATA: Per-member spending comparison
  const memberChartData = safeMembers.filter(m => m.id !== 'all').map(mem => {
    const spent = monthTxs
      .filter(t => t.memberId === mem.id && t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return {
      name: (mem.name || 'Member').split(' ')[0],
      fullTitle: mem.name || 'Member',
      spent: spent,
      avatar: mem.avatar || '👤',
      fill: mem.color || '#3b82f6'
    };
  }).sort((a, b) => b.spent - a.spent);

  // 3. RECHARTS MONTHLY TREND DATA (Income vs Expense over past 4 months)
  const monthTrendKeys = ['2026-07', '2026-06', '2026-05', '2026-04'];
  const monthlyTrendData = monthTrendKeys.map(mKey => {
    const txs = safeTxs.filter(t => (activeMemberId === 'all' || t.memberId === activeMemberId) && t.date && t.date.startsWith(mKey));
    const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const monthName = new Date(mKey + '-01').toLocaleString('default', { month: 'short' });
    return {
      month: monthName,
      Income: income,
      Expense: expense
    };
  }).reverse();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entryPayload = payload[0]?.payload || {};
      return (
        <div style={{ background: '#211c15', border: '1px solid #2f281f', padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem', color: '#f3ece0' }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>{payload[0].name || entryPayload.name}</div>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color || entry.fill || '#f9812f' }}>
              {entry.name}: <b>{formatRupees(entry.value || 0)}</b>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Month Filter Bar */}
      <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#f9812f" />
          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Filter Period</span>
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700' }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
        >
          <option value="2026-07">July 2026</option>
          <option value="2026-06">June 2026</option>
          <option value="2026-05">May 2026</option>
          <option value="all">📅 All Time</option>
        </select>
      </div>

      {/* CHART 1: RECHARTS DONUT CATEGORY BREAKDOWN */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={18} color="#f9812f" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Category Expense Donut</h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Total: {formatRupees(totalExpense)}
          </span>
        </div>

        {categoryChartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            No expenses recorded for this filter.
          </div>
        ) : (
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: '#8a7d6d', fontSize: '0.72rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* CHART 2: PER-MEMBER SPENDING COMPARISON */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Users size={18} color="#5ec39d" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Who Spent Most (Member Share)</h3>
        </div>

        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={memberChartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#8a7d6d" tick={{ fontSize: 12 }} width={55} />
              <Tooltip formatter={(val) => formatRupees(val)} />
              <Bar dataKey="spent" name="Spent" radius={[0, 6, 6, 0]} barSize={18}>
                {memberChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 3: MONTHLY INCOME VS EXPENSE COMPARISON */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart3 size={18} color="#f9812f" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Monthly Income vs Expenses</h3>
        </div>

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#8a7d6d" tick={{ fontSize: 12 }} />
              <YAxis stroke="#8a7d6d" tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip formatter={(val) => formatRupees(val)} />
              <Legend formatter={(value) => <span style={{ color: '#8a7d6d', fontSize: '0.72rem' }}>{value}</span>} />
              <Bar dataKey="Income" fill="#5ec39d" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
