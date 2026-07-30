import React from 'react';
import { Download, FileSpreadsheet, Wallet, RotateCcw } from 'lucide-react';
import { exportTransactionsToCSV } from '../utils/storage';
import { getMonthOptions, getCurrentMonth } from '../utils/dates';

export default function HeaderBar({
  transactions = [],
  members = [],
  categories = [],
  onReset,
  selectedMonth = getCurrentMonth(),
  setSelectedMonth,
  onOpenExcelModal
}) {
  const monthOptions = getMonthOptions(transactions);
  const handleExport = () => {
    exportTransactionsToCSV(transactions || [], members || [], categories || []);
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
          <span style={{ color: '#8a7d6d', fontSize: '10px' }}>• Household Budget</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Month Selector Dropdown */}
        <select
          className="form-select"
          style={{ padding: '4px 8px', font: '700 11px Manrope', height: '30px', background: '#211c15', borderRadius: '999px', border: '1px solid #2f281f', color: '#f3ece0' }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth && setSelectedMonth(e.target.value)}
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Upload Excel Button */}
        <button
          onClick={onOpenExcelModal}
          style={{ background: 'rgba(242,106,27,0.15)', border: '1px solid rgba(242,106,27,0.3)', borderRadius: '50%', width: '30px', height: '30px', color: '#f9812f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Upload Excel / CSV Sheet"
        >
          <FileSpreadsheet size={14} />
        </button>

        <button
          onClick={handleExport}
          style={{ background: 'none', border: 'none', color: '#8a7d6d', cursor: 'pointer', padding: '4px' }}
          title="Export CSV Data"
        >
          <Download size={15} />
        </button>

        {typeof onReset === 'function' && (
          <button
            onClick={onReset}
            style={{ background: 'none', border: 'none', color: '#8a7d6d', cursor: 'pointer', padding: '4px' }}
            title="Reset all data to sample dataset"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>
    </header>
  );
}
