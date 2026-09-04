export const DEFAULT_MEMBERS = [
  { id: 'all', name: 'All Family', avatar: '👨‍👩‍👧‍👦', color: '#C2661F', role: 'Household Pool' },
  { id: 'dad', name: 'Dad (Rajesh)', avatar: '👨‍💻', color: '#4A6B8A', role: 'Primary Earner & Head', allowance: 145000, isEarner: true },
  { id: 'mom', name: 'Mom (Priya)', avatar: '👩‍💼', color: '#A8496B', role: 'Household Manager', allowance: 40000, isEarner: false },
  { id: 'alex', name: 'Alex (Rohan)', avatar: '👦', color: '#B07C2A', role: 'Child', allowance: 5000, isEarner: false },
  { id: 'emma', name: 'Emma (Ananya)', avatar: '👧', color: '#7B5EA7', role: 'Child', allowance: 4000, isEarner: false }
];

export const DEFAULT_CATEGORIES = [
  { id: 'groceries', name: 'Groceries & Provisions', icon: '🛒', limit: 25000, color: '#4F7A5C' },
  { id: 'housing', name: 'Rent & Maintenance', icon: '🏠', limit: 45000, color: '#4A6B8A' },
  { id: 'utilities', name: 'Electricity & Bills', icon: '⚡', limit: 12000, color: '#B07C2A' },
  { id: 'dining', name: 'Dining Out & Swiggy', icon: '🍽️', limit: 15000, color: '#A8496B' },
  { id: 'entertainment', name: 'Movies & Outings', icon: '🎮', limit: 8000, color: '#7B5EA7' },
  { id: 'health', name: 'Health & Pharmacy', icon: '🏥', limit: 10000, color: '#3F7C82' },
  { id: 'education', name: 'School & Tuition', icon: '📚', limit: 15000, color: '#6B6A9E' },
  { id: 'transport', name: 'Fuel & Cab Fare', icon: '🚗', limit: 10000, color: '#3F7C82' },
  { id: 'shopping', name: 'Shopping & Clothes', icon: '🛍️', limit: 12000, color: '#A8412A' }
];

export const INITIAL_TRANSACTIONS = [
  // Dad (Rajesh) is the sole earner - Salary & Income
  {
    id: 'tx-1',
    type: 'income',
    title: 'Dad Salary Credit (Rajesh)',
    amount: 145000.00,
    category: 'income',
    memberId: 'dad',
    date: '2026-07-01',
    paymentMethod: 'Transfer',
    notes: 'Primary monthly salary earned by Dad'
  },
  {
    id: 'tx-2',
    type: 'income',
    title: 'Dad Quarterly Performance Bonus',
    amount: 25000.00,
    category: 'income',
    memberId: 'dad',
    date: '2026-07-05',
    paymentMethod: 'Transfer',
    notes: 'Bonus credited to Dad'
  },

  // Family Members Spending Expenses
  {
    id: 'tx-3',
    type: 'expense',
    title: 'Supermarket Provisions',
    amount: 8450.00,
    category: 'groceries',
    memberId: 'mom',
    date: '2026-07-25',
    paymentMethod: 'UPI',
    notes: 'Mom bought monthly groceries'
  },
  {
    id: 'tx-4',
    type: 'expense',
    title: 'House Rent Transfer',
    amount: 38000.00,
    category: 'housing',
    memberId: 'dad',
    date: '2026-07-02',
    paymentMethod: 'Net Banking',
    notes: 'Dad paid apartment rent'
  },
  {
    id: 'tx-5',
    type: 'expense',
    title: 'Weekend Family Dinner',
    amount: 3250.00,
    category: 'dining',
    memberId: 'mom',
    date: '2026-07-20',
    paymentMethod: 'Card',
    notes: 'Mom paid for family dinner'
  },
  {
    id: 'tx-6',
    type: 'expense',
    title: 'Electricity Bill BESCOM',
    amount: 4850.00,
    category: 'utilities',
    memberId: 'dad',
    date: '2026-07-15',
    paymentMethod: 'UPI',
    notes: 'Dad paid electric power bill'
  },
  {
    id: 'tx-7',
    type: 'expense',
    title: 'Apollo Pharmacy Medicines',
    amount: 1850.00,
    category: 'health',
    memberId: 'mom',
    date: '2026-07-12',
    paymentMethod: 'Card',
    notes: 'Mom bought medicines'
  },
  {
    id: 'tx-8',
    type: 'expense',
    title: 'School Art Supplies & Books',
    amount: 2400.00,
    category: 'education',
    memberId: 'emma',
    date: '2026-07-10',
    paymentMethod: 'UPI',
    notes: 'Emma school expenses'
  },
  {
    id: 'tx-9',
    type: 'expense',
    title: 'Gaming & Snacks Outing',
    amount: 1500.00,
    category: 'entertainment',
    memberId: 'alex',
    date: '2026-07-18',
    paymentMethod: 'UPI',
    notes: 'Alex spent at arcade'
  },

  // June 2026 Transactions (Dad's Income + Family Expenses)
  {
    id: 'tx-10',
    type: 'income',
    title: 'Dad Salary Credit (Rajesh)',
    amount: 145000.00,
    category: 'income',
    memberId: 'dad',
    date: '2026-06-01',
    paymentMethod: 'Transfer',
    notes: 'June salary earned by Dad'
  },
  {
    id: 'tx-11',
    type: 'expense',
    title: 'June House Rent',
    amount: 38000.00,
    category: 'housing',
    memberId: 'dad',
    date: '2026-06-02',
    paymentMethod: 'Transfer',
    notes: 'Rent payout'
  },
  {
    id: 'tx-12',
    type: 'expense',
    title: 'June Groceries & Supplies',
    amount: 21500.00,
    category: 'groceries',
    memberId: 'mom',
    date: '2026-06-18',
    paymentMethod: 'Card',
    notes: 'Mom bought monthly rations'
  },
  {
    id: 'tx-13',
    type: 'expense',
    title: 'Car Fuel Tank',
    amount: 4500.00,
    category: 'transport',
    memberId: 'dad',
    date: '2026-06-22',
    paymentMethod: 'UPI',
    notes: 'Dad paid fuel'
  },
  {
    id: 'tx-14',
    type: 'expense',
    title: 'Summer Clothes Shopping',
    amount: 8900.00,
    category: 'shopping',
    memberId: 'mom',
    date: '2026-06-14',
    paymentMethod: 'Card',
    notes: 'Mom bought clothes'
  }
];

