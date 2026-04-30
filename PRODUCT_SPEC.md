# The Lean Bank — Product Specification

**Version**: 1.0  
**Date**: 2026-04-30  
**Status**: Living Document

---

## 1. Overview

The Lean Bank is a personal finance management web application that helps individuals allocate, track, and audit their money using a **Pots → Partitions → Transactions** hierarchy. Rather than aggregating bank accounts, it gives users a structured way to mentally "assign" funds to specific purposes and track movements across those assignments.

The core metaphor: a **Pot** represents a real bank account or money pool; **Partitions** are virtual envelopes within that pot (e.g., Savings, Rent, Emergency Fund); **Transactions** are the deposits and withdrawals recorded against each partition.

---

## 2. Goals

- Give individuals a clear picture of where their money is allocated at any moment.
- Prevent over-allocation through a real-time checksum/integrity system.
- Provide an audit trail of all financial movements, exportable for record-keeping.
- Track informal loans (borrows) against specific partitions with a repayment workflow.
- Remain lightweight, fast, and accessible from any device.

---

## 3. Non-Goals

- Not a bank integration tool (no Open Banking / Plaid connectivity).
- Not a budgeting tool with spending categories or income forecasting.
- Not multi-user or shared-account (single-user model only).
- No bill reminders, recurring transaction scheduling, or notifications.
- No native mobile app (web-only).

---

## 4. Users

| Persona | Description |
|---|---|
| **Primary User** | An individual managing personal savings across multiple goals or accounts. Comfortable with basic web apps. |
| **Power User** | A financially organised individual who runs multiple pots in different currencies and regularly exports records. |

No admin or multi-tenant user roles exist. All data is scoped to a single authenticated user.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.1.5 (App Router, React 19) |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication (Google OAuth) |
| State Management | React Context API + custom hooks |
| Styling | Tailwind CSS 3.4.1 |
| Icons | FontAwesome 6.7.2 |
| Animations | @react-spring/web |
| Exports | jsPDF + jsPDF-autotable, FileSaver |
| Hosting | Vercel-ready |

---

## 6. Data Models

### 6.1 Pot

Represents a real-world bank account or money pool.

| Field | Type | Description |
|---|---|---|
| `id` | string | `pot_` + timestamp + random suffix |
| `name` | string | User-defined name (e.g., "GCB Savings") |
| `balance` | number | Actual account balance |
| `currency` | string | ISO currency code (e.g., "GHS", "USD") |
| `description` | string | Optional notes |
| `user_id` | string | Firebase UID of owner |
| `createdAt` | Date | Creation timestamp |
| `parts` | Partition[] | Nested array of partitions |

### 6.2 Partition

A virtual sub-category within a pot (e.g., "Emergency Fund", "Rent").

| Field | Type | Description |
|---|---|---|
| `id` | string | `prt_` + timestamp + random suffix |
| `name` | string | Partition label |
| `abbreviation` | string | Short display label (e.g., "SAV") |
| `balance` | number | Allocated amount |
| `description` | string | Optional notes |
| `currency` | string | Currency (inherits from pot) |
| `pot_id` | string | Reference to parent pot |
| `date` | Date | Creation timestamp |

### 6.3 Transaction

A record of a deposit or withdrawal against a partition.

| Field | Type | Description |
|---|---|---|
| `id` | string | `dep_` / `wit_` / `txn_` prefix + timestamp + random |
| `date` | Date | Transaction timestamp |
| `type` | `"Deposit"` \| `"Withdrawal"` | Direction of funds |
| `amount` | number | Transaction amount |
| `source` | string | Partition name at time of transaction |
| `pot_id` | string | Reference to parent pot |
| `part_id` | string | Reference to source partition |
| `description` | string | User-provided note |

### 6.4 Borrow

A loan recorded against a partition, with a repayment workflow.

| Field | Type | Description |
|---|---|---|
| `id` | string | `bor_` + timestamp + random suffix |
| `amount` | number | Amount borrowed |
| `source` | string | Partition name at time of borrow |
| `source_id` | string | Partition ID |
| `pot_id` | string | Reference to parent pot |
| `part_id` | string | Reference to source partition |
| `description` | string | Purpose of borrow |
| `date` | Date | Borrow timestamp |
| `paid` | boolean | Repayment status |

### 6.5 Firestore Structure

