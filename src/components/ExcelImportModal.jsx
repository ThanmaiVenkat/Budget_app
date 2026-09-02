import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle, Download, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseExcelSpreadsheet, downloadSampleExcelTemplate } from '../utils/excelParser';
import { formatRupees } from '../utils/mockData';

export default function ExcelImportModal({ categories, members, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResult, setParsedResult] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setLoading(true);

    try {
      const result = await parseExcelSpreadsheet(selectedFile, categories, members);
      setParsedResult(result);
    } catch (err) {
      setError(err.message || 'Could not parse Excel file. Please ensure it is a valid .xlsx or .csv document.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedResult || parsedResult.transactions.length === 0) return;

    onImportSuccess(parsedResult);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.7 }
    });

    onClose();
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Auto Excel / CSV Importer</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
          Upload any Excel sheet (<b>.xlsx</b>, <b>.xls</b>) or <b>.csv</b>. Our smart AI parser automatically detects columns for dates, amounts, categories, and family members!
        </p>

        {/* Upload Drop Zone */}
        <label
          style={{
            border: '2px dashed var(--primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'rgba(16, 185, 129, 0.05)',
            cursor: 'pointer',
            marginBottom: '16px',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Upload size={32} color="var(--primary)" />
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {file ? file.name : 'Tap or Drag Excel / CSV File Here'}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Supports .xlsx, .xls, .csv files
            </div>
          </div>
        </label>

        {/* Action button to download sample template */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={downloadSampleExcelTemplate}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--secondary)',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Download size={14} /> Download Sample Excel Template
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
            ⚡ Parsing spreadsheet automatically...
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.78rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Parsed Preview Card */}
        {parsedResult && (
          <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '16px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>
                Successfully Detected {parsedResult.totalRows} Transactions!
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• Auto-mapped <b>{parsedResult.transactions.length}</b> expense & income entries</div>
              {parsedResult.newCategories.length > 0 && (
                <div>• Created <b>{parsedResult.newCategories.length}</b> new categories</div>
              )}
              {parsedResult.newMembers.length > 0 && (
                <div>• Detected <b>{parsedResult.newMembers.length}</b> new family members</div>
              )}
            </div>

            {parsedResult.skippedRows && parsedResult.skippedRows.length > 0 && (
              <div style={{ marginTop: '10px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '10px', padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--danger)' }}>
                  <AlertCircle size={14} /> Skipped {parsedResult.skippedRows.length} row{parsedResult.skippedRows.length > 1 ? 's' : ''}
                </div>
                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '80px', overflowY: 'auto' }}>
                  {parsedResult.skippedRows.slice(0, 5).map((s, i) => (
                    <div key={i} style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Row {s.row}: {s.reason}
                    </div>
                  ))}
                  {parsedResult.skippedRows.length > 5 && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      + {parsedResult.skippedRows.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Preview List */}
            <div style={{ marginTop: '10px', maxHeight: '120px', overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
              {parsedResult.transactions.slice(0, 3).map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '3px 0' }}>
                  <span>{tx.title} ({tx.date})</span>
                  <span style={{ fontWeight: '700', color: tx.type === 'income' ? 'var(--primary)' : 'var(--text-main)' }}>
                    {formatRupees(tx.amount)}
                  </span>
                </div>
              ))}
              {parsedResult.transactions.length > 3 && (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '4px' }}>
                  + {parsedResult.transactions.length - 3} more items ready
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmImport}
              className="btn-primary"
              style={{ marginTop: '12px' }}
            >
              🚀 Import All {parsedResult.totalRows} Items Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
