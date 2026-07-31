# Replace Sample Data with Real Household Budget (from Google Drive spreadsheet)

## Context

The app currently runs on invented sample data: a fictional 4-person family
(Dad/Mom/Alex/Emma), generic categories (Groceries, Dining, Entertainment...),
and a single fixed budget limit per category.

The user's real Google Drive file `Home Budget_updated.xlsx` has two sheets:

- **"Month wise budget vs Actual"** — 24 months (Aug 2024 → Jul 2026) of
  Budget / Actual / Diff per category. Budget limits are *not* fixed — they
  change over time (e.g. Salary: ₹50,000 → ₹42,400 → ₹37,400 across the
  sheet).
- **"Details of expenditure"** — day-by-day actual transactions for the same
  24 months, same category columns.

There is no per-person breakdown anywhere in the sheet — it's a household
income/expense tracker, not a multi-member one.

## Decisions (confirmed with user)

1. Replace the app's fictional categories with the real ones from the sheet,
   and import the 24 months of real transaction history.
2. Drop the family-member model entirely (no more Dad/Mom/Alex/Emma tabs) —
   the real data has no per-person dimension.
3. Budget limits are per-month and historical, matching the sheet exactly —
   not collapsed to a single "current" value.

## Data model changes

**Categories** (`mockData.js`): replace `DEFAULT_CATEGORIES` with the real
taxonomy. Each category's `limit: number` becomes `limitsByMonth: { 'YYYY-MM':
number }`. A helper `getCategoryLimitForMonth(cat, month)` resolves the exact
month if present, else falls back to the closest earlier known month (budgets
don't have gaps in the source sheet, so exact match should always hit for
imported months; the fallback only matters for months outside the imported
range).

Real categories, all `type: 'expense'` unless noted, **names cleaned up and
rewritten** from the sheet's raw column headings (not verbatim — proper
phrasing instead of spreadsheet-header shorthand), colors drawn from the
existing token palette established in the earlier UI-polish pass:

| id | sheet heading | display name | icon |
|---|---|---|---|
| provisions | Provisions | Provisions | 🛒 |
| veg-others | Veg.&Others | Vegetables & Others | 🥦 |
| sunday-expenses | Sunday Expenses | Sunday Expenses | 🛍️ |
| milk-bill | Milk Bill | Milk | 🥛 |
| sweeper-dust | Sweeper/Dust | Cleaning & Housekeeping | 🧹 |
| electricity-bill | Electricity Bill | Electricity Bill | ⚡ |
| diesel | Diesel | Diesel | ⛽ |
| petrol | Petrol | Petrol | ⛽ |
| medicine | Medicine | Medical Expenses | 💊 |
| pocket-money | Pocket Money | Pocket Money | 👛 |
| mobile-bill | Mobile Bill | Mobile Bill | 📱 |
| gas | gas | Cooking Gas | 🔥 |
| gift | Gift | Gifts | 🎁 |
| savings-lalitha | Savings-Lalitha | Lalitha's Savings | 💰 |
| other-expenses | Savings-Others | Other Expenses | 📦 |

**`other-expenses`** replaces the sheet's "Savings-Others" catch-all — it's
the one category that isn't a fixed real-world thing, so instead of a vague
literal name it becomes a proper catch-all: picking it in `AddExpenseSheet`
reveals a required "What's this for?" text field. That entered text becomes
the transaction's title (falls back to "Other Expenses" if left blank) — a
free-text label per entry, not a system for creating new formal categories
(keeps this simple; the category itself, its color/icon/budget line, stays
singular).

**Income** — two new income-type categories, `salary` and `rental-income`
("Rent" in the sheet is income received, not a housing expense — there is no
housing-expense category in the source data at all).

**Transactions** (`INITIAL_TRANSACTIONS`): generated from "Details of
expenditure" — one transaction per non-zero category cell per day, across all
24 months. `memberId` is dropped from the transaction shape entirely. Where
the sheet has no description text, the transaction title falls back to the
category name (matches how the app already titles category-only entries
elsewhere, e.g. `AddExpenseSheet`'s `defaultTitle` logic). Any imported
"Savings-Others" entries land under `other-expenses` with the original
sheet description (if present) carried over as the transaction title.

**Bills** (`INITIAL_BILLS`): untouched — bills are a separate feature not
present in this spreadsheet.

**Storage** (`storage.js`): bump `KEYS` version again (v5 → v6) so this
schema change reseeds cleanly instead of merging with old member-shaped data
already in someone's browser.

## Component changes (member-model removal)

Members touch 15 files per a repo-wide grep. Concretely:

- **Removed entirely**: `FamilyMemberBar.jsx`, `MembersTab.jsx`,
  `DEFAULT_MEMBERS` export.
- **`App.jsx`**: drop `members`/`activeMemberId` state, the
  `FamilyMemberBar` render, `handleAddMember`, and the `members` tab case
  (currently renders `MembersTab` + `BillRemindersTab` together).
- **Bottom nav** (`BottomNav.jsx`): currently mislabeled — "Bills" opens
  `BudgetsTab`, and real bill reminders live inside "You" (`MembersTab` +
  `BillRemindersTab`). Bills tab stays (confirmed) — with `MembersTab` gone,
  the mislabeling gets fixed as a natural consequence: nav becomes **Home /
  Insights / + / Budgets / Bills**, where "Budgets" opens `BudgetsTab` and
  "Bills" opens `BillRemindersTab` directly, its own tab, no more nesting
  under a members tab.
- **`AddExpenseSheet.jsx`**: remove the "who spent" member-picker field and
  the earner-name-dependent income logic (`Dad's Income`/`earner.name`
  fixes from the polish pass become moot — income entries just pick between
  Salary/Rent).
