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

// Colours a new budget category can be given. Same literal-hex reasoning as
// MEMBER_COLORS: the value is stored on the record and handed to Recharts and
// to color-mix(), neither of which can resolve a CSS custom property here.
export const CATEGORY_COLORS = [
  '#4F7A5C', '#4A6B8A', '#B07C2A', '#A8496B', '#7B5EA7',
  '#3F7C82', '#6B6A9E', '#A8412A', '#C2661F'
];

// The member profile belonging to a signed-in account. Members created before
// profiles were claimable have no ownerUid and so belong to nobody yet — the
// claim screen is what attaches one.
export const myMember = (members = [], uid) =>
  (uid ? (members || []).find((m) => m.ownerUid === uid) : null) || null;

// Profiles nobody has claimed, offered on the claim screen. The 'all' pseudo
// member is a filter, not a person.
export const unclaimedMembers = (members = []) =>
  (members || []).filter((m) => m.id !== 'all' && !m.ownerUid);

// Who may change a transaction.
//
// Three ways in: you created the household, it is filed under your profile, or
// you are the one who entered it. The profile rule is what carries history
// across, since entries were filed under profiles that predate ownership.
// createdByUid covers logging on behalf of a family member who has no account
// — without it that entry's own author could not correct it.
export const canEditTx = (tx, members = [], uid, householdOwnerUid = null) => {
  if (!tx || !uid) return false;
  // Whoever created the household keeps the run of it, so a wrong entry is
  // always fixable by somebody.
  if (householdOwnerUid && uid === householdOwnerUid) return true;
  if (tx.createdByUid && tx.createdByUid === uid) return true;
  const mine = myMember(members, uid);
  return Boolean(mine && tx.memberId === mine.id);
};

export const isHouseholdOwner = (uid, householdOwnerUid) =>
  Boolean(uid && householdOwnerUid && uid === householdOwnerUid);

// Where income comes from. Ids are prefixed so they can live in a
// transaction's `category` field — the same field expenses use — without ever
// colliding with a budget category id, seeded or user-created.
export const INCOME_SOURCES = [
  { id: 'income-salary', name: 'Salary', color: '#4F7A5C' },
  { id: 'income-rent', name: 'Rent Received', color: '#4A6B8A' },
  { id: 'income-interest', name: 'Interest & Returns', color: '#B07C2A' },
  { id: 'income-other', name: 'Other Income', color: '#6B6A9E' }
];

// The display name and colour for whatever a transaction is filed under,
// whichever side of the ledger it sits on. Income used to be written as the
// bare string 'income', so that still resolves rather than showing the raw id.
export const resolveTxCategory = (tx, categories = []) => {
  if (!tx) return { name: 'Expense', color: 'var(--text-muted)' };
  if (tx.type === 'income') {
    return INCOME_SOURCES.find((s) => s.id === tx.category)
      || { name: 'Income', color: '#4F7A5C' };
  }
  return (categories || []).find((c) => c.id === tx.category)
    || { name: tx.category || 'Expense', color: 'var(--text-muted)' };
};