```
{userId}/              ← Top-level collection (keyed by Firebase UID)
  meta                 ← Initialization metadata document
  POTS                 ← Document: { key, pots: Pot[] }
  TRANSACTIONS         ← Document: { key, transactions: Transaction[] }
  BORROWED             ← Document: { key, borrowed: Borrow[] }
```

---

## 7. Feature Specifications

---

### F-01: Authentication

**Description**: Users sign in exclusively via Google OAuth through Firebase Authentication. All data is scoped to the authenticated user's UID.

**User Stories**:
- As a user, I can sign in with my Google account.
- As a user, I am automatically redirected to the dashboard after signing in.
- As a user, I am redirected to the login page if I am not authenticated.
- As a user, I can sign out from any page.

**Acceptance Criteria**:
- [ ] Login page renders at `/auth` with a "Sign in with Google" button.
- [ ] Successful authentication redirects to `/home`.
- [ ] All non-auth routes are protected by AuthGuard; unauthenticated access redirects to `/auth`.
- [ ] Sign-out clears local state and redirects to `/auth`.
- [ ] On first login, Firestore collections are auto-initialised for the user.

---

### F-02: First-Time Setup (Initialisation)

**Description**: On first login, the application detects the absence of user data and guides the user through a one-time setup to initialise their Firestore collections.

**User Stories**:
- As a new user, I am guided through a setup step before I can use the app.

**Acceptance Criteria**:
- [ ] After first login, if Firestore collections do not exist, user is redirected to `/init`.
- [ ] The init page shows a "Setup" action.
- [ ] Clicking "Setup" creates the `POTS`, `TRANSACTIONS`, and `BORROWED` Firestore documents.
- [ ] After successful initialisation, the user is redirected to `/home`.

---

### F-03: Pots Dashboard

**Description**: The main dashboard (`/home`) displays all of the user's pots in a responsive grid with key summary information.

**User Stories**:
- As a user, I can see all my pots at a glance.
- As a user, I can create a new pot.
- As a user, I can edit a pot's details.
- As a user, I can delete a pot.
- As a user, I can navigate into a pot to manage its partitions and transactions.

**Acceptance Criteria**:
- [ ] Dashboard renders all pots in a responsive card grid.
- [ ] Each pot card displays: name, currency, balance (masked by default), and action buttons.
- [ ] An "Add Pot" button opens a modal form.
- [ ] Pot creation requires: name (required), currency (required), initial balance (required), description (optional).
- [ ] After creation, the new pot appears in the grid immediately (optimistic update).
- [ ] Each pot card has an Edit button that opens the same form pre-filled.
- [ ] Each pot card has a Delete button that triggers a confirmation modal before deletion.
- [ ] Each pot card has a "Manage" button that navigates to `/pot/[id]`.
- [ ] User's display name appears as a greeting in the header.
- [ ] Loading and error states are handled gracefully.

---

### F-04: Pot Detail View

**Description**: The single pot page (`/pot/[id]`) provides a tab-based interface for managing partitions, reviewing transactions, and tracking borrows for a specific pot.

**User Stories**:
- As a user, I can see the financial health of a single pot at a glance.
- As a user, I can switch between Partitions, Transactions, and Borrows views.
- As a user, I can edit the pot's name and balance.
- As a user, I can navigate back to the dashboard.

**Acceptance Criteria**:
- [ ] Page renders at `/pot/[id]` and loads the correct pot.
- [ ] Header shows three key metrics:
  - **Actual Account Value**: The pot's declared balance.
  - **Unassigned (Free Money)**: `balance − sum of all partition balances`.
  - **Checksum Validity**: Visual status indicator (green = valid, red = invalid/over-allocated).
- [ ] Clicking the Checksum indicator opens an explanatory modal with the calculation breakdown.
- [ ] Clicking "Free Money" opens a breakdown modal.
- [ ] An Edit button allows inline editing of pot name and balance.
- [ ] Three tabs are available: **Partitions**, **Transactions**, **Borrows**.
- [ ] Tab switching is animated.
- [ ] A back button/link returns to `/home`.
- [ ] If the pot ID does not exist, a fallback/error page is shown.

---

### F-05: Partitions Management

**Description**: Within a pot's detail view, users can create and manage virtual partitions (envelopes) and perform financial actions against them.

**User Stories**:
- As a user, I can create a new partition within a pot.
- As a user, I can edit a partition's name and balance.
- As a user, I can delete a partition.
- As a user, I can deposit money into a partition.
- As a user, I can spend (withdraw) money from a partition.
- As a user, I can record a borrow against a partition.
- As a user, I can see the total allocated across all partitions.

