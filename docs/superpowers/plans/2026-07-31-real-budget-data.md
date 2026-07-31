# Real Household Budget Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the app's fictional sample data (fake family, generic categories, fixed budget limits) with the user's real household budget data imported from their Google Drive spreadsheet `Home Budget_updated.xlsx`, and remove the family-member model entirely since the real data has no per-person dimension.

**Architecture:** A one-time Node parser script (using the `xlsx` package already in `package.json`) reads the already-downloaded spreadsheet and generates the new `DEFAULT_CATEGORIES` / `INITIAL_TRANSACTIONS` arrays for `mockData.js`. Category budget limits become per-month (`limitsByMonth`) instead of a single fixed number. The member model (`DEFAULT_MEMBERS`, `FamilyMemberBar`, `MembersTab`, all `activeMemberId`/`memberId` plumbing) is deleted; `BottomNav` is fixed to route directly to `BudgetsTab` and `BillRemindersTab` instead of nesting bills under a members tab.

**Tech Stack:** React 19, Vite, `xlsx` (SheetJS) for parsing, plain CSS custom properties (no CSS framework beyond Tailwind utility import already in the project).

## Global Constraints

- No test framework exists in this project (`package.json` has no test script). Verification is `npm run lint` (oxlint) + `npm run build` (vite) after every task, plus manual spot-checks against the spreadsheet's own numbers — this replaces the usual pytest/jest steps in the task template below.
- Category display names are the **cleaned-up, rewritten** versions confirmed with the user, not the raw sheet headings: Provisions, Vegetables & Others, Sunday Expenses, Milk, Cleaning & Housekeeping, Electricity Bill, Diesel, Petrol, Medical Expenses, Pocket Money, Mobile Bill, Cooking Gas, Gifts, Lalitha's Savings, Other Expenses.
- Colors must come from the app's existing token palette (`--orange-primary #f26a1b`, `--orange-bright #f9812f`, `--orange-dark #e8590c`, `--green-accent #5ec39d`, `--green-dark #3e9e7e`, `--coral-accent #e0785a`, `--gold-accent #d99a3a`, `--teal-accent #4a8f8a`, `--berry-accent #b85c7a`) — never a new/random hex, per the earlier UI-polish pass's established rule.
- `storage.js` version bumps v5 → v6 so browsers with old member-shaped cached data reseed cleanly instead of merging.
- Source spreadsheet is at `/tmp/claude-1001/-home-claude-claude-Projects-family-budget-app/718f792e-cd70-49ab-a8b3-b8176e054ba8/scratchpad/Home_Budget_updated.xlsx` (already downloaded from Drive file id `1uSu9aPsxbA2Clt9PrhguzQFN0v9ZaY1P`).
- Sheet 1 ("Month wise budget vs Actual") row layout confirmed by inspection: row 0 = column headers (`Description, Budget, Actual, Diff`), row 1 = `INCOME` section marker + month label in column B, rows 2-3 = `Salary`/`Rent` income lines, row 4 = income `Total`, row 5 = `EXPENSES` marker, rows 6-20 = the 15 expense categories in this exact order (Provisions, Veg.&Others, Sunday Expenses, Milk Bill, Sweeper/Dust, Electricity Bill, Diesel, Petrol, Medicine, Pocket Money, Mobile Bill, gas, Gift, Savings-Lalitha, Savings-Others), row 21 = expense `Total`, row 23 = `Difference`. This 25-row block repeats every 4 columns (Budget, Actual, Diff, blank spacer) for each of the 24 months, starting at column B.
- Sheet 2 ("Details of expenditure") has one block per month, each starting with a `"DETAILS OF EXPENSES FOR THE MONTH OF <NAME>"` title row, then a header row (`Date, Descripion of expenditure, Amount Rs, <15 category columns>, Total`), then up to 31 day rows, then a `Total` row. Column order confirmed identical to the 15 expense categories above. The free-text `Descripion of expenditure` + `Amount Rs` columns are unused in every row of the real data (verified: 0 non-zero values across all 742 day-rows) — every real transaction comes from the 15 fixed category columns.

---

### Task 1: Parser script — generate category + transaction data from the spreadsheet

**Files:**
- Create: `scripts/parse-budget-excel.mjs` (temporary, deleted in Task 10 after its output is committed into `mockData.js` — this is a one-time import tool, not a feature of the running app)

**Interfaces:**
- Produces: a JSON file `scripts/parsed-budget-data.json` shaped `{ categories: Category[], transactions: Transaction[] }` where:
  - `Category = { id: string, name: string, icon: string, color: string, type: 'income'|'expense', limitsByMonth: { [yyyyMM: string]: number } }`
  - `Transaction = { id: string, type: 'income'|'expense', title: string, amount: number, category: string, date: string /* YYYY-MM-DD */ }`

