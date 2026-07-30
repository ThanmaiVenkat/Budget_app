// Month helpers. The app previously hardcoded '2026-07' everywhere, which froze
// the UI to the sample dataset's month. These derive the month from the real
// calendar and from whatever transactions actually exist.

// Current calendar month as 'YYYY-MM'.
export const getCurrentMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// 'YYYY-MM' -> 'July 2026'. Returns the input unchanged if it can't be parsed.
export const formatMonthLabel = (ym) => {
  if (!ym || typeof ym !== 'string') return ym;
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

// The last `count` months as 'YYYY-MM', newest first, ending at `anchor`
// ('YYYY-MM', defaults to the current month). Used for the trend chart.
export const getRecentMonths = (count = 4, anchor = getCurrentMonth()) => {
  const [y, m] = anchor.split('-').map(Number);
  const base = new Date(y, (m || 1) - 1, 1);
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

// Days elapsed and days remaining in a given 'YYYY-MM' month, relative to
// today when the month is the current one, or the full month otherwise.
export const getMonthProgress = (ym) => {
  const [y, m] = (ym || '').split('-').map(Number);
  if (!y || !m) return { daysElapsed: 1, daysRemaining: 0, daysInMonth: 1 };

  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date();
  const isCurrentMonth = ym === getCurrentMonth();
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysRemaining = isCurrentMonth ? Math.max(0, daysInMonth - today.getDate()) : 0;

  return { daysElapsed, daysRemaining, daysInMonth };
};

// Build the month dropdown from the transactions that exist, newest first.
// Always includes the current month (so a fresh, empty app still has a valid
// selection) and an "All Months" entry. Returns [{ value, label }].
export const getMonthOptions = (transactions = []) => {
  const months = new Set();
  (Array.isArray(transactions) ? transactions : []).forEach((tx) => {
    if (tx && typeof tx.date === 'string' && tx.date.length >= 7) {
      months.add(tx.date.slice(0, 7));
    }
  });
  months.add(getCurrentMonth());

  const sorted = [...months].sort().reverse(); // 'YYYY-MM' sorts lexically
  const options = sorted.map((ym) => ({ value: ym, label: formatMonthLabel(ym) }));
  options.push({ value: 'all', label: 'All Months' });
  return options;
};
