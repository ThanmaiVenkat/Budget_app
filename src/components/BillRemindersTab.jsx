import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Circle, RefreshCw, Pencil, Trash2,
  Bell, BellRing, Camera, FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  formatRupees, getBillBadgeStatus, generateId, billDaysUntil,
  todayISO, addDaysISO, getNextRecurrenceDate
} from '../utils/mockData';
import { compressImageFile } from '../utils/imageCompressor';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  scheduleBillReminders,
  sendInstantNotification
} from '../utils/notificationService';
import Emoji from './Emoji';
import ReceiptModal from './ReceiptModal';

export default function BillRemindersTab({
  bills = [],
  members = [],
  categories = [],
  onToggleBillPaid,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onRecordExpense
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => addDaysISO(todayISO(), 5));
  const realMembers = members.filter(m => m.id !== 'all');
  const [payer, setPayer] = useState(realMembers[0]?.id || '');
  const [frequency, setFrequency] = useState('monthly');
  const [category, setCategory] = useState(categories[0]?.id || 'utilities');
  const [autoRecordExpense, setAutoRecordExpense] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [activeReceiptBill, setActiveReceiptBill] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const fileInputRef = useRef(null);

  // Check notification status on mount
  useEffect(() => {
    let mounted = true;
    getNotificationPermissionStatus().then((status) => {
      if (mounted) {
        setNotificationsEnabled(status === 'granted');
      }
    });
    return () => { mounted = false; };
  }, []);

  // Auto-schedule bill reminders whenever bills or notification status change
  useEffect(() => {
    if (notificationsEnabled) {
      scheduleBillReminders(bills);
    }
  }, [bills, notificationsEnabled]);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      alert('Due date reminders are currently active. You can manage notifications in device settings.');
      return;
    }

    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      await scheduleBillReminders(bills);
      await sendInstantNotification(
        '🔔 Bill Reminders Enabled!',
        "You'll receive alerts 3 days and 1 day before your bills are due."
      );
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } else {
      alert('Notification permissions are required to receive 1-day and 3-day bill due date alerts.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 900, 0.75);
      setReceipt(compressedDataUrl);
    } catch {
      alert('Could not attach bill photo. Please try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDueDate(addDaysISO(todayISO(), 5));
    setPayer(realMembers[0]?.id || '');
    setFrequency('monthly');
    setCategory(categories[0]?.id || 'utilities');
    setAutoRecordExpense(true);
    setReceipt(null);
    setEditingBillId(null);
    setShowAdd(false);
  };

  const handleStartEdit = (bill) => {
    setEditingBillId(bill.id);
    setTitle(bill.title);
    setAmount(String(bill.amount));
    setDueDate(/^\d{4}-\d{2}-\d{2}$/.test(bill.dueDate || '') ? bill.dueDate : todayISO());
    setPayer(bill.payer || realMembers[0]?.id || '');
    setFrequency(bill.frequency || 'monthly');
    setCategory(bill.category || categories[0]?.id || 'utilities');
    setAutoRecordExpense(bill.autoRecordExpense ?? true);
    setReceipt(bill.receipt || null);
    setShowAdd(true);
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm('Delete this bill reminder?') && onDeleteBill) {
      onDeleteBill(billId);
    }
  };

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!title || !amount || !dueDate) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingBillId) {
      if (onUpdateBill) {
        onUpdateBill(editingBillId, {
          title,
          amount: parsedAmount,
          dueDate,
          payer,
          frequency,
          category,
          autoRecordExpense,
          ...(receipt ? { receipt } : { receipt: null })
        });
      }
    } else {
      onAddBill({
        id: generateId('b'),
        title,
        amount: parsedAmount,
        dueDate,
        paid: false,
        payer,
        frequency,
        category,
        autoRecordExpense,
        ...(receipt ? { receipt } : {})
      });
    }

    resetForm();
  };

  const handlePayAndRecord = (bill) => {
    const isNowPaid = !bill.paid;

    // If marking as paid, record as expense if enabled
    if (isNowPaid) {
      if (bill.autoRecordExpense !== false && onRecordExpense) {
        onRecordExpense({
          id: generateId('tx'),
          date: todayISO(),
          type: 'expense',
          title: bill.title,
          amount: bill.amount,
          category: bill.category || 'utilities',
          memberId: bill.payer || realMembers[0]?.id || '',
          paymentMethod: 'UPI',
          notes: `Auto-logged from bill reminder (${bill.frequency || 'monthly'})`,
          ...(bill.receipt ? { receipt: bill.receipt } : {})
        });
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }

    // Toggle paid status
    if (onToggleBillPaid) {
      onToggleBillPaid(bill.id);
    }
  };

  const handleAdvanceRecurrence = (bill) => {
    const nextDate = getNextRecurrenceDate(bill.dueDate, bill.frequency || 'monthly');
    if (onUpdateBill) {
      onUpdateBill(bill.id, {
        dueDate: nextDate,
        paid: false
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* NOTIFICATION STATUS BANNER */}
      <div
        className="glass-card"
        style={{
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: notificationsEnabled ? 'var(--positive-tint)' : 'var(--bg-card)',
          border: `1px solid ${notificationsEnabled ? 'var(--positive-border)' : 'var(--bg-card-border)'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {notificationsEnabled ? (
            <BellRing size={18} color="var(--positive)" />
          ) : (
            <Bell size={18} color="var(--accent-strong)" />
          )}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {notificationsEnabled ? 'Due Date Push Alerts Active' : 'Due Date Alerts (1 & 3 Days)'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {notificationsEnabled
                ? 'Alerts scheduled 3 days & 1 day before bill deadlines.'
                : 'Get reminded 1 & 3 days before bills are due.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleNotifications}
          style={{
            background: notificationsEnabled ? 'var(--bg-page)' : 'var(--accent-tint)',
            border: `1px solid ${notificationsEnabled ? 'var(--positive-border)' : 'var(--accent-border)'}`,
            color: notificationsEnabled ? 'var(--positive)' : 'var(--accent-strong)',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {notificationsEnabled ? 'Active ✓' : 'Enable Alerts'}
        </button>
      </div>

      {/* RECURRING BILL REMINDERS CARD */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Recurring Household Bills & Subscriptions</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Auto-logs to expenses when marked paid
            </span>
          </div>
          <button
            onClick={() => (showAdd ? resetForm() : setShowAdd(true))}
            style={{
              background: 'var(--positive-tint)',
              border: '1px solid var(--positive-border)',
              color: 'var(--positive-strong)',
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {showAdd ? 'Cancel' : '+ New Bill'}
          </button>
        </div>

        {/* Bill Entry/Edit Form */}
        {showAdd && (
          <form onSubmit={handleCreateBill} style={{ background: 'var(--hairline)', padding: '14px', borderRadius: '16px', marginBottom: '16px', border: '1px solid var(--bg-card-border)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px' }}>
              {editingBillId ? 'Edit Bill Reminder' : 'Add Bill Reminder'}
            </h4>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Bill / Subscription Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. WiFi Bill / Netflix / Rent / Electricity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="999"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Next Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Frequency</label>
                <select
                  className="form-select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="monthly">🔄 Monthly</option>
                  <option value="weekly">📅 Weekly</option>
                  <option value="quarterly">🗓️ Quarterly</option>
                  <option value="yearly">⭐ Yearly</option>
                  <option value="one-time">⚡ One-time</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Payer / Responsible Member</label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                {realMembers.map((m) => {
                  const isSelected = payer === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayer(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: isSelected ? 'var(--positive-tint)' : 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'var(--positive)' : 'var(--bg-card-border)'}`,
                        color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      <Emoji size="15px">{m.avatar || '👤'}</Emoji>
                      <span>{(m.name || 'Member').split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Invoice / Bill Photo Attachment */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Invoice / Bill Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {receipt ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--accent-border)', borderRadius: '10px', padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={receipt}
                      alt="Invoice thumbnail"
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--bg-card-border)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Invoice attached</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--positive)' }}>Will auto-forward when paid</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    style={{ background: 'var(--danger-tint)', border: 'none', borderRadius: '6px', color: 'var(--danger)', padding: '6px', cursor: 'pointer', display: 'flex' }}
                    title="Remove invoice"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    background: 'var(--bg-card)',
                    border: '1px dashed var(--accent-border)',
                    borderRadius: '10px',
                    padding: '8px',
                    color: 'var(--accent-strong)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: isCompressing ? 'default' : 'pointer'
                  }}
                >
                  <Camera size={14} />
                  <span>{isCompressing ? 'Compressing invoice photo…' : 'Attach Bill / Invoice Photo'}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', cursor: 'pointer' }} onClick={() => setAutoRecordExpense(!autoRecordExpense)}>
              <input
                type="checkbox"
                id="autoRecordCheckbox"
                checked={autoRecordExpense}
                onChange={(e) => setAutoRecordExpense(e.target.checked)}
                style={{ accentColor: 'var(--accent-strong)', cursor: 'pointer' }}
              />
              <label htmlFor="autoRecordCheckbox" style={{ fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600' }}>
                Auto-record as expense in budget ledger upon payment
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '9px', fontSize: '0.85rem' }}>
              {editingBillId ? 'Update Bill' : 'Save Bill Reminder'}
            </button>
          </form>
        )}

        {bills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-dim)' }}>
            <p style={{ marginBottom: '6px' }}><Emoji size="1.6rem">📅</Emoji></p>
            <p style={{ font: '700 13px Manrope', color: 'var(--text-muted)' }}>No bills added yet</p>
            <p style={{ font: '500 11.5px Manrope', marginTop: '2px' }}>Add recurring bills to track due dates & auto-log expenses</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bills.map((b) => {
              const memberObj = members.find(m => m.id === b.payer) || { avatar: '👤', name: 'Family' };
              const badge = getBillBadgeStatus(billDaysUntil(b), b.paid);
              const isRecurring = b.frequency && b.frequency !== 'one-time';

              return (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: b.paid ? 'var(--positive-tint)' : 'var(--bg-card)',
                    border: `1px solid ${b.paid ? 'var(--positive-border)' : 'var(--bg-card-border)'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Left toggle & info */}
                  <div
                    onClick={() => handlePayAndRecord(b)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, cursor: 'pointer' }}
                  >
                    {b.paid ? (
                      <CheckCircle2 size={22} color="var(--positive-strong)" style={{ flexShrink: 0 }} />
                    ) : (
                      <Circle size={22} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', textDecoration: b.paid ? 'line-through' : 'none', color: b.paid ? 'var(--text-muted)' : 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.title}
                        </span>
                        {isRecurring && (
                          <span style={{ fontSize: '0.62rem', background: 'var(--bg-card-hover)', border: '1px solid var(--bg-card-border)', color: 'var(--text-dim)', padding: '1px 6px', borderRadius: '6px', fontWeight: '700', textTransform: 'capitalize' }}>
                            {b.frequency}
                          </span>
                        )}
                        {b.receipt && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReceiptBill(b);
                            }}
                            title="View attached bill invoice"
                            style={{
                              background: 'var(--accent-tint)',
                              border: '1px solid var(--accent-border)',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.6rem',
                              color: 'var(--accent-strong)',
                              fontWeight: '700'
                            }}
                          >
                            <FileText size={10} /> Bill
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span>Paid by</span>
                        <Emoji size="0.8rem">{memberObj.avatar}</Emoji>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{memberObj.name}</span>
                        <span>•</span>
                        <span>{b.dueDate || 'No date'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Badges */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: '800', color: b.paid ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {formatRupees(b.amount)}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color
                        }}
                      >
                        {badge.text}
                      </span>

                      {b.paid && isRecurring && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAdvanceRecurrence(b); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: 'var(--accent-tint)',
                            border: '1px solid var(--accent-border)',
                            color: 'var(--accent-strong)',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontSize: '0.62rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                          title="Advance to next billing cycle"
                        >
                          <RefreshCw size={9} /> Next
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(b); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        title="Edit bill"
                        aria-label={`Edit ${b.title || 'bill'}`}
                      >
                        <Pencil size={13} opacity={0.65} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteBill(b.id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        title="Delete bill"
                        aria-label={`Delete ${b.title || 'bill'}`}
                      >
                        <Trash2 size={13} opacity={0.65} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill Invoice Viewer Modal */}
      {activeReceiptBill && (
        <ReceiptModal
          receiptUrl={activeReceiptBill.receipt}
          title={activeReceiptBill.title}
          amount={activeReceiptBill.amount}
          date={activeReceiptBill.dueDate}
          onClose={() => setActiveReceiptBill(null)}
          onRemoveReceipt={() => {
            if (onUpdateBill) {
              onUpdateBill(activeReceiptBill.id, { receipt: null });
            }
            setActiveReceiptBill(null);
          }}
        />
      )}

    </div>
  );
}
