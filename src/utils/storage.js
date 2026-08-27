import { DEFAULT_MEMBERS, DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_BILLS } from './mockData';

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

const INITIAL_PERSONAL_STATE = {
  salary: 145000,
  expenses: 32000,
  goals: [
    { id: 'g-1', title: 'Emergency Reserve Fund', target: 300000, current: 210000, category: 'Emergency', icon: '🛡️' },
    { id: 'g-2', title: 'Equity SIP Mutual Funds', target: 500000, current: 350000, category: 'Investment', icon: '📈' },
    { id: 'g-3', title: 'Goa / Bali Vacation Goal', target: 100000, current: 65000, category: 'Vacation', icon: '🌴' }
  ],
  transactions: [
    { id: 'ptx-1', title: 'Monthly Salary Credit', amount: 145000, type: 'income', date: '2026-07-01' },
    { id: 'ptx-2', title: 'SIP Investment Deposit', amount: 25000, type: 'expense', date: '2026-07-05' },
    { id: 'ptx-3', title: 'Personal Tech Purchase', amount: 8400, type: 'expense', date: '2026-07-15' }
  ]
};

const parseOrFallback = (val, fallback) => {
  if (!val) return fallback;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    }
    return parsed || fallback;
  } catch (e) {
    return fallback;
  }
};

export const loadState = () => {
  try {
    const transactions = parseOrFallback(getStorageItem(KEYS.TRANSACTIONS), INITIAL_TRANSACTIONS);
    const members = parseOrFallback(getStorageItem(KEYS.MEMBERS), DEFAULT_MEMBERS);
    const categories = parseOrFallback(getStorageItem(KEYS.CATEGORIES), DEFAULT_CATEGORIES);
    const bills = parseOrFallback(getStorageItem(KEYS.BILLS), INITIAL_BILLS);
    const rollover = parseOrFallback(getStorageItem(KEYS.ROLLOVER), true);
    const personal = parseOrFallback(getStorageItem(KEYS.PERSONAL_SAVINGS), INITIAL_PERSONAL_STATE);

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
      transactions: INITIAL_TRANSACTIONS,
      members: DEFAULT_MEMBERS,
      categories: DEFAULT_CATEGORIES,
      bills: INITIAL_BILLS,
      enableRollover: true,
      personalState: INITIAL_PERSONAL_STATE
    };
  }
};

export const saveState = (key, data) => {
  setStorageItem(KEYS[key], JSON.stringify(data));
};

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
