# UI Polish Audit — Remaining Screens

## Context

Home and Members tabs already got a bug-level UI pass (commits `f02a1c7`,
`af0c141`): hardcoded fake metrics wired to real data, dead 2b/2c toggle
removed, invisible progress bar fixed (missing CSS classes), member/category
colors moved from random Tailwind swatches to the app's actual token palette
(`index.css :root`), a broken ZWJ emoji swapped for one that renders, status
bar repositioned and gated to frame mode only.

This spec covers the same treatment for the rest of the app.

## Objective

Sweep every remaining screen for the same class of issues, fix them, and get
sign-off screen by screen — no structural or navigation changes (per user:
"bug-level polish," not IA rework or full redesign).

## Scope — screens, in order

1. `ExpensesTab.jsx` — transaction list/filter view
2. `GraphsTab.jsx` — charts/insights
3. `BudgetsTab.jsx` — category budgets
4. `BillRemindersTab.jsx` — bill reminders (nested inside the Members/"You" tab)
5. `AddExpenseSheet.jsx` + `ExcelImportModal.jsx` — the two modals

Out of scope: renaming/moving nav items (e.g. bottom-nav "Bills" actually
opens `BudgetsTab`, not `BillRemindersTab` — noted, not touched), any new
features, any change to `PersonalSavingsTracker.jsx` (already redesigned
recently per git log), layout/typography system overhaul.

## What counts as a fix

Same checklist that found real bugs in Home/Members — apply per screen:

- **Broken/missing CSS**: classes referenced in JSX that don't exist in
  `index.css` (silently renders unstyled — this is how the Members progress
  bar went invisible).
- **Hardcoded fake data**: numbers/strings that look computed but are
  static, so they never update when real data changes.
- **Palette drift**: any hex color not drawn from the app's own tokens
  (`--orange-primary`, `--orange-bright`, `--orange-dark`, `--green-accent`,
  `--green-dark`, `--coral-accent`, `--gold-accent`, `--teal-accent`,
  `--berry-accent`, text/bg tokens) — replace with the matching token.
- **Emoji/rendering glitches**: multi-codepoint ZWJ emoji sequences that can
  fall back to a boxed placeholder glyph.
- **Dead/redundant code**: unused branches, duplicate UI showing the same
  info twice, leftover dev scaffolding.
- **Inconsistent spacing/sizing**: icon buttons or cards in the same row
  using different dimensions/shapes without reason.

Not a fix target: anything that requires moving a feature, renaming a nav
label, or changing information architecture.

## Process (per screen)

1. Read the component source (+ anything it renders inline).
2. Cross-check every CSS class it references against `index.css`.
3. Cross-check every color literal against the token list above.
4. Flag findings, apply fixes.
5. `npm run lint && npm run build` — must pass clean.
6. Show the user what changed and why.
7. On approval: one commit for that screen, pushed immediately.
8. Move to the next screen.

## Verification

- `npm run lint` and `npm run build` clean after every screen's fix, before
  the commit for that screen.
- No behavior change beyond what's listed as a fix — this is a polish pass,
  not a refactor.

## Commit convention

One commit per screen, message format matching the existing history style:
`Fix <screen> UI: <short list of what was wrong>`, pushed right after each
approval — matches `af0c141`'s style already on this branch.
