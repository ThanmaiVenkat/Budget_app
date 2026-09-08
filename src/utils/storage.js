import { DEFAULT_CATEGORIES } from './mockData';

const KEYS = {
  TRANSACTIONS: 'family_budget_transactions_v4',
  MEMBERS: 'family_budget_members_v4',
  CATEGORIES: 'family_budget_categories_v4',
  BILLS: 'family_budget_bills_v4',
  ROLLOVER: 'family_budget_rollover_v4',
  PERSONAL_SAVINGS: 'personal_savings_tracker_v4'
};

const getStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    console.error('getStorageItem error:', e);
  }
  return null;
};

const setStorageItem = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.error('setStorageItem error:', e);
  }
};

const removeStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('removeStorageItem error:', e);
  }
};

// A household of one real person, not a sample family: a fresh install (or a
// full Reset) starts here, same as an app just downloaded from a store.
const EMPTY_MEMBERS = [];
const EMPTY_TRANSACTIONS = [];
const EMPTY_BILLS = [];
const EMPTY_PERSONAL_STATE = { salary: 0, goals: [], transactions: [] };

// `val === null` means the key was never written — true first run, so the
// empty defaults above apply. Once a key exists, whatever is actually stored
// wins even when it's an empty array: without this distinction, a user who
// deletes their last transaction would see fake data reappear on next load,
// since an empty array used to be treated the same as "nothing saved yet".
const parseOrFallback = (val, fallback) => {
  if (val === null) return fallback;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback;
    }
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const loadState = () => {
  try {
    const transactions = parseOrFallback(getStorageItem(KEYS.TRANSACTIONS), EMPTY_TRANSACTIONS);
    const members = parseOrFallback(getStorageItem(KEYS.MEMBERS), EMPTY_MEMBERS);
    const categories = parseOrFallback(getStorageItem(KEYS.CATEGORIES), DEFAULT_CATEGORIES);
    const bills = parseOrFallback(getStorageItem(KEYS.BILLS), EMPTY_BILLS);
    const rollover = parseOrFallback(getStorageItem(KEYS.ROLLOVER), true);
    const personal = parseOrFallback(getStorageItem(KEYS.PERSONAL_SAVINGS), EMPTY_PERSONAL_STATE);

    return {
      transactions,
      members,
      categories,
      bills,
      enableRollover: rollover,
      personalState: personal
    };
  } catch (e) {
    console.error('Failed to load state:', e);
    return {
      transactions: EMPTY_TRANSACTIONS,
      members: EMPTY_MEMBERS,
      categories: DEFAULT_CATEGORIES,
      bills: EMPTY_BILLS,
      enableRollover: true,
      personalState: EMPTY_PERSONAL_STATE
    };
  }
};

export const saveState = (key, data) => {
  setStorageItem(KEYS[key], JSON.stringify(data));
};

// Wipes all saved data back to the empty first-run state (category
// taxonomy aside) — not to a sample dataset, since there no longer is one.
export const resetToDefaultState = () => {
  removeStorageItem(KEYS.TRANSACTIONS);
  removeStorageItem(KEYS.MEMBERS);
  removeStorageItem(KEYS.CATEGORIES);
  removeStorageItem(KEYS.BILLS);
  removeStorageItem(KEYS.ROLLOVER);
  removeStorageItem(KEYS.PERSONAL_SAVINGS);
};

export const exportTransactionsToCSV = (transactions = [], members = [], categories = []) => {
  const headers = ['Transaction ID', 'Type', 'Description', 'Amount (INR ₹)', 'Category', 'Paid By', 'Date', 'Payment Method', 'Notes'];
  
  const rows = (transactions || []).map(tx => {
    const member = (members || []).find(m => m.id === tx.memberId)?.name || tx.memberId;
    const category = (categories || []).find(c => c.id === tx.category)?.name || tx.category;
    return [
      tx.id,
      tx.type,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      (tx.amount || 0).toFixed(2),
      `"${category}"`,
      `"${member}"`,
      tx.date,
      tx.paymentMethod || 'N/A',
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `indian_family_budget_details_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