- [ ] **Step 1: Write the parser script**

```js
// scripts/parse-budget-excel.mjs
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const SRC = '/tmp/claude-1001/-home-claude-claude-Projects-family-budget-app/718f792e-cd70-49ab-a8b3-b8176e054ba8/scratchpad/Home_Budget_updated.xlsx';

// sheet-heading -> { id, name, icon, color } — clean display names per the
// design doc, colors from the app's existing token palette.
const CATEGORY_MAP = {
  'Provisions':        { id: 'provisions',       name: 'Provisions',              icon: '🛒', color: '#f26a1b' },
  'Veg.&Others':        { id: 'veg-others',        name: 'Vegetables & Others',      icon: '🥦', color: '#5ec39d' },
  'Sunday Expenses':    { id: 'sunday-expenses',   name: 'Sunday Expenses',          icon: '🛍️', color: '#d99a3a' },
  'Milk Bill':          { id: 'milk-bill',         name: 'Milk',                     icon: '🥛', color: '#e0785a' },
  'Sweeper/Dust':        { id: 'sweeper-dust',      name: 'Cleaning & Housekeeping',  icon: '🧹', color: '#4a8f8a' },
  'Electricity Bill':   { id: 'electricity-bill',  name: 'Electricity Bill',         icon: '⚡', color: '#e8590c' },
  'Diesel':             { id: 'diesel',            name: 'Diesel',                   icon: '⛽', color: '#3e9e7e' },
  'Petrol':             { id: 'petrol',            name: 'Petrol',                   icon: '⛽', color: '#f9812f' },
  'Medicine':           { id: 'medicine',          name: 'Medical Expenses',         icon: '💊', color: '#b85c7a' },
  'Pocket Money':       { id: 'pocket-money',       name: 'Pocket Money',            icon: '👛', color: '#d99a3a' },
  'Mobile Bill':        { id: 'mobile-bill',        name: 'Mobile Bill',             icon: '📱', color: '#e0785a' },
  'gas':                { id: 'gas',                name: 'Cooking Gas',             icon: '🔥', color: '#f26a1b' },
  'Gift':                { id: 'gift',               name: 'Gifts',                   icon: '🎁', color: '#4a8f8a' },
  'Savings-Lalitha':    { id: 'savings-lalitha',    name: "Lalitha's Savings",       icon: '💰', color: '#3e9e7e' },
  'Savings-Others':     { id: 'other-expenses',     name: 'Other Expenses',          icon: '📦', color: '#8a7d6d' }
};
const INCOME_MAP = {
  'Salary': { id: 'salary', name: 'Salary', icon: '💼', color: '#f26a1b' },
  'Rent':   { id: 'rental-income', name: 'Rent', icon: '🏠', color: '#5ec39d' }
};

const MONTH_NAME_TO_NUM = {
  jan: '01', january: '01', feb: '02', february: '02', febuary: '02',
  mar: '03', march: '03', apr: '04', april: '04', may: '05', jun: '06', june: '06',
  jul: '07', july: '07', aug: '08', august: '08', sep: '09', sept: '09', september: '09',
  oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12'
};

function parseMonthLabel(label) {
  // Handles "August 2024", "AUGUST' 2025", "Nov 2024", "FEBURARY 2026" etc.
  const cleaned = label.replace(/'/g, '').trim();
  const m = cleaned.match(/([A-Za-z]+)\.?\s+(\d{4})/);
  if (!m) throw new Error(`Cannot parse month label: "${label}"`);
  const num = MONTH_NAME_TO_NUM[m[1].toLowerCase()];
  if (!num) throw new Error(`Unknown month name: "${m[1]}" in "${label}"`);
  return `${m[2]}-${num}`;
}

const wb = XLSX.readFile(SRC);

// ---- Sheet 1: Month wise budget vs Actual -> limitsByMonth ----
const budgetWs = wb.Sheets['Month wise budget vs Actual'];
const budgetRows = XLSX.utils.sheet_to_json(budgetWs, { header: 1, raw: true });

const categories = {};
Object.values(CATEGORY_MAP).forEach(c => {
  categories[c.id] = { ...c, type: 'expense', limitsByMonth: {} };
});
Object.values(INCOME_MAP).forEach(c => {
  categories[c.id] = { ...c, type: 'income', limitsByMonth: {} };
});

// Each month block is 25 rows tall (0-23 relative + blank), starting at
// row 1 ("INCOME"), repeating every 4 columns starting at column index 1 (B).
const ROWS_PER_BLOCK = 25;
const numBlocks = Math.floor(budgetRows.length / ROWS_PER_BLOCK);
for (let block = 0; block < numBlocks; block++) {
  const base = block * ROWS_PER_BLOCK;
  const incomeRow = budgetRows[base + 1];
  if (!incomeRow || !incomeRow[1]) break; // no more month blocks
  const month = parseMonthLabel(String(incomeRow[1]));
  const col = 1 + block * 4; // Budget column for this block

  // Income rows 2-3 relative (Salary, Rent), Expense rows 6-20 relative.
  [2, 3].forEach(r => {
    const rowLabel = budgetRows[base + r]?.[0];
    const map = INCOME_MAP[rowLabel];
    if (map) categories[map.id].limitsByMonth[month] = Number(budgetRows[base + r][col]) || 0;
  });
  for (let r = 6; r <= 20; r++) {
    const rowLabel = budgetRows[base + r]?.[0];
    const map = CATEGORY_MAP[rowLabel];
    if (map) categories[map.id].limitsByMonth[month] = Number(budgetRows[base + r][col]) || 0;
  }
}

// ---- Sheet 2: Details of expenditure -> transactions ----
const detailWs = wb.Sheets['Details of expenditure'];
const detailRows = XLSX.utils.sheet_to_json(detailWs, { header: 1, raw: true });

const transactions = [];
let txCounter = 1;
let currentMonth = null;
let columnOrder = null; // category names in column order for the active block

for (let i = 0; i < detailRows.length; i++) {
  const row = detailRows[i];
  if (!row || row.length === 0) continue;

  if (typeof row[0] === 'string' && row[0].startsWith('DETAILS OF EXPENSES')) {
    const m = row[0].match(/MONTH OF\s+(.+)$/i);
    currentMonth = parseMonthLabel(m[1]);
    continue;
  }
  if (row[0] === 'Date') {
    columnOrder = row.slice(3, 18); // 15 category header names, columns C..Q
    continue;
  }
  if (typeof row[0] !== 'number' || !currentMonth || !columnOrder) continue; // day rows only

  const day = String(row[0]).padStart(2, '0');
  const date = `${currentMonth}-${day}`;

  columnOrder.forEach((catName, idx) => {
    const amount = Number(row[3 + idx]);
    if (!amount) return;
    const map = CATEGORY_MAP[catName];
    if (!map) throw new Error(`Unmapped category column: "${catName}"`);
    transactions.push({
      id: `htx-${txCounter++}`,
      type: 'expense',
      title: map.name,
      amount,
      category: map.id,
      date
    });
  });
}

// Income transactions: one per month per income category, using the Actual
// column (2 columns right of Budget) from Sheet 1, dated the 1st of month.
for (let block = 0; block < numBlocks; block++) {
  const base = block * ROWS_PER_BLOCK;
  const incomeRow = budgetRows[base + 1];
  if (!incomeRow || !incomeRow[1]) break;
  const month = parseMonthLabel(String(incomeRow[1]));
  const col = 1 + block * 4;
  [2, 3].forEach(r => {
    const rowLabel = budgetRows[base + r]?.[0];
    const map = INCOME_MAP[rowLabel];
    if (!map) return;
    const actual = Number(budgetRows[base + r][col + 1]) || 0;
    if (!actual) return;
    transactions.push({
      id: `htx-${txCounter++}`,
      type: 'income',
      title: map.name,
      amount: actual,
      category: map.id,
      date: `${month}-01`
    });
  });
}

writeFileSync(
  new URL('./parsed-budget-data.json', import.meta.url),
  JSON.stringify({ categories: Object.values(categories), transactions }, null, 2)
);
console.log(`Wrote ${Object.keys(categories).length} categories, ${transactions.length} transactions`);
```

