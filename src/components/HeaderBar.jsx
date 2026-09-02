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
            background: 'linear-gradient(135deg, #f9812f 0%, #e8590c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(242, 106, 27, 0.4)',
            color: '#ffffff'
          }}
        >
          <Wallet size={18} />
        </div>
        <div style={{ font: '700 12px Manrope', color: '#f3ece0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#f9812f', fontWeight: '800' }}>₹ INR</span>
          <span className="header-subtitle" style={{ color: '#8a7d6d', fontSize: '10px' }}>• Household Budget</span>
        </div>
      </div>

      <div className="header-right">
        {/* Toggle View Mode Button (Hero vs Tiles) */}
        <button
          onClick={toggleDirection}
          className="header-view-toggle"
          style={{
            background: 'rgba(242, 106, 27, 0.15)',
            border: '1px solid rgba(242, 106, 27, 0.3)',
            color: '#f9812f',
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
          style={{ font: '700 11px Manrope', background: '#211c15', borderRadius: '999px', border: '1px solid #2f281f', color: '#f3ece0' }}
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
            background: isPersonalActive ? 'rgba(52, 211, 153, 0.25)' : 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            borderRadius: '50%',
            color: '#34d399',
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
          style={{ background: 'rgba(242,106,27,0.15)', border: '1px solid rgba(242,106,27,0.3)', borderRadius: '50%', color: '#f9812f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Upload Excel / CSV Sheet"
          aria-label="Upload Excel or CSV sheet"
        >
          <FileSpreadsheet size={14} />
        </button>

        <button
          onClick={handleExport}
          className="header-icon-btn"
          style={{ background: 'none', border: 'none', color: '#8a7d6d', cursor: 'pointer' }}
          title="Export CSV Data"
          aria-label="Export transactions as CSV"
        >
          <Download size={15} />
        </button>
      </div>
    </header>
  );
}
