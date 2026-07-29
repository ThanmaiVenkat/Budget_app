import React, { useState } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import { formatRupees } from '../utils/mockData';

export default function ExpensesTab({
  transactions = [],
  categories = [],
  members = [],
  activeMemberId = 'all',
  selectedMonth = '2026-07',
  setSelectedMonth,
  onDeleteTx,
  onOpenAddModal
}) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const safeTxs = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeMembers = Array.isArray(members) ? members : [];

  const filtered = safeTxs.filter(tx => {
    const titleText = (tx.title || '').toLowerCase();
    const notesText = (tx.notes || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = !search || titleText.includes(query) || notesText.includes(query);
    const matchesMember = activeMemberId === 'all' || tx.memberId === activeMemberId;
    const matchesMonth = selectedMonth === 'all' || (tx.date && tx.date.startsWith(selectedMonth));
    const matchesCategory = selectedCat === 'all' || tx.category === selectedCat;
    const matchesType = selectedType === 'all' || tx.type === selectedType;

    return matchesSearch && matchesMember && matchesMonth && matchesCategory && matchesType;
  }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const totalFilteredExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Search & Action Bar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.85rem' }}
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={onOpenAddModal}
          style={{ background: 'var(--orange-primary)', color: '#fff', border: 'none', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          title="Add Entry"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <select
          className="form-select"
          style={{ fontSize: '0.75rem', padding: '6px 10px', height: '32px', minWidth: '110px' }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
        >
          <option value="all">📅 All Months</option>
          <option value="2026-07">July 2026</option>
          <option value="2026-06">June 2026</option>
          <option value="2026-05">May 2026</option>
        </select>

        <select
          className="form-select"
          style={{ fontSize: '0.75rem', padding: '6px 10px', height: '32px', minWidth: '110px' }}
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          {safeCategories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ fontSize: '0.75rem', padding: '6px 10px', height: '32px', minWidth: '100px' }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Income Only</option>
        </select>
      </div>

      {/* Summary Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 4px' }}>
        <span>Showing {filtered.length} transactions</span>
        <span style={{ color: '#f87171', fontWeight: '700' }}>
          Total Spent: {formatRupees(totalFilteredExpense)}
        </span>
      </div>

      {/* Transactions Feed */}
      <div className="glass-card" style={{ padding: '8px 12px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '1.8rem', marginBottom: '8px' }}>💸</p>
            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>No expenses for selected filters</p>
            <p style={{ fontSize: '0.75rem' }}>Try clearing filters or add a new entry.</p>
          </div>
        ) : (
          filtered.map(tx => {
            const catObj = safeCategories.find(c => c.id === tx.category) || { icon: '💰', name: tx.category || 'Expense' };
            const memberObj = safeMembers.find(m => m.id === tx.memberId) || { avatar: '👤', name: 'Family' };

            return (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <span>{catObj.icon}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f3ece0' }}>{tx.title || 'Expense'}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: memberObj.color, fontWeight: '600' }}>{memberObj.avatar} {memberObj.name}</span>
                      <span>•</span>
                      <span>{tx.date || 'N/A'}</span>
                    </div>
                    {tx.notes && <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>"{tx.notes}"</span>}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: tx.type === 'income' ? '#34d399' : '#f3ece0' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupees(tx.amount || 0)}
                  </span>
                  <div>
                    <button
                      onClick={() => onDeleteTx && onDeleteTx(tx.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', marginTop: '2px' }}
                      title="Delete item"
                    >
                      <Trash2 size={13} color="#f87171" opacity={0.6} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