**Acceptance Criteria**:
- [ ] Partition list renders within the "Partitions" tab.
- [ ] Each partition card displays: name, abbreviation, balance (masked), and action buttons.
- [ ] Total allocated amount is displayed beneath the partition list.
- [ ] "Add Partition" opens a modal with: name (required), abbreviation (optional), initial amount, description.
- [ ] Partition creation updates the pot's free money calculation immediately.
- [ ] Each partition has: **Deposit**, **Spend**, **Borrow**, **Edit**, **Delete** actions.
- [ ] **Deposit**: Opens a form (amount + description); increases partition balance; creates a `Deposit` transaction record.
- [ ] **Spend**: Opens a form (amount + description); decreases partition balance; creates a `Withdrawal` transaction record.
- [ ] **Borrow**: Opens a form (amount + description); decreases partition balance; creates a `Borrow` record and a `Withdrawal` transaction record.
- [ ] **Edit**: Pre-fills partition form; updates name, abbreviation, and balance.
- [ ] **Delete**: Requires confirmation modal; removes partition and adjusts pot balance.
- [ ] Masked numbers are toggleable per-partition (privacy feature).

---

### F-06: Transactions Log

**Description**: A chronological record of all deposits and withdrawals for a given pot, with filtering and export capabilities.

**User Stories**:
- As a user, I can view all transactions for a pot.
- As a user, I can filter transactions by partition.
- As a user, I can export my transaction history.

**Acceptance Criteria**:
- [ ] Transactions are displayed in the "Transactions" tab, sorted by date (most recent first).
- [ ] Each row shows: date/time, type, amount, source partition, description.
- [ ] Deposit rows are coloured green; withdrawal rows are coloured red.
- [ ] A filter/dropdown allows narrowing to a specific partition/wallet.
- [ ] Up to 100 transactions are displayed in the UI; a note directs users to download for the full history.
- [ ] Total amount of displayed transactions is shown.
- [ ] **Download CSV** exports all transactions as a `.csv` file.
- [ ] **Download PDF** exports all transactions as a formatted `.pdf` file.
- [ ] Exported filenames include a timestamp.

---

### F-07: Borrows Tracker

**Description**: Tracks informal loans recorded against partitions, with a dedicated repayment workflow.

**User Stories**:
- As a user, I can see all outstanding and repaid borrows for a pot.
- As a user, I can filter borrows by partition.
- As a user, I can mark a borrow as paid.
- As a user, I can choose whether to refund the repaid amount back to the source partition.
- As a user, I can export my borrow history.

**Acceptance Criteria**:
- [ ] Borrows are displayed in the "Borrows" tab.
- [ ] Each row shows: date, amount, source partition, description, paid status.
- [ ] A filter/dropdown narrows by partition source.
- [ ] Total borrowed amount is displayed.
- [ ] Each unpaid borrow has a **Pay** button that opens a repayment choice modal:
  - Option A — **Pay Back to Wallet**: Marks as paid and creates a `Deposit` transaction to the source partition.
  - Option B — **Clear Funds**: Marks as paid without creating a transaction (funds treated as spent elsewhere).
- [ ] Paid borrows are visually distinguished from unpaid ones.
- [ ] **Download CSV** and **Download PDF** export the full borrow history.

---

### F-08: Balance Integrity (Checksum)

**Description**: A real-time calculation that validates the user has not over-allocated funds across partitions relative to the pot's declared balance.

**Formula**:
```
Checksum Valid = (Pot Balance − Sum of All Partition Balances) >= 0
Free Money = Pot Balance − Sum of All Partition Balances
```

**Acceptance Criteria**:
- [ ] Checksum status is displayed on the pot detail header.
- [ ] Green indicator = valid (free money ≥ 0).
- [ ] Red indicator = invalid (over-allocated; free money < 0).
- [ ] Clicking the indicator opens a modal explaining the formula and current values.
- [ ] Free money value is displayed separately and updates in real time as partitions change.
- [ ] Free money displayed in red when negative.

---

### F-09: Number Masking (Privacy)

**Description**: All financial figures default to a masked/hidden state and can be toggled visible by the user for privacy.

**Acceptance Criteria**:
- [ ] All balance and amount values render as masked (e.g., `****`) by default.
- [ ] An eye icon adjacent to each figure toggles its visibility.
- [ ] The masking state is per-field (revealing one field does not reveal others).
- [ ] Applies on: pot cards, partition cards, pot header metrics.