// Recurring Bills
export const INITIAL_BILLS = [
  { id: 'b-1', title: 'Airtel Fiber Wifi', amount: 1499.00, daysUntilDue: 2, dueDate: 'Jul 28', paid: false, payer: 'dad' },
  { id: 'b-2', title: 'Apartment Maintenance', amount: 3500.00, daysUntilDue: 5, dueDate: 'Jul 31', paid: false, payer: 'dad' },
  { id: 'b-3', title: 'Tata Play & OTT Combo', amount: 899.00, daysUntilDue: 12, dueDate: 'Aug 07', paid: false, payer: 'mom' },
  { id: 'b-4', title: 'Car Insurance Premium', amount: 12500.00, daysUntilDue: 15, dueDate: 'Aug 10', paid: true, payer: 'mom' }
];

export const formatRupees = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

// Collision-safe ID generator. Date.now() alone can produce duplicate ids if
// two records are created within the same millisecond (e.g. a double-tap
// before a modal closes), which would silently merge two unrelated records
// under one id in delete/update-by-id logic. crypto.randomUUID() is
// available in every modern browser; the suffix is a defensive fallback.
export const generateId = (prefix) => {
  const unique = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${unique}`;
};

// Derives the list of YYYY-MM months actually present in the transactions,
// newest first, so month pickers stay correct as data changes over time.
export const getAvailableMonths = (transactions = []) => {
  const keys = new Set();
  (transactions || []).forEach((t) => {
    if (t.date && t.date.length >= 7) keys.add(t.date.slice(0, 7));
  });

  if (keys.size === 0) {
    keys.add(new Date().toISOString().slice(0, 7));
  }

  return Array.from(keys)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => ({
      value: key,
      label: new Date(key + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
    }));
};

// Returns the YYYY-MM key immediately before the given one (e.g. '2026-07' -> '2026-06').
export const getPreviousMonthKey = (monthKey) => {
  const [year, month] = (monthKey || '').split('-').map(Number);
  if (!year || !month) return null;
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getBillBadgeStatus = (daysUntilDue, paid) => {
  if (paid) return { text: 'Paid', bg: 'var(--positive-tint)', border: 'var(--positive-border)', color: 'var(--positive)' };
  if (daysUntilDue < 3) return { text: `Due in ${daysUntilDue}d (Urgent)`, bg: 'var(--danger-tint)', border: 'var(--danger-border)', color: 'var(--danger)' };
  if (daysUntilDue <= 7) return { text: `Due in ${daysUntilDue}d`, bg: 'var(--accent-tint)', border: 'var(--accent-border)', color: 'var(--accent-strong)' };
  return { text: `Due in ${daysUntilDue}d`, bg: 'var(--positive-tint)', border: 'var(--positive-border)', color: 'var(--positive)' };
};