- **`ExpensesTab.jsx`, `GraphsTab.jsx`, `BudgetsTab.jsx`,
  `HomeTab.jsx`**: drop `activeMemberId` filtering and any per-member
  display (avatar/name on transaction rows, the member bar-chart in
  `GraphsTab`, the hero-panel "Hi, {member}" greeting in `HomeTab`).
- **`BudgetsTab.jsx`**: gains the sheet's own vocabulary — show *Diff*
  (Budget − Actual) per category for the selected month, using
  `getCategoryLimitForMonth`, not just a spent/limit percentage.
- **`GraphsTab.jsx`**: gains a summary section at the top for the selected
  month, in the sheet's own vocabulary — **Income Total**, **Expense
  Total**, **Difference** (Income Total − Expense Total, exactly what the
  sheet's own Difference row computes). The removed per-member bar chart
  slot is replaced with a Budget vs Actual variance chart (per category,
  selected month) — the actual core feature of the source spreadsheet, so
  it belongs here rather than being dropped.
- **`ExcelImportModal.jsx` / `excelParser.js`**: unrelated feature (lets a
  user import their *own* sheet at runtime) — left as-is, not rewired to
  this specific spreadsheet's column layout. Out of scope per the second
  option the user didn't pick.

## Import approach

One-time, not a live Drive integration (the app has no backend). A local
Node script (using the `xlsx` package already in `package.json`) parses the
already-downloaded `Home_Budget_updated.xlsx`, emitting the category list
with `limitsByMonth` and the full transaction array. That output replaces
`DEFAULT_CATEGORIES` / `INITIAL_TRANSACTIONS` in `mockData.js` directly —
this is a data snapshot at import time, not a synced connection. Re-running
the script later (or using the existing Excel importer) is how future
updates would come in.

## Verification

- `npm run lint && npm run build` clean after each step.
- Spot-check: total imported transaction count and a couple of known
  amounts (e.g. September 2024 row `3,4: 500,1000,...,3800` total) match
  what the sheet shows, to catch parsing errors.
- Manually walk a few months in the Budgets tab and confirm the Diff shown
  matches the sheet's own Diff column for that month.
- No leftover references to `members`/`memberId`/`activeMemberId` anywhere
  in `src/` after the change (grep clean).

## Out of scope

- Live Google Drive sync (one-time import only).
- Rewiring the existing Excel/CSV importer to this spreadsheet's specific
  layout.
- Any change to Bills or Personal Savings tracker features.
