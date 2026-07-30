// Colors below are the app's own token palette (index.css :root), not raw
// Tailwind swatches — keeps every avatar/tile in the same warm-dark family
// instead of clashing with the orange brand accent.
export const DEFAULT_MEMBERS = [
  { id: 'all', name: 'All Family', avatar: '👪', color: '#5ec39d', role: 'Household Pool' }, // green-accent
  { id: 'dad', name: 'Dad (Rajesh)', avatar: '👨‍💻', color: '#f26a1b', role: 'Primary Earner & Head', allowance: 145000, isEarner: true }, // orange-primary
  { id: 'mom', name: 'Mom (Priya)', avatar: '👩‍💼', color: '#e0785a', role: 'Household Manager', allowance: 40000, isEarner: false }, // coral-accent
  { id: 'alex', name: 'Alex (Rohan)', avatar: '👦', color: '#d99a3a', role: 'Child', allowance: 5000, isEarner: false }, // gold-accent
  { id: 'emma', name: 'Emma (Ananya)', avatar: '👧', color: '#4a8f8a', role: 'Child', allowance: 4000, isEarner: false } // teal-accent
];

// Categories for the personal (single-user) expense tracker — separate from
// the household DEFAULT_CATEGORIES since personal spending has its own shape
// (no rent/groceries split by family member).
export const PERSONAL_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#e0785a' }, // coral-accent
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#e8590c' }, // orange-dark
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#f9812f' }, // orange-bright
  { id: 'bills', name: 'Bills & Utilities', icon: '⚡', color: '#d99a3a' }, // gold-accent
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#3e9e7e' }, // green-dark
  { id: 'health', name: 'Health', icon: '🏥', color: '#4a8f8a' }, // teal-accent
  { id: 'investment', name: 'Investment / SIP', icon: '📈', color: '#b85c7a' }, // berry-accent
  { id: 'other', name: 'Other', icon: '📦', color: '#8a7d6d' } // text-muted (neutral catch-all)
];

export const DEFAULT_CATEGORIES = [
  { id: 'groceries', name: 'Groceries & Provisions', icon: '🛒', limit: 25000, color: '#f26a1b' }, // orange-primary
  { id: 'housing', name: 'Rent & Maintenance', icon: '🏠', limit: 45000, color: '#e0785a' }, // coral-accent
  { id: 'utilities', name: 'Electricity & Bills', icon: '⚡', limit: 12000, color: '#d99a3a' }, // gold-accent
  { id: 'dining', name: 'Dining Out & Swiggy', icon: '🍽️', limit: 15000, color: '#5ec39d' }, // green-accent
  { id: 'entertainment', name: 'Movies & Outings', icon: '🎮', limit: 8000, color: '#3e9e7e' }, // green-dark
  { id: 'health', name: 'Health & Pharmacy', icon: '🏥', limit: 10000, color: '#4a8f8a' }, // teal-accent
  { id: 'education', name: 'School & Tuition', icon: '📚', limit: 15000, color: '#b85c7a' }, // berry-accent
  { id: 'transport', name: 'Fuel & Cab Fare', icon: '🚗', limit: 10000, color: '#e8590c' }, // orange-dark
  { id: 'shopping', name: 'Shopping & Clothes', icon: '🛍️', limit: 12000, color: '#f9812f' } // orange-bright
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

export const getBillBadgeStatus = (daysUntilDue, paid) => {
  if (paid) return { text: 'Paid', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', color: '#34d399' };
  if (daysUntilDue < 3) return { text: `Due in ${daysUntilDue}d (Urgent)`, bg: 'rgba(248, 113, 113, 0.18)', border: 'rgba(248, 113, 113, 0.4)', color: '#f87171' };
  if (daysUntilDue <= 7) return { text: `Due in ${daysUntilDue}d`, bg: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' };
  return { text: `Due in ${daysUntilDue}d`, bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', color: '#34d399' };
};
