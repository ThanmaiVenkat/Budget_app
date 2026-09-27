import React from 'react';
import { X, Download, Trash2, Receipt } from 'lucide-react';
import { formatRupees } from '../utils/mockData';

export default function ReceiptModal({ receiptUrl, title, amount, date, onClose, onRemoveReceipt }) {
  if (!receiptUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `receipt-${(title || 'expense').toLowerCase().replace(/\s+/g, '-')}-${date || 'date'}.webp`;
    link.click();
  };

  return (
    <div
      className="sheet-overlay"
      style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          background: 'var(--bg-sheet)',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={18} color="var(--accent-strong)" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {title || 'Receipt Image'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {amount ? formatRupees(amount) : ''} {date ? `• ${date}` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card-hover)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
            aria-label="Close receipt"
          >
            <X size={16} />
          </button>
        </div>

        {/* Receipt Image Display */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: '12px',
            background: 'var(--bg-shell)',
            border: '1px solid var(--bg-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '260px',
            maxHeight: '60vh',
            padding: '8px'
          }}
        >
          <img
            src={receiptUrl}
            alt={title || 'Receipt'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '8px' }}>
          {onRemoveReceipt ? (
            <button
              onClick={() => {
                if (window.confirm('Remove this receipt from transaction?')) {
                  onRemoveReceipt();
                  onClose();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--danger-tint)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={13} /> Remove
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-main)',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Download size={13} /> Save Image
            </button>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{
                padding: '7px 18px',
                borderRadius: '10px',
                fontSize: '0.78rem'
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