---

### F-10: Multi-Currency Support

**Description**: Each pot can be denominated in a different currency. Partitions inherit or display the pot's currency.

**Acceptance Criteria**:
- [ ] Currency field is required when creating a pot (free-text or dropdown; e.g., "GHS", "USD").
- [ ] The currency symbol/code is displayed alongside all balance figures for that pot.
- [ ] Transactions and exports include the currency.
- [ ] No cross-currency conversion is performed.

---

### F-11: Data Export

**Description**: Users can export their financial records as CSV or PDF files for offline use or auditing.

**Acceptance Criteria**:
- [ ] CSV export is available for transactions and for borrows.
- [ ] PDF export is available for transactions and for borrows.
- [ ] Exports include all records, not just the paginated UI view.
- [ ] PDF tables include column headers and formatted values.
- [ ] Filenames include a human-readable timestamp.

---

### F-12: Real-Time Firestore Sync

**Description**: All state changes are automatically persisted to Firestore; the app state reflects the latest Firestore data on load.

**Acceptance Criteria**:
- [ ] Creating, editing, or deleting a pot/partition/transaction persists to Firestore without a manual save step.
- [ ] On page load, the app reads from Firestore to hydrate all context providers.
- [ ] Data is isolated per user via Firebase UID-scoped collections.
- [ ] Deep equality checks prevent unnecessary Firestore writes on re-renders.

---

## 8. Navigation & Routing

| Route | Description | Auth Required |
|---|---|---|
| `/` | Redirect to `/home` | Yes |
| `/auth` | Google OAuth login page | No |
| `/init` | First-time data initialisation | Yes |
| `/home` | Pots dashboard | Yes |
| `/pot/[id]` | Single pot detail (Partitions / Transactions / Borrows) | Yes |

---

## 9. State Architecture

```
AuthProvider
└── PotsProvider
    └── TransactionProvider
        └── BorrowProvider
            └── Application Routes
```

| Provider | Responsibility |
|---|---|
| `AuthProvider` | Firebase user session, sign-in/sign-out |
| `PotsProvider` | Pots and nested partitions; Firestore sync |
| `TransactionProvider` | Transaction records; reducer-based updates; Firestore sync |
| `BorrowProvider` | Borrow records; Firestore sync |

Custom hooks (`useAuth`, `usePots`, `useTransactions`, `useBorrow`, `useModal`) are the public interface for all state access.

---

## 10. UI / UX Principles

- **Privacy-first**: Balances are hidden by default; users actively reveal them.
- **Confirmation gates**: Destructive actions (delete, clear borrow) require modal confirmation.
- **Immediate feedback**: UI updates optimistically; Firestore sync is non-blocking.
- **Animated transitions**: Tab switching and modal entry/exit use spring-based animations.
- **Responsive layout**: Pot grid adapts to screen size via Tailwind responsive utilities.
- **Graceful degradation**: Loading and fallback states are defined for all async operations.

---

## 11. Known Limitations & Future Considerations

| Issue | Notes |
|---|---|
| No server-side validation | Balance integrity is enforced only on the client. A malicious or buggy client could write invalid state to Firestore. |
| No concurrent edit protection | Last-write-wins Firestore updates; simultaneous sessions on different devices could clobber each other. |
| Partition balance is manually maintained | Recalculating partition balance from transaction history is not supported; the stored value is authoritative. |
| Transaction limit in UI | Only 100 transactions are shown; users must export to see older records. |
| No search | There is no way to search transactions or borrows by keyword. |
| No recurring transactions | Scheduled or repeating deposits/withdrawals are not supported. |
| Single auth provider | Only Google OAuth is supported; no email/password option. |
| No offline support | The app has no service worker or offline cache; it requires a live internet connection. |

---

## 12. Glossary

| Term | Definition |
|---|---|
| **Pot** | A user-defined representation of a real bank account or money pool. |
| **Partition** | A virtual envelope within a pot, allocated to a specific purpose. |
| **Transaction** | A recorded deposit or withdrawal against a partition. |
| **Borrow** | An informal loan recorded against a partition, tracked until repaid. |
| **Free Money** | The unallocated balance within a pot (`Pot Balance − Sum of Partitions`). |
| **Checksum** | The validation that a pot's declared balance is not over-allocated. |
| **Masked Number** | A balance value hidden for privacy, shown as `****` until toggled. |