// The picker shows the label; `value` is what actually gets stored on the
// member record and rendered everywhere else in the app (member badges,
// the family bar, etc.), so nothing downstream of the picker needs to
// change.
export const MEMBER_AVATARS = [
  { value: '👩‍💼', label: 'Mom' },
  { value: '👨‍💻', label: 'Dad' },
  { value: '👦', label: 'Son' },
  { value: '👧', label: 'Daughter' },
  { value: '👵', label: 'Grandma' },
  { value: '👴', label: 'Grandpa' },
  { value: '🧒', label: 'Kid' },
  { value: '🐶', label: 'Pet' }
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

const monthLabel = (key) =>
  new Date(key + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

// Months offered by the Budgets picker. Unlike getAvailableMonths — which is
// for *filtering* existing data and so only lists months that have any — a
// budget can be set for a month with nothing recorded in it yet, which is the
// whole point of filling in one you missed. So this walks back a fixed number
// of calendar months from today, then unions in any month that already holds
// transactions or a saved budget, so nothing previously reachable drops out of
// the list.
export const getBudgetMonths = (transactions = [], categories = [], lookback = 3) => {
  const keys = new Set();

  const now = new Date();
  for (let i = 0; i <= lookback; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  (transactions || []).forEach((t) => {
    if (t.date && t.date.length >= 7) keys.add(t.date.slice(0, 7));
  });
  (categories || []).forEach((c) => {
    Object.keys(c?.limits || {}).forEach((k) => keys.add(k));
  });

  return Array.from(keys)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => ({ value: key, label: monthLabel(key) }));
};

// A category's budget for one month. `limits` holds per-month overrides and
// `limit` is the standing default, so a month nobody has touched still shows
// the household's usual budget rather than zero.
export const limitFor = (category, monthKey) => {
  if (!category) return 0;
  const override = monthKey && monthKey !== 'all' ? category.limits?.[monthKey] : undefined;
  return Number(override ?? category.limit ?? 0) || 0;
};

// Whether this month carries its own budget rather than inheriting the default.
export const hasMonthOverride = (category, monthKey) =>
  Boolean(monthKey && monthKey !== 'all' && category?.limits?.[monthKey] !== undefined);

// Whole days from today until an ISO (YYYY-MM-DD) date: negative if it has
// passed, 0 for today. Null when there is no real date to count from.
//
// Both ends are built at local midnight from the date's own parts. `new
// Date('2026-09-17')` would instead parse as UTC midnight, leaving the two
// ends offset by the timezone rather than a whole number of days — survivable
// here only because the result is rounded, which is a thin thing to rely on.
//
// The rounding is load-bearing for a different reason: across a DST change the
// two local midnights are 23 or 25 hours apart, so flooring drops a day.
// Measured in America/Los_Angeles, 2026-03-07 to 2026-03-09 floors to 1 and
// rounds to 2.
export const daysUntil = (isoDate) => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

// Today as YYYY-MM-DD in the user's own timezone. toISOString() would convert
// to UTC first and hand back yesterday's date for anyone behind it.
export const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Shifts an ISO date by whole days, staying on local midnight so month and
// year roll over correctly.
export const addDaysISO = (isoDate, days) => {
  const [y, m, d] = (isoDate || todayISO()).split('-').map(Number);
  const next = new Date(y, m - 1, d + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
};

// A bill's live days-until, or null for one saved before due dates were real
// dates. Those carry a frozen number and the literal string "In 5 days", which
// never counted down — they need a date set rather than a number believed.
export const billDaysUntil = (bill) => daysUntil(bill?.dueDate);

const DANGER = { bg: 'var(--danger-tint)', border: 'var(--danger-border)', color: 'var(--danger)' };
const WARN = { bg: 'var(--accent-tint)', border: 'var(--accent-border)', color: 'var(--accent-strong)' };
const CALM = { bg: 'var(--positive-tint)', border: 'var(--positive-border)', color: 'var(--positive)' };
const MUTED = { bg: 'var(--bg-card-hover)', border: 'var(--bg-card-border)', color: 'var(--text-muted)' };

export const getBillBadgeStatus = (daysUntilDue, paid) => {
  if (paid) return { text: 'Paid', ...CALM };
  // No real date to count from — a bill saved before due dates were dates.
  // Saying "Due in 5d" for it would be inventing a deadline.
  if (daysUntilDue === null || daysUntilDue === undefined) return { text: 'Set a due date', ...MUTED };
  // Overdue used to fall through the `< 3` branch and render "Due in -2d".
  if (daysUntilDue < 0) {
    const late = Math.abs(daysUntilDue);
    return { text: `Overdue by ${late}d`, ...DANGER };
  }
  if (daysUntilDue === 0) return { text: 'Due today', ...DANGER };
  if (daysUntilDue === 1) return { text: 'Due tomorrow', ...DANGER };
  if (daysUntilDue < 3) return { text: `Due in ${daysUntilDue}d (Urgent)`, ...DANGER };
  if (daysUntilDue <= 7) return { text: `Due in ${daysUntilDue}d`, ...WARN };
  return { text: `Due in ${daysUntilDue}d`, ...CALM };
};
