// Every real household's category limits differ, so a fresh install starts
// these at 0 (shown as "not set") rather than guessing a number — BudgetsTab
// and HomeTab already treat a 0 limit as "no percentage to show" rather than
// dividing by zero.
export const DEFAULT_CATEGORIES = [
  { id: 'groceries', name: 'Groceries & Provisions', icon: '🛒', limit: 0, color: '#4F7A5C' },
  { id: 'housing', name: 'Rent & Maintenance', icon: '🏠', limit: 0, color: '#4A6B8A' },
  { id: 'utilities', name: 'Electricity & Bills', icon: '⚡', limit: 0, color: '#B07C2A' },
  { id: 'dining', name: 'Dining Out & Swiggy', icon: '🍽️', limit: 0, color: '#A8496B' },
  { id: 'entertainment', name: 'Movies & Outings', icon: '🎮', limit: 0, color: '#7B5EA7' },
  { id: 'health', name: 'Health & Pharmacy', icon: '🏥', limit: 0, color: '#3F7C82' },
  { id: 'education', name: 'School & Tuition', icon: '📚', limit: 0, color: '#6B6A9E' },
  { id: 'transport', name: 'Fuel & Cab Fare', icon: '🚗', limit: 0, color: '#3F7C82' },
  { id: 'shopping', name: 'Shopping & Clothes', icon: '🛍️', limit: 0, color: '#A8412A' }
];

// Palette offered to a new member's avatar/colour picker (MembersTab,
// OnboardingScreen). Persisted onto the member record and used as a Recharts
// fill, so these stay literal hex rather than tokens.
export const MEMBER_COLORS = ['#A8496B', '#4A6B8A', '#B07C2A', '#7B5EA7', '#4F7A5C', '#3F7C82', '#A8412A'];
export const MEMBER_AVATARS = ['👩‍💼', '👨‍💻', '👦', '👧', '👵', '👴', '🧒', '🐶'];

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
