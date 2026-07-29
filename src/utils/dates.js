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
