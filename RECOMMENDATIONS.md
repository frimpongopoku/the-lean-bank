# The Lean Bank — UI, UX & Architecture Recommendations

**Version**: 1.0  
**Date**: 2026-04-30  
**Status**: Review Document

---

## Preface

This document is a critical review of the current product, written from the perspective of a user experience designer and software architect. It is organised into three sections:

1. **UI Changes** — visual and interaction-level improvements to existing screens.
2. **UX & Architecture Changes** — structural and flow-level improvements to how the product works.
3. **Missing Features** — functionality gaps that are likely to cause friction or limit the product's usefulness.

Each recommendation is given a **priority** (P1 = critical, P2 = important, P3 = nice-to-have) and an **effort** estimate (S = small, M = medium, L = large).

---

## Section 1: UI Changes

---

### UI-01 — Establish a Design System / Token Layer

**Priority**: P1 | **Effort**: M

**Current state**: Tailwind utility classes are applied directly and inconsistently across components. Colours, spacing, and font sizes are hard-coded inline with no shared token layer.

**Recommendation**: Define a small set of semantic design tokens in `tailwind.config.js`:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: { DEFAULT: "#...", light: "#...", dark: "#..." },
      success: "#...",
      danger:  "#...",
      warning: "#...",
      surface: { DEFAULT: "#...", muted: "#..." },
    }
  }
}
```

Map every colour use in the codebase to a semantic token (`text-danger` instead of `text-red-500`). This makes future theming or dark-mode trivial and enforces visual consistency across components that currently use ad-hoc shades of green and red.

---

### UI-02 — Empty States for Every List

**Priority**: P1 | **Effort**: S

**Current state**: When there are no pots, no partitions, no transactions, or no borrows, the UI likely renders a blank area with no guidance.

**Recommendation**: Each empty list should render a purposeful empty state that:
- Shows a contextual icon.
- Explains what the list is for in one sentence.
- Provides a direct call-to-action (e.g., "Create your first pot →").

This is especially critical for new users. An empty dashboard with no instruction creates immediate abandonment.

---

### UI-03 — Pot Card Redesign

**Priority**: P2 | **Effort**: M

**Current state**: Pot cards appear to be simple containers. The balance is masked, and actions are presented as multiple buttons stacked together.

**Recommendation**:
- Introduce a clear visual hierarchy: pot name (large), currency + balance (medium), description (small/muted).
- Replace stacked text buttons with an icon-based action bar (edit pencil, delete bin, manage arrow) with tooltip labels on hover.
- Add a subtle colour accent or avatar/initial indicator per pot to aid recognition at a glance.
- Show a progress bar or fill ratio: `(sum of partitions / pot balance) × 100%` — gives instant visual feedback on allocation status.

---

### UI-04 — Partition Cards Need Visual Hierarchy

**Priority**: P2 | **Effort**: M

**Current state**: Partition cards likely render name, abbreviation, and balance with five action buttons (Deposit, Spend, Borrow, Edit, Delete) all at the same visual weight.

**Recommendation**:
- Primary actions (Deposit, Spend) should be large, visually distinct, and colour-coded (green for Deposit, red for Spend).
- Secondary actions (Borrow, Edit, Delete) should be accessible via a `···` overflow menu or a secondary action row that appears on hover/focus.
- The abbreviation badge should be a small pill element, not inline text.
- Show a mini progress bar representing `partition balance / pot balance` so the user understands relative weight at a glance.

---

### UI-05 — Transaction List Needs Pagination or Infinite Scroll

**Priority**: P2 | **Effort**: M

**Current state**: The transaction list is capped at 100 items. Older records are only accessible by downloading a CSV or PDF. There is no pagination UI.

**Recommendation**: Implement client-side pagination (e.g., 25 per page) with Previous / Next controls, or infinite scroll triggered at the bottom of the list. All records should be accessible within the UI without requiring an export. Keep the export functionality as a supplement, not a workaround.

---

### UI-06 — Consistent and Informative Modals

**Priority**: P2 | **Effort**: M

**Current state**: Modals are implemented via a custom `EBModal` hook with portal rendering. Their internal layout and typography varies across forms.

**Recommendation**:
- Standardise a modal shell component: consistent header (title + close button), body (scrollable), and footer (action buttons).
- All destructive confirmation modals should state *exactly* what will be deleted and what the consequence is (e.g., "Deleting this pot will also remove 4 partitions and 23 transactions. This cannot be undone.").
- Form modals should show inline field-level validation errors, not just a generic toast/alert.
- Modals should be dismissible via the Escape key and by clicking the backdrop.

---

### UI-07 — Loading States Are Too Coarse

**Priority**: P2 | **Effort**: S

**Current state**: A full-screen spinner (`Loading` component) is shown while data is fetching. This causes a flash of empty content on every page load.

**Recommendation**:
- Use **skeleton screens** instead of spinners for the pot card grid and partition list. Skeletons retain layout shape and reduce perceived loading time.
- Full-screen spinners are acceptable only for the initial auth check. All subsequent data loads should use contextual skeletons.

---

### UI-08 — Typography Scale is Undefined

**Priority**: P3 | **Effort**: S

**Current state**: Font sizes appear to be applied with ad-hoc Tailwind classes without a consistent type scale.

**Recommendation**: Define and document a five-step type scale (display, heading, body, caption, label) in the Tailwind config and apply it consistently. This alone will significantly improve the perceived polish of the UI.

---

### UI-09 — Mobile-First Responsive Review

**Priority**: P2 | **Effort**: M

**Current state**: Tailwind responsive utilities are in use, but the dense action button layout on partition cards and the tab interface likely break down on screens narrower than 375px.

**Recommendation**:
- Audit every screen on 375px, 390px (iPhone 14), and 430px (iPhone 14 Pro Max) viewport widths.
- The Pot detail header with three metric blocks (Actual Value, Free Money, Checksum) likely needs to stack vertically on mobile.
- Tab labels should be icon-only on mobile with tooltips to save horizontal space.
- All touch targets must be at least 44×44px per WCAG guidelines.

---

### UI-10 — Colour Semantics for Financial Data

**Priority**: P1 | **Effort**: S

**Current state**: Green = deposits, red = withdrawals/over-allocation. This is correct convention.

**Recommendation**:
- Ensure colour is *never the only* differentiator for colour-blind users. Pair colours with icons (e.g., ↑ arrow for deposit, ↓ arrow for withdrawal) and/or text labels.
- The red "negative free money" indicator should also include a warning icon and a short explanatory label ("Over-allocated"), not just a colour change.

---

## Section 2: UX & Architecture Changes

---

### UX-01 — The "Open in New Tab" Pot Navigation is an Anti-Pattern

**Priority**: P1 | **Effort**: S

**Current state**: The "Manage" action on a pot card opens the pot detail page in a new browser tab.

**Recommendation**: Remove the new-tab behaviour. Standard in-app navigation (`router.push`) is the correct pattern here. New tabs are appropriate for external links only. Opening internal routes in new tabs breaks the browser back button, duplicates state, and confuses users who expect a single-app experience. If a user wants a new tab, they can middle-click or right-click themselves.

---

### UX-02 — Balance Update Workflow is Risky

**Priority**: P1 | **Effort**: M

**Current state**: A user can directly edit the `balance` field on a pot. This is a raw number overwrite with no audit trail. If a user miskeys their balance, there is no way to know what the previous value was or why it changed.

**Recommendation**:
- Remove the ability to directly overwrite the pot balance field.
- Replace it with an **Adjustment Transaction** workflow: the user records an adjustment (e.g., "Bank correction +50", "Interest credited +12.50") as a special transaction type. This updates the balance *and* creates an audit record.
- If direct editing must be retained for simplicity, at minimum log a system transaction: `"Balance adjusted from X to Y"`.

---

### UX-03 — Partition Balance Can Drift From Transaction History

**Priority**: P1 | **Effort**: L

**Current state**: Partition balance is stored as a static number in the `parts` array on the pot document. Transactions do not recalculate this number — the number is mutated directly in state. If any transaction write fails silently, or if the user edits the partition balance directly via the Edit form, the partition balance will diverge from the sum of its transactions.

**Recommendation**:
- The partition balance should be the **computed sum of all its transactions** (deposits − withdrawals), not a separately stored value.
- This requires migrating transaction storage: each partition needs its own transaction sub-collection (or a reliable way to filter by `part_id`).
- The Edit partition form should not allow direct balance editing. If the user needs to correct a balance, they record an adjustment transaction.
- This is the most important architectural change in this document. Without it, the app's data integrity guarantees are weak.

---

### UX-04 — The Borrow Flow Creates Redundant Records

**Priority**: P2 | **Effort**: M

**Current state**: When a borrow is created, two records are written: a `Borrow` record and a `Withdrawal` transaction. When a borrow is repaid to the wallet, a `Deposit` transaction is created. This is correct but creates potential confusion: the Transactions tab will show a withdrawal that is actually a borrow, with no visual distinction.

**Recommendation**:
- Add a `borrow_id` field to the automatically created transaction record so borrowing-linked transactions can be visually distinguished in the transactions list (e.g., a small "🔗 Borrow" badge).
- On repayment, the deposit transaction should also reference the original `borrow_id`.
- This links the full lifecycle of a borrow (creation → repayment) across both the Borrows and Transactions tabs.

---

### UX-05 — Firestore Document Grows Without Bound

**Priority**: P1 | **Effort**: L

**Current state**: All transactions are stored in a single Firestore document (`TRANSACTIONS`) as an array field. Firestore documents have a **1 MB size limit**. A user with thousands of transactions will silently hit this limit and writes will begin failing.

**Recommendation**:
- Migrate to a **Firestore sub-collection** model where each transaction is its own document:
  ```
  users/{userId}/transactions/{transactionId}
  ```
- This is unbounded in scale, queryable server-side (filter by `pot_id`, `part_id`, date range), and avoids the array-mutation read-modify-write pattern that currently requires reading the entire document before every write.
- The same applies to the `BORROWED` document.
- This is a breaking data migration but is essential before the app has real users.

---

### UX-06 — Context Providers Have No Error Boundary

**Priority**: P2 | **Effort**: S

**Current state**: The four nested context providers (`AuthProvider → PotsProvider → TransactionProvider → BorrowProvider`) have no error boundaries. A Firestore read failure in any provider will propagate as an unhandled exception and crash the entire app.

**Recommendation**:
- Wrap each provider (or the root layout) in a React Error Boundary.
- Each provider should handle its own `try/catch` for Firestore operations and expose an `error` state alongside `loading`.
- Show a contextual error message (e.g., "Could not load your transactions. Retry?") rather than a blank screen or full crash.

---

### UX-07 — No Optimistic Update Rollback

**Priority**: P2 | **Effort**: M

**Current state**: State is updated immediately in the React context before Firestore confirms the write. If the Firestore write fails (network error, quota limit, Firestore outage), the UI shows incorrect data with no recovery.

**Recommendation**:
- Implement a write-confirmation pattern: keep a `pending` flag per operation, and only commit the UI update after Firestore ACKs the write (or use optimistic updates with rollback on failure).
- At minimum, catch Firestore write errors and display a toast notification with a retry option, then revert the local state to its pre-write value.

---

### UX-08 — The Init Page is a Redundant Step

**Priority**: P2 | **Effort**: S

**Current state**: After first login, the user is routed to `/init` where they must click a "Setup" button to initialise their Firestore collections. This is a dead screen with no content.

**Recommendation**:
- Remove `/init` as a user-facing route entirely.
- Initialise Firestore collections automatically and silently inside `AuthProvider` when a new user first signs in (the code already does Firestore initialisation — the `/init` page appears to be an unnecessary extra confirmation step).
- Route the user directly to `/home` after first login.

---

### UX-09 — No Feedback on Async Operations

**Priority**: P2 | **Effort**: S

**Current state**: Form submissions (create pot, deposit, spend, etc.) likely provide no loading feedback between the user submitting and the operation completing. There may also be no success confirmation.

**Recommendation**:
- Every async form submission should: (1) disable the submit button and show a spinner while in-flight, (2) show a success toast on completion, (3) show an error message on failure.
- Use a lightweight toast library (e.g., `react-hot-toast`) or implement a minimal custom toast system. Currently there is no toast infrastructure in the project.

---

### UX-10 — Pot Name in Browser Tab

**Priority**: P3 | **Effort**: S

**Current state**: The pot detail page sets the document title to the pot's name via `useEffect`. This is good. Verify the home page also sets a meaningful title (e.g., "The Lean Bank — Dashboard") and the auth page sets "Sign in — The Lean Bank". Consistent, descriptive page titles improve navigation via browser history and accessibility for screen readers.

---

### UX-11 — Data is Not Portable

**Priority**: P2 | **Effort**: M

**Current state**: Users can export individual transaction or borrow lists as CSV/PDF per pot. There is no way to export the full account: all pots, all partitions, all transactions in a single file.

**Recommendation**:
- Add a **Full Export** option on the dashboard (or in a settings page) that exports all pots and their partition and transaction data into a single structured JSON or multi-sheet CSV.
- This is essential for users who want to migrate away from the app or take an account-level snapshot for tax purposes.

---

## Section 3: Missing Features

---

### MF-01 — Dashboard-Level Financial Summary

**Priority**: P1 | **Effort**: M

**Current state**: The home dashboard shows individual pot cards but no aggregated view of total wealth across all pots.

**Recommendation**: Add a summary bar or hero section at the top of the dashboard showing:
- **Total across all pots** (grouped by currency, since cross-currency addition is meaningless).
- **Total allocated** (sum of all partitions across all pots).
- **Total free money** (sum of unallocated balances).
- **Outstanding borrows** (total unpaid borrow amount).

This gives the user a single-glance financial overview without having to open each pot individually.

---

### MF-02 — Search & Full-Text Filter for Transactions

**Priority**: P2 | **Effort**: M

**Current state**: Transactions can only be filtered by partition source. There is no keyword search.

**Recommendation**: Add a search input above the transaction list that filters by description text in real time. For users with many transactions, the inability to search by keyword (e.g., "groceries", "rent") severely limits usefulness.

---

### MF-03 — Date Range Filter for Transactions and Borrows

**Priority**: P2 | **Effort**: M

**Current state**: No date filtering exists. All transactions are shown (up to 100).

**Recommendation**: Add a date range picker (start date / end date) to both the Transactions and Borrows tabs. Common presets (This Month, Last 3 Months, This Year) reduce friction. This is essential for users performing monthly reviews or preparing tax records.

---

### MF-04 — Transaction Summary / Spending Report

**Priority**: P2 | **Effort**: L

**Current state**: Transactions are a flat list. There is no aggregation or summary.

**Recommendation**: Add a simple summary view on the Transactions tab showing:
- Total deposited vs. total withdrawn for the selected period.
- A breakdown of withdrawals by partition (bar chart or table).
- Net movement (deposits − withdrawals).

This transforms the app from a ledger into a basic reporting tool, which is the natural next need for a user who has been tracking for a few months.

---

### MF-05 — Recurring / Scheduled Entries

**Priority**: P3 | **Effort**: L

**Current state**: Every deposit, withdrawal, and borrow is entered manually.

**Recommendation**: Allow users to define recurring transactions (e.g., "Salary: +5000 to Savings partition, every 1st of the month"). On the scheduled date, the app presents a prompt: "Your scheduled transaction is due — confirm or skip." This avoids fully automatic writes (which would require a server-side cron) while significantly reducing repetitive manual entry.

---

### MF-06 — Transfer Between Partitions

**Priority**: P1 | **Effort**: M

**Current state**: There is no way to move money from one partition to another within the same pot (or across pots). A user who wants to reallocate funds must manually spend from one partition and deposit into another — creating two transaction records and requiring them to know the correct amounts.

**Recommendation**: Add a **Transfer** action that:
- Asks for source partition, destination partition, amount, and description.
- Creates a `Withdrawal` from the source and a `Deposit` to the destination in a single atomic operation.
- Clearly marks both transactions as transfers (linked by a `transfer_id`) so they are distinguishable in the transaction log.
- Optionally supports cross-pot transfers (source pot → destination pot).

---

### MF-07 — Borrow Partial Repayments

**Priority**: P2 | **Effort**: M

**Current state**: Borrows are binary: paid or unpaid. There is no way to record a partial repayment.

**Recommendation**:
- Add a `paid_amount` field to the `Borrow` model.
- The "Pay" workflow should ask: "How much are you repaying?" with the full outstanding amount pre-filled.
- If `paid_amount < amount`, the borrow remains unpaid with a reduced outstanding balance.
- Show payment history per borrow record.

---

### MF-08 — Account Settings Page

**Priority**: P2 | **Effort**: M

**Current state**: There is no settings page. The only user-facing config is the default currency on pot creation.

**Recommendation**: Add a `/settings` route with:
- **Default currency**: Pre-fills new pot creation forms.
- **Display name**: Allow the user to override their Google display name within the app.
- **Data management**: Full export (see MF-01) and a "Delete all data" option.
- **Sign out**: Move sign-out here rather than burying it in the header.

---

### MF-09 — Undo for Destructive Actions

**Priority**: P2 | **Effort**: M

**Current state**: Deleting a pot, partition, or transaction is permanent and immediate (post-confirmation modal).

**Recommendation**: Implement a short-lived (5–10 second) **undo toast** after any delete operation. During the window, the deletion is held in memory and not yet committed to Firestore. If the user clicks "Undo", the record is restored. After the window expires, the Firestore delete is committed. This dramatically reduces anxiety around destructive actions and is a well-established pattern (Gmail, Notion, etc.).

---

### MF-10 — Offline Support / PWA

**Priority**: P3 | **Effort**: L

**Current state**: The app requires a live internet connection. There is no service worker, no caching, and no offline fallback.

**Recommendation**: Convert the app to a **Progressive Web App (PWA)** with:
- A service worker that caches the app shell and the last-known data snapshot.
- Firebase's offline persistence (`enableIndexedDbPersistence`) to queue writes when offline and sync when the connection is restored.
- An "Offline" banner when the app detects no connectivity.

This is especially valuable for a personal finance app that users open frequently and often in low-connectivity situations (e.g., on mobile data).

---

### MF-11 — Notifications / Reminders

**Priority**: P3 | **Effort**: L

**Current state**: No notification system exists.

**Recommendation** (future phase):
- Browser push notifications (via Web Push API) for outstanding borrow reminders.
- A periodic digest (weekly summary of net movement per pot).
- Alerts when free money goes negative (over-allocation warning).

This requires a server-side component (Firebase Cloud Functions or a lightweight edge function) to trigger scheduled notifications, which is a meaningful infrastructure addition.

---

### MF-12 — Audit Log / Change History

**Priority**: P2 | **Effort**: M

**Current state**: Direct edits to pot name, pot balance, and partition balance leave no trace in any log.

**Recommendation**: Maintain a lightweight `AUDIT_LOG` collection in Firestore that records every mutation with:
- Timestamp
- User ID
- Action type (e.g., `POT_BALANCE_UPDATED`, `PARTITION_EDITED`)
- Before/after values

This need not be exposed in the UI initially, but having the data means historical bugs can be investigated and the product can offer a "history" view in a future iteration.

---

### MF-13 — Currency Conversion / Reference Rates

**Priority**: P3 | **Effort**: M

**Current state**: Multi-currency pots are supported but no conversion is performed. The dashboard cannot aggregate across currencies.

**Recommendation**: Integrate a free exchange rate API (e.g., Open Exchange Rates, ExchangeRate.host) to:
- Show a "converted total" on the dashboard in a user-selected reference currency.
- Clearly label converted values as approximate and timestamp the rate used.
- Cache rates locally (refresh once per day) to avoid excessive API calls.

---

### MF-14 — Dark Mode

**Priority**: P3 | **Effort**: M

**Current state**: No dark mode. The app appears to use a light theme only.

**Recommendation**: Implement dark mode using Tailwind's `dark:` variant classes, toggled by a user preference stored in `localStorage` and synced with the OS `prefers-color-scheme` media query. Given the design token work recommended in UI-01, dark mode becomes straightforward once semantic colour tokens are in place.

---

### MF-15 — Accessibility (A11y) Audit

**Priority**: P1 | **Effort**: M

**Current state**: No evidence of an accessibility audit in the codebase. Key concerns:
- Custom modals may not trap focus or announce to screen readers.
- Masked numbers rendered as `****` have no `aria-label` explaining what they represent.
- Icon-only buttons may lack accessible labels.
- Colour is used as the sole indicator for financial status (see UI-10).

**Recommendation**: Run an automated audit (Axe, Lighthouse) and address all critical and serious violations. At minimum:
- All interactive elements must have visible focus indicators.
- All icon-only buttons must have `aria-label` attributes.
- Modals must use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and focus trapping.
- Masked number toggles must announce their state to screen readers (`aria-pressed`).

---

## Priority Matrix Summary

| ID | Recommendation | Priority | Effort |
|---|---|---|---|
| UX-01 | Remove new-tab pot navigation | P1 | S |
| UX-02 | Replace direct balance edit with adjustment transactions | P1 | M |
| UX-03 | Derive partition balance from transactions (not stored value) | P1 | L |
| UX-05 | Migrate to Firestore sub-collections (unbounded scale) | P1 | L |
| MF-01 | Dashboard-level financial summary | P1 | M |
| MF-06 | Transfer between partitions | P1 | M |
| MF-15 | Accessibility audit & remediation | P1 | M |
| UI-01 | Design system / token layer | P1 | M |
| UI-02 | Empty states for all lists | P1 | S |
| UI-10 | Colour semantics (not colour alone) | P1 | S |
| UX-04 | Link borrow records to transactions | P2 | M |
| UX-06 | Error boundaries on context providers | P2 | S |
| UX-07 | Optimistic update rollback on Firestore failure | P2 | M |
| UX-08 | Remove the /init page (auto-init on first login) | P2 | S |
| UX-09 | Toast feedback on async operations | P2 | S |
| UX-11 | Full data export (all pots, all history) | P2 | M |
| UI-03 | Pot card visual redesign | P2 | M |
| UI-04 | Partition card visual hierarchy & overflow menu | P2 | M |
| UI-05 | Transaction pagination / infinite scroll | P2 | M |
| UI-06 | Standardise modal shell & confirmations | P2 | M |
| UI-07 | Skeleton screens instead of full-page spinners | P2 | S |
| UI-09 | Mobile-first responsive review | P2 | M |
| MF-02 | Keyword search for transactions | P2 | M |
| MF-03 | Date range filter for transactions & borrows | P2 | M |
| MF-04 | Transaction summary / spending report | P2 | L |
| MF-07 | Borrow partial repayments | P2 | M |
| MF-08 | Account settings page | P2 | M |
| MF-09 | Undo for destructive actions | P2 | M |
| MF-12 | Audit log / change history | P2 | M |
| UI-08 | Typography scale | P3 | S |
| UX-10 | Consistent page titles | P3 | S |
| MF-05 | Recurring / scheduled entries | P3 | L |
| MF-10 | Offline support / PWA | P3 | L |
| MF-11 | Notifications / reminders | P3 | L |
| MF-13 | Currency conversion / reference rates | P3 | M |
| MF-14 | Dark mode | P3 | M |

---

## Recommended Implementation Order

### Phase 1 — Stability & Data Integrity (Do First)
These address silent data corruption risks or architecture limits that become harder to fix as the user base grows.

1. **UX-05** — Migrate to Firestore sub-collections.
2. **UX-03** — Derive partition balance from transactions.
3. **UX-06 + UX-07** — Error boundaries and write failure handling.
4. **UX-08** — Remove the /init page.

### Phase 2 — UX Polish & Core Gaps (Ship Next)
Address the most visible friction points and missing day-one functionality.

5. **UI-01 + UI-08** — Design tokens and typography scale (enables all subsequent UI work).
6. **UI-02** — Empty states.
7. **UX-01** — Fix pot navigation (remove new-tab).
8. **UX-02** — Adjustment transaction workflow.
9. **UX-09** — Toast feedback.
10. **MF-06** — Partition-to-partition transfers.
11. **MF-01** — Dashboard summary.

### Phase 3 — Features for Retention
For users who have been using the app for 1–3 months and are outgrowing it.

12. **MF-03** — Date range filter.
13. **MF-02** — Keyword search.
14. **MF-04** — Transaction summary / report.
15. **MF-07** — Partial borrow repayments.
16. **MF-08** — Settings page.
17. **MF-09** — Undo for deletes.
18. **MF-15** — Accessibility audit.

### Phase 4 — Growth & Delight
Lower-priority additions that improve experience and expand the app's reach.

19. **MF-10** — PWA / offline support.
20. **MF-14** — Dark mode.
21. **MF-13** — Currency conversion.
22. **MF-11** — Notifications.
23. **MF-05** — Recurring transactions.
