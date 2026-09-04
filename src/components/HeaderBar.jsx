import React from 'react';
import { Download, FileSpreadsheet, Layers, PiggyBank, Wallet } from 'lucide-react';
import { exportTransactionsToCSV } from '../utils/storage';
import { getAvailableMonths } from '../utils/mockData';

export default function HeaderBar({
  transactions = [],
  members = [],
  categories = [],
  selectedMonth = '2026-07',
  setSelectedMonth,
  onOpenExcelModal,
  onOpenPersonal,
  isPersonalActive = false,
  activeDirection = '2b',
  setActiveDirection
}) {
  const handleExport = () => {
    exportTransactionsToCSV(transactions || [], members || [], categories || []);
  };

  const availableMonths = getAvailableMonths(transactions);

  const toggleDirection = () => {
    if (typeof setActiveDirection === 'function') {
      setActiveDirection(prev => (prev === '2b' ? '2c' : '2b'));
    }
  };

  return (
    <header className="header-bar">
      {/* Minimal Icon Badge & Currency (App Name removed) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'var(--accent-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-on-accent-strong)'
          }}
        >
          <Wallet size={18} />
        </div>
        <div style={{ font: '700 12px Manrope', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--accent-strong)', fontWeight: '800' }}>₹ INR</span>
          <span className="header-subtitle" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>• Household Budget</span>
        </div>
      </div>

      <div className="header-right">
        {/* Toggle View Mode Button (Hero vs Tiles) */}
        <button
          onClick={toggleDirection}
          className="header-view-toggle"
          style={{
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent-strong)',
            borderRadius: '999px',
            font: '700 11px Manrope',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Toggle view mode"
          aria-label="Toggle home screen layout"
        >
          <Layers size={12} /> <span className="header-toggle-label">{activeDirection === '2b' ? 'Hero' : 'Tiles'}</span>
        </button>

        {/* Month Selector Dropdown */}
        <select
          className="form-select header-month-select"
          style={{ font: '700 11px Manrope', background: 'var(--bg-card)', borderRadius: '999px', border: '1px solid var(--bg-card-border)', color: 'var(--text-main)' }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
          aria-label="Filter by month"
        >
          {availableMonths.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
          <option value="all">All Months</option>
        </select>

        {/* Personal Savings Tracker Toggle */}
        <button
          onClick={onOpenPersonal}
          className="header-icon-btn"
          style={{
            background: isPersonalActive ? 'var(--positive-tint)' : 'var(--positive-tint)',
            border: '1px solid var(--positive-border)',
            borderRadius: '50%',
            color: 'var(--positive)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="My Personal Savings Tracker"
          aria-label="Open personal savings tracker"
        >
          <PiggyBank size={14} />
        </button>

        {/* Upload Excel Button */}
        <button
          onClick={onOpenExcelModal}
          className="header-icon-btn"
          style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-border)', borderRadius: '50%', color: 'var(--accent-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Upload Excel / CSV Sheet"
          aria-label="Upload Excel or CSV sheet"
        >
          <FileSpreadsheet size={14} />
        </button>

        <button
          onClick={handleExport}
          className="header-icon-btn"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Export CSV Data"
          aria-label="Export transactions as CSV"
        >
          <Download size={15} />
        </button>
      </div>
    </header>
  );
}