- [ ] **Step 2: Run it**

Run: `cd /home/claude/claude/Projects/family-budget-app && node scripts/parse-budget-excel.mjs`
Expected: prints a category/transaction count with no thrown errors (an `Unmapped category column` or `Cannot parse month label` error means a header string in the sheet doesn't exactly match `CATEGORY_MAP`/`INCOME_MAP`/`MONTH_NAME_TO_NUM` — fix the map, don't change the sheet).

- [ ] **Step 3: Spot-check the output against the sheet**

Run: `node -e "const d = require('./scripts/parsed-budget-data.json'); console.log(d.categories.find(c => c.id === 'salary').limitsByMonth['2024-08']); console.log(d.transactions.filter(t => t.date === '2024-09-03'))"`
Expected: `50000` (matches the sheet's August 2024 Salary budget seen during exploration), and the September 3rd transactions list should include Provisions ₹500, Vegetables & Others ₹1000, Electricity Bill ₹1300, Mobile Bill ₹1000 (matches the row inspected during design: `[3,null,0,500,1000,0,0,1300,0,0,0,0,1000,0,0,0,0,0,3800]`).

- [ ] **Step 4: Commit**

```bash
git add scripts/parse-budget-excel.mjs scripts/parsed-budget-data.json
git commit -m "Add one-time parser for real household budget spreadsheet"
```

---

### Task 2: Add `getCategoryLimitForMonth` helper

**Files:**
- Modify: `src/utils/dates.js`

**Interfaces:**
- Produces: `getCategoryLimitForMonth(category, month)` — `category` is a `Category` object with `limitsByMonth: {[yyyyMM]: number}`, `month` is `'YYYY-MM'`. Returns the exact month's limit if present, else the closest earlier month's limit, else `0`.

- [ ] **Step 1: Add the function**

```js
// Resolve a category's budget limit for a given month. Real budgets change
// over time (see docs/superpowers/specs/2026-07-31-real-budget-data-design.md)
// so this isn't a single static number — it looks up the exact month, and
// falls back to the closest earlier known month for months outside the
// imported range (e.g. viewing a future month with no explicit limit set).
export const getCategoryLimitForMonth = (category, month) => {
  const limits = category?.limitsByMonth;
  if (!limits) return 0;
  if (limits[month] !== undefined) return limits[month];

  const knownMonths = Object.keys(limits).filter(m => m <= month).sort();
  if (knownMonths.length === 0) return 0;
  return limits[knownMonths[knownMonths.length - 1]];
};
```

- [ ] **Step 2: Verify with a manual check**

Run: `node -e "
process.env.NODE_ENV='test';
import('./src/utils/dates.js').then(({ getCategoryLimitForMonth }) => {
  const cat = { limitsByMonth: { '2024-08': 12000, '2024-10': 11000 } };
  console.log(getCategoryLimitForMonth(cat, '2024-09')); // expect 12000 (falls back)
  console.log(getCategoryLimitForMonth(cat, '2024-10')); // expect 11000 (exact)
  console.log(getCategoryLimitForMonth(cat, '2030-01')); // expect 11000 (latest known)
  console.log(getCategoryLimitForMonth(cat, '2020-01')); // expect 0 (nothing that early)
});
"`
Expected: `12000`, `11000`, `11000`, `0`

- [ ] **Step 3: Commit**

```bash
git add src/utils/dates.js
git commit -m "Add getCategoryLimitForMonth for per-month historical budgets"
```

---

### Task 3: Replace `mockData.js` with the real dataset

**Files:**
- Modify: `src/utils/mockData.js`

**Interfaces:**
- Consumes: `scripts/parsed-budget-data.json` from Task 1.
- Produces: `DEFAULT_CATEGORIES` (array of `Category`, both `type: 'income'` and `type: 'expense'`), `INITIAL_TRANSACTIONS` (array of `Transaction`, no `memberId` field). `DEFAULT_MEMBERS` and `PERSONAL_CATEGORIES` stay (Personal tab is out of scope per the design doc). `formatRupees` and `getBillBadgeStatus` stay unchanged. `INITIAL_BILLS` stays unchanged (separate feature).

- [ ] **Step 1: Generate the replacement source**

```bash
cd /home/claude/claude/Projects/family-budget-app && node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/parsed-budget-data.json', 'utf8'));
const catBlock = 'export const DEFAULT_CATEGORIES = ' + JSON.stringify(data.categories, null, 2) + ';\n';
const txBlock = 'export const INITIAL_TRANSACTIONS = ' + JSON.stringify(data.transactions, null, 2) + ';\n';
fs.writeFileSync('scripts/generated-blocks.txt', catBlock + '\n' + txBlock);
console.log('written');
"
```

- [ ] **Step 2: Replace the two exports in `mockData.js`**

Open `src/utils/mockData.js`. Replace the existing `export const DEFAULT_CATEGORIES = [...]` block (the 9-category array with `limit:` fields) with the generated `DEFAULT_CATEGORIES` block from `scripts/generated-blocks.txt` (15 expense + 2 income categories, `limitsByMonth:` fields, no `limit:` field). Replace the existing `export const INITIAL_TRANSACTIONS = [...]` block with the generated one. Leave `DEFAULT_MEMBERS`, `PERSONAL_CATEGORIES`, `INITIAL_BILLS`, `formatRupees`, `getBillBadgeStatus` untouched.

- [ ] **Step 3: Verify the file is syntactically valid and totals are sane**

Run: `cd /home/claude/claude/Projects/family-budget-app && node -e "
import('./src/utils/mockData.js').then(m => {
  console.log('categories:', m.DEFAULT_CATEGORIES.length);
  console.log('transactions:', m.INITIAL_TRANSACTIONS.length);
  const july2024total = m.INITIAL_TRANSACTIONS.filter(t => t.date.startsWith('2024-08') && t.category === 'provisions').reduce((s,t) => s + t.amount, 0);
  console.log('Aug 2024 Provisions actual total:', july2024total);
})
"`
Expected: `categories: 17`, `transactions:` several hundred (24 months × up to 15 categories/day is the ceiling, real count will be lower since most days are 0), and the Aug 2024 Provisions total should equal `10637` (the Actual figure seen in Sheet 1 for that category/month during design exploration).

- [ ] **Step 4: Commit**

```bash
git add src/utils/mockData.js
git commit -m "Replace sample data with real household budget (categories + 24mo history)"
```

---

### Task 4: Bump storage version

**Files:**
- Modify: `src/utils/storage.js`

- [ ] **Step 1: Bump v5 to v6**

In the `KEYS` object, change every value's `_v5` suffix to `_v6` (six keys: `TRANSACTIONS`, `MEMBERS`, `CATEGORIES`, `BILLS`, `ROLLOVER`, `PERSONAL_SAVINGS`). Update the comment above `KEYS` to note this bump is for the real-data schema change (categories gained `limitsByMonth`, transactions lost `memberId`).

- [ ] **Step 2: Verify**

Run: `grep -n "_v6" src/utils/storage.js`
Expected: 6 matches.

- [ ] **Step 3: Commit**

```bash
git add src/utils/storage.js
git commit -m "Bump storage version for real-data schema change"
```

---

### Task 5: Remove the member model from `App.jsx`

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `App` no longer holds `members`/`activeMemberId` state, no longer renders `FamilyMemberBar`, no longer has a `'members'` tab case. `HomeTab`/`ExpensesTab`/`GraphsTab`/`BudgetsTab` are no longer passed `members`/`activeMemberId` props (Tasks 7-10 remove those props from the components themselves).

- [ ] **Step 1: Remove member state and handlers**

Delete the `members` `useState`, its `saveState('MEMBERS', members)` effect, `handleAddMember`, and the `FamilyMemberBar` import and its conditional render block (`{activeTab !== 'personal' && (...)}`). Delete `activeMemberId` state.

- [ ] **Step 2: Remove the `members` tab case, stop passing removed props**

Delete the `{activeTab === 'members' && (...)}` block that rendered `MembersTab` + `BillRemindersTab` together (Task 6 makes `BillRemindersTab` its own top-level tab case, reachable directly from `BottomNav`). Remove `members`/`activeMemberId` from the props passed to `HeaderBar`, `HomeTab`, `ExpensesTab`, `GraphsTab`, `BudgetsTab`. Remove the `onAddMember`/`bills`-via-members wiring — `bills` and `onToggleBillPaid`/`onAddBill` now go directly to a `{activeTab === 'bills' && <BillRemindersTab ... />}` case.

- [ ] **Step 3: Verify**

Run: `cd /home/claude/claude/Projects/family-budget-app && grep -n "members\|activeMemberId\|FamilyMemberBar\|MembersTab" src/App.jsx`
Expected: no matches (bills-related lines like `bills={bills}` are fine and expected to remain).

Run: `npm run lint && npm run build`
Expected: both succeed — a failure here means a component still expects a `members`/`activeMemberId` prop that Tasks 6-10 haven't removed yet; that's expected until this whole plan is done, so at this point in the plan a build failure referencing `members` in a *different* file is fine to leave for now, but any error inside `App.jsx` itself must be fixed before moving on.

---

### Task 6: Delete `FamilyMemberBar.jsx` and `MembersTab.jsx`, fix `BottomNav.jsx`

**Files:**
- Delete: `src/components/FamilyMemberBar.jsx`, `src/components/MembersTab.jsx`
- Modify: `src/components/BottomNav.jsx`

- [ ] **Step 1: Delete the two files**

```bash
git rm src/components/FamilyMemberBar.jsx src/components/MembersTab.jsx
```

- [ ] **Step 2: Fix the nav**

In `BottomNav.jsx`, change the `tabs` array from:
```js
const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'graphs', label: 'Insights', icon: TrendingUp },
  { id: 'add', label: 'Add', isFab: true },
  { id: 'budgets', label: 'Bills', icon: Receipt },
  { id: 'members', label: 'You', icon: User }
];
```
to:
```js
const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'graphs', label: 'Insights', icon: TrendingUp },
  { id: 'add', label: 'Add', isFab: true },
  { id: 'budgets', label: 'Budgets', icon: Receipt },
  { id: 'bills', label: 'Bills', icon: Wallet2 }
];
```
Update the `lucide-react` import line to swap `User` for `Wallet2` (or another distinct bill/receipt-style icon not already used by `budgets`'s `Receipt` — check `lucide-react`'s export list matches before using it).

- [ ] **Step 3: Verify**

Run: `grep -n "members\|MembersTab\|FamilyMemberBar" src/components/BottomNav.jsx`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Remove family-member model: delete FamilyMemberBar/MembersTab, fix bottom-nav routing"
```

---

### Task 7: Update `AddExpenseSheet.jsx` — remove member picker, add income category picker + "Other Expenses" custom label

**Files:**
- Modify: `src/components/AddExpenseSheet.jsx`

**Interfaces:**
- Consumes: `categories` prop now includes both `type: 'income'` and `type: 'expense'` entries (from Task 3).
- Produces: `onSave` is called with a transaction shape `{ id, type, title, amount, category, date }` — no `memberId`.

- [ ] **Step 1: Remove member-derived defaults and the "who spent" field**

Delete `realMembers`, `earner`, `defaultSpender` and the whole "FIELD 2: WHO SPENT OR EARNED" block. Delete the `members` prop from the function signature.

- [ ] **Step 2: Replace the income logic with a category picker**

Replace `handleTypeChange`'s `setMemberId(earner.id)` line (delete it) and change the type toggle's income button label from `💰 {earner.name.split(' ')[0]}'s Income` to a static `💰 Add Income`. Where the category grid currently only renders `{type === 'expense' && (...)}`, change the category `.filter()`/`.slice()` source to filter by `categories.filter(c => c.type === type).slice(0, 6)` so the same grid UI works for both income categories (Salary, Rent) and expense categories, and render it for both types (remove the `type === 'expense'` guard, keep the field, just retarget its data source and label to `{type === 'income' ? '2. INCOME SOURCE' : '2. CATEGORY'}`).

- [ ] **Step 3: Add the "Other Expenses" custom-name field**

After the category grid, add:
```jsx
{category === 'other-expenses' && type === 'expense' && (
  <div className="form-group" style={{ marginBottom: '4px' }}>
    <label className="form-label" style={{ fontSize: '0.72rem' }}>WHAT'S THIS FOR?</label>
    <input
      type="text"
      className="form-input"
      placeholder="e.g. Plumber, School fees, One-off purchase"
      value={otherLabel}
      onChange={(e) => setOtherLabel(e.target.value)}
    />
  </div>
)}
```
Add `const [otherLabel, setOtherLabel] = useState('');` alongside the other `useState` calls at the top.

- [ ] **Step 4: Wire the custom label into the saved title**

In `handleSubmit`, change:
```js
const catObj = categories.find(c => c.id === category);
const defaultTitle = type === 'income' ? `${earner.name} Salary / Earnings` : (catObj ? catObj.name : 'Expense');
```
to:
```js
const catObj = categories.find(c => c.id === category);
const defaultTitle = category === 'other-expenses' && otherLabel.trim()
  ? otherLabel.trim()
  : (catObj ? catObj.name : (type === 'income' ? 'Income' : 'Expense'));
```
Remove `memberId: type === 'income' ? earner.id : memberId,` from the `onSave({...})` call entirely (no `memberId` field on the saved object at all).

- [ ] **Step 5: Verify**

Run: `npm run lint && npm run build`
Expected: both succeed with no reference to `members`, `earner`, `defaultSpender`, or `memberId` remaining in this file — confirm with `grep -n "members\|earner\|memberId" src/components/AddExpenseSheet.jsx` (expect no matches).

- [ ] **Step 6: Commit**

```bash
git add src/components/AddExpenseSheet.jsx
git commit -m "AddExpenseSheet: remove member picker, add income category + Other Expenses custom label"
```

---

### Task 8: Remove member filtering from `ExpensesTab.jsx`

**Files:**
- Modify: `src/components/ExpensesTab.jsx`

- [ ] **Step 1: Remove member props, filter, and row display**

Remove `members`/`activeMemberId` from the function signature. Remove `matchesMember` from the `.filter()` predicate (and the `&& matchesMember` usage). Remove `safeMembers` and the `memberObj` lookup, and delete the member avatar/name `<span>` inside each transaction row (the `<span style={{ color: memberObj.color, ... }}>{memberObj.avatar} {memberObj.name}</span>` and its following `<span>•</span>` separator — the row now shows just the date where it used to show `member • date`).

- [ ] **Step 2: Verify**

Run: `grep -n "members\|memberId\|memberObj" src/components/ExpensesTab.jsx`
Expected: no matches.

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExpensesTab.jsx
git commit -m "ExpensesTab: remove member filtering and per-row member display"
```

---

### Task 9: `BudgetsTab.jsx` — per-month limits + Diff vocabulary

**Files:**
- Modify: `src/components/BudgetsTab.jsx`

**Interfaces:**
- Consumes: `getCategoryLimitForMonth` from `src/utils/dates.js` (Task 2).

- [ ] **Step 1: Remove member filtering, switch to per-month limits**

Remove `activeMemberId` from the function signature and from the `spent` filter predicate (`&& (activeMemberId === 'all' || t.memberId === activeMemberId)` — delete this clause). Import `getCategoryLimitForMonth` and replace every `cat.limit` read with `getCategoryLimitForMonth(cat, selectedMonth === 'all' ? getCurrentMonth() : selectedMonth)` — store this in a local `const limit = ...` at the top of the `.map()` callback and use `limit` everywhere `cat.limit` was used (`pct`, `isOver`, the displayed amount, the edit-input's starting value in `handleStartEdit`).

- [ ] **Step 2: Fix `handleSaveEdit`/`onUpdateCategoryLimit` for per-month data**

`onUpdateCategoryLimit(catId, newLimit)` (passed down from `App.jsx`, backed by `handleUpdateCategoryLimit`) currently does `c.limit = newLimit`. Since limits are now per-month, change the call site in `handleSaveEdit` to pass the month too: `onUpdateCategoryLimit(cat.id, val, selectedMonth === 'all' ? getCurrentMonth() : selectedMonth)`. Update `App.jsx`'s `handleUpdateCategoryLimit` to accept a third `month` argument and set `limitsByMonth[month]` instead of `limit`:
```js
const handleUpdateCategoryLimit = (catId, newLimit, month) => {
  setCategories((prev) =>
    prev.map((c) => (c.id === catId ? { ...c, limitsByMonth: { ...c.limitsByMonth, [month]: newLimit } } : c))
  );
};
```

- [ ] **Step 3: Add explicit Diff wording**

In each category card, next to the existing `{pct}% Used` text, add a Diff figure using the sheet's own vocabulary: `Diff: {formatRupees(limit - spent)}` (positive = under budget, matches the sheet's sign convention where Diff = Budget − Actual). Style it the same size/weight as the existing `% Used` text, colored `isOver ? '#f87171' : 'var(--green-accent)'`.

- [ ] **Step 4: Verify**

Run: `grep -n "activeMemberId\|cat\.limit\b" src/components/BudgetsTab.jsx`
Expected: no matches (every limit read now goes through `getCategoryLimitForMonth`).

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add src/components/BudgetsTab.jsx src/App.jsx
git commit -m "BudgetsTab: per-month historical limits, explicit Diff figure, drop member filter"
```

---

### Task 10: `GraphsTab.jsx` — Income/Expense/Diff summary, Budget vs Actual variance chart, drop member chart

**Files:**
- Modify: `src/components/GraphsTab.jsx`

**Interfaces:**
- Consumes: `getCategoryLimitForMonth` from `src/utils/dates.js`.

- [ ] **Step 1: Remove member props and the per-member bar chart**

Remove `members`/`activeMemberId` from the function signature and delete the `memberChartData` computation and the entire "CHART 2: PER-MEMBER SPENDING COMPARISON" `<div className="glass-card">` block. Remove `&& (activeMemberId === 'all' || t.memberId === activeMemberId)` from the `monthTxs`/`monthlyTrendData` filters.

- [ ] **Step 2: Add the month summary section**

Above "CHART 1", add:
```jsx
{/* MONTH SUMMARY — sheet's own vocabulary: Income Total, Expense Total, Difference */}
<div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
  <div>
    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>INCOME TOTAL</div>
    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--green-accent)' }}>{formatRupees(totalIncome)}</div>
  </div>
  <div>
    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>EXPENSE TOTAL</div>
    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f3ece0' }}>{formatRupees(totalExpense)}</div>
  </div>
  <div>
    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>DIFFERENCE</div>
    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: (totalIncome - totalExpense) >= 0 ? 'var(--green-accent)' : '#f87171' }}>
      {formatRupees(totalIncome - totalExpense)}
    </div>
  </div>
</div>
```
Add `const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);` next to the existing `totalExpense` computation.

- [ ] **Step 3: Add the Budget vs Actual variance chart, replacing the removed member chart's slot**

```jsx
{/* CHART: BUDGET VS ACTUAL VARIANCE — the source spreadsheet's core feature */}
<div className="glass-card">
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
    <BarChart3 size={18} color="#f9812f" />
    <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Budget vs Actual</h3>
  </div>
  <div style={{ width: '100%', height: 220 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={safeCategories.filter(c => c.type === 'expense').map(c => {
          const limit = getCategoryLimitForMonth(c, selectedMonth === 'all' ? getCurrentMonth() : selectedMonth);
          const actual = monthTxs.filter(t => t.category === c.id && t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
          return { name: c.name.split(' ')[0], Budget: limit, Actual: actual };
        })}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" stroke="#8a7d6d" tick={{ fontSize: 10 }} width={70} />
        <Tooltip formatter={(val) => formatRupees(val)} />
        <Bar dataKey="Budget" fill="#3a3328" radius={[0, 4, 4, 0]} barSize={8} />
        <Bar dataKey="Actual" fill="#f9812f" radius={[0, 4, 4, 0]} barSize={8} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
```

- [ ] **Step 4: Verify**

Run: `grep -n "members\|activeMemberId\|memberChartData" src/components/GraphsTab.jsx`
Expected: no matches.

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add src/components/GraphsTab.jsx
git commit -m "GraphsTab: add month Income/Expense/Diff summary and Budget vs Actual chart, drop member chart"
```

---

### Task 11: `HomeTab.jsx` — remove member greeting/avatar

**Files:**
- Modify: `src/components/HomeTab.jsx`

- [ ] **Step 1: Remove member props and the personalized greeting**

Remove `members`/`activeMemberId` from the function signature. Remove `safeMembers` and `activeMember`. Remove `&& (activeMemberId === 'all' || t.memberId === activeMemberId)` from `filteredTxs`'s filter. Change the hero panel's greeting from `Hi, {activeMember.name} 👋` (with the `<Users/>`-or-emoji avatar box next to it) to a date-based greeting with no avatar box: `<div style={{ font: '700 14px Manrope', color: '#fff' }}>{new Date().getHours() < 17 ? 'Good afternoon 👋' : 'Good evening 👋'}</div>` and delete the sibling `<div className="avat">...</div>` entirely (delete the `Users` import from `lucide-react` too, now unused).

- [ ] **Step 2: Verify**

Run: `grep -n "members\|activeMember\|Users" src/components/HomeTab.jsx`
Expected: no matches.

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add src/components/HomeTab.jsx
git commit -m "HomeTab: remove member greeting/avatar, use date-based greeting"
```

---

### Task 12: Wire `BillRemindersTab` as its own top-level tab, final cleanup

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add the `bills` tab case**

In the `<main className="app-content">` block, add:
```jsx
{activeTab === 'bills' && (
  <BillRemindersTab
    bills={bills}
    onToggleBillPaid={handleToggleBillPaid}
    onAddBill={handleAddBill}
  />
)}
```
Remove the `members` prop from this call if any leftover reference exists (Task 5 should have already removed the combined members+bills block — this step adds the replacement).

- [ ] **Step 2: Delete the temporary parser script**

```bash
git rm scripts/parse-budget-excel.mjs scripts/parsed-budget-data.json scripts/generated-blocks.txt
```
(Its output is already committed inside `mockData.js` from Task 3 — keeping the script around risks someone re-running it against a stale local copy of the spreadsheet later and silently reverting manual category-name tweaks.)

- [ ] **Step 3: Full repo-wide verification**

Run: `cd /home/claude/claude/Projects/family-budget-app && grep -rn "members\|memberId\|activeMemberId\|DEFAULT_MEMBERS\|FamilyMemberBar\|MembersTab" src/`
Expected: **zero matches**. (`DEFAULT_MEMBERS`/`PERSONAL_CATEGORIES` in `mockData.js` are unrelated — wait, `DEFAULT_MEMBERS` itself should also be gone if nothing imports it. If this grep finds `DEFAULT_MEMBERS` still defined in `mockData.js`, delete that export too — nothing should reference it after this task.)

Run: `npm run lint && npm run build`
Expected: both succeed with zero errors/warnings beyond the pre-existing chunk-size-limit notice.

- [ ] **Step 4: Manual spot-check against the spreadsheet**

Start the dev server (`npm run dev`), open the app, set the month selector to August 2024, and confirm: Budgets tab shows Provisions budget ₹12,000 / actual ₹10,637 / Diff ₹1,363 (matches the sheet exactly); Insights tab's Income Total shows ₹57,600 and Expense Total/Difference match the sheet's row-21/row-23 figures for that month.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Wire Bills as its own tab, remove temporary parser script, final member-model cleanup"
```
