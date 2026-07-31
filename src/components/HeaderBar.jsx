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
        {/* Currency dropped from the label — every amount in the app already
            shows ₹, so "₹ INR • Household Budget" was redundant text that
            wrapped to two lines and crowded the controls on the right. */}
        <span style={{ font: '700 13px Manrope', color: '#f3ece0', whiteSpace: 'nowrap' }}>Household Budget</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

        {/* Upload Excel Button (primary — matches the month pill's orange accent) */}
        <button
          onClick={onOpenExcelModal}
          style={iconBtnStyle('rgba(242,106,27,0.15)', 'rgba(242,106,27,0.3)', '#f9812f')}
          title="Upload Excel / CSV Sheet"
        >
          <FileSpreadsheet size={14} />
        </button>

        {/* Secondary utilities — same shape/size as the upload button, muted so they don't compete */}
        <button
          onClick={handleExport}
          style={iconBtnStyle('#211c15', '#2f281f', '#8a7d6d')}
          title="Export CSV Data"
        >
          <Download size={14} />
        </button>

        {typeof onReset === 'function' && (
          <button
            onClick={onReset}
            style={iconBtnStyle('#211c15', '#2f281f', '#8a7d6d')}
            title="Reset all data to sample dataset"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </header>
  );
}

const iconBtnStyle = (background, border, color) => ({
  background,
  border: `1px solid ${border}`,
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  color,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none'
});
