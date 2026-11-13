// Dev-only fixtures for /preview. Shaped exactly like the Firestore documents.
const now = Date.now();
const ago = (days, h = 10, m = 12) => {
  const d = new Date(now - days * 86400000);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const ts = (days) => ({ seconds: Math.floor((now - days * 86400000) / 1000), nanoseconds: 0 });

const part = (pot, id, name, balance) => ({ id, name, balance, pot_id: pot, abbreviation: name.slice(0, 3).toUpperCase() });
const dep = (pot, part_id, source, amount, description, date, extra = {}) => ({ id: `dep_${Math.random().toString(36).slice(2)}`, type: "Deposit", pot_id: pot, part_id, source, amount, description, date, ...extra });
const wit = (pot, part_id, source, amount, description, date, extra = {}) => ({ id: `wit_${Math.random().toString(36).slice(2)}`, type: "Withdrawal", pot_id: pot, part_id, source, amount, description, date, ...extra });

/* ── Demo: the kind data ─────────────────────────────────────────────── */
const P1 = "pot_demo_gcb";
const P2 = "pot_demo_family";
const demo = {
  POTS: {
    key: "preview",
    pots: [
      {
        id: P1, name: "Personal GCB Chooms", currency: "GHS", balance: 24600, description: "GCB ··16",
        parts: [
          part(P1, "p_rent", "Rent", 7200), part(P1, "p_god", "GOD", 5400), part(P1, "p_food", "Food", 3150),
          part(P1, "p_sam", "Sam's Stash", 2800), part(P1, "p_util", "Utilities", 1850), part(P1, "p_tr", "Transport", 1320),
          part(P1, "p_zo", "Zo's Care", 1180), part(P1, "p_pro", "Protein Funds", 1000), part(P1, "p_chk", "Checking", 700),
        ],
      },
      {
        id: P2, name: "Pokah Family", currency: "GHS", balance: 18400, description: "Emergency funds",
        parts: [part(P2, "p_em", "Emergency", 15000), part(P2, "p_med", "Medical", 2600)],
      },
    ],
  },
  TRANSACTIONS: {
    key: "preview",
    transactions: [
      wit(P1, "p_pro", "Protein Funds", 400, "Protein top-up", ago(0, 10, 52)),
      dep(P1, "p_rent", "Rent", 3200, "Monthly salary split", ago(0, 8, 10)),
      wit(P1, "p_god", "GOD", 252, "Alex and fairlady NGC", ago(1, 10, 48)),
      wit(P1, "p_god", "GOD", 508, "Baby uniforms", ago(1, 10, 47)),
      wit(P1, "p_food", "Food", 606, "Groceries — Shoprite", ago(3, 18, 22)),
      wit(P1, "p_food", "Food", 200, "Transfer → Transport: trip", ago(3, 9, 5), { kind: "move" }),
      dep(P1, "p_tr", "Transport", 200, "Transfer ← Food: trip", ago(3, 9, 5), { kind: "move" }),
      wit(P1, "p_tr", "Transport", 250, "Fuel — Kasoa trip", ago(5, 7, 40)),
      wit(P1, "p_food", "Food", 600, "RND into the ··915 Visa", ago(71, 7, 12), { kind: "loan" }),
      dep(P2, "p_em", "Emergency", 1500, "Family contribution", ago(4, 12, 0)),
    ],
  },
  BORROWED: {
    key: "preview",
    borrows: [
      { id: "b1", pot_id: P1, part_id: "p_food", source_id: "p_food", source: "Food", amount: 800, paid_amount: 200, paid: false, description: "RND into the ··915 Visa", date: ago(71) },
      { id: "b2", pot_id: P1, part_id: "p_sam", source_id: "p_sam", source: "Sam's Stash", amount: 400, paid: false, description: "Borrow and chop", date: ago(24) },
      { id: "b3", pot_id: P1, part_id: "p_chk", source_id: "p_chk", source: "Checking", amount: 626.2, paid: false, description: "Sent and not reimbursed", date: ago(40) },
      { id: "b4", pot_id: P1, part_id: "p_util", source_id: "p_util", source: "Utilities", amount: 300, paid: true, paid_amount: 300, description: "Akwesi GPT loan", date: ago(60) },
    ],
  },
};

/* ── Worst case: plausible but unkind ────────────────────────────────── */
const W1 = "pot_worst_1";
const W2 = "pot_worst_2";
const W3 = "pot_worst_3";
const longNote =
  "Paid Bartholomew for the generator repairs plus fuel, transport to Kasoa and back, and the extra cable he bought at Kantamanto";
const manyParts = [
  part(W1, "w_school", "Children's School Fees 2026", 1284567.5),
  part(W1, "w_jo", "Jo", 0),
  part(W1, "w_osun", "Ọ̀ṣun Festival 🎉", 12.05),
  part(W1, "w_neg", "Overdraft cover", -320.5),
  part(W1, "w_jp", "家族の旅行", 98000),
  ...Array.from({ length: 13 }, (_, i) => part(W1, `w_${i}`, `Envelope ${i + 6}`, (i + 1) * 1111.11)),
];
const worst = {
  POTS: {
    key: "preview",
    pots: [
      {
        id: W1, name: "Ecobank Ghana Joint Savings — Ama & Kofi", currency: "GHS", balance: 1284567890.55,
        description: "Joint account for the house build, school fees and everything else we share between us",
        parts: manyParts,
      },
      { id: W2, name: "Cash", currency: "", balance: 0, description: "", parts: [] },
      {
        id: W3, name: "Chase Sapphire USD", currency: "USD", balance: 1000,
        parts: [part(W3, "u_a", "Travel", 900), part(W3, "u_b", "Subscriptions", 400.75)],
      },
    ],
  },
  TRANSACTIONS: {
    key: "preview",
    transactions: [
      wit(W1, "w_school", "Children's School Fees 2026", 1284567.5, longNote, ago(0, 9, 1)),
      dep(W1, "w_jo", "Jo", 0.01, "", ago(0, 0, 0)),
      wit(W1, "w_osun", "Ọ̀ṣun Festival 🎉", 12.05, "🎉🎉 drinks", ts(1)),
      wit(W1, "w_deleted", "Old envelope that was deleted", 50, "Before cleanup", ago(2)),
      dep(W1, null, "Adjustment", 999999.99, "Manual balance adjustment", ago(2), { kind: "adjust" }),
      wit(W1, "w_school", "Children's School Fees 2026", 400, "Transfer → 家族の旅行: rebalancing for the holiday deposit that is due", ago(3), { kind: "move" }),
      dep(W1, "w_jp", "家族の旅行", 400, "Transfer ← Children's School Fees 2026: rebalancing for the holiday deposit that is due", ago(3), { kind: "move" }),
      wit(W1, "w_neg", "Overdraft cover", 320.5, "Borrowed: emergency for bartholomew.fitzgerald@northwind-industries-holdings.example.com", ago(400)),
      { id: "legacy_1", type: "Deposit", pot_id: W1, part_id: "w_jp", source: "家族の旅行", amount: 5, description: "Old seed format date", date: "02/01/2025" },
      { id: "legacy_2", type: "Withdrawal", pot_id: W1, part_id: "w_jp", source: "家族の旅行", amount: 7, description: "No date at all", date: null },
      ...Array.from({ length: 140 }, (_, i) => wit(W1, `w_${i % 13}`, `Envelope ${(i % 13) + 6}`, 10 + i, `Routine entry ${i + 1}`, ago(6 + i))),
      dep(W3, "u_a", "Travel", 900, "Flights", ago(1)),
    ],
  },
  BORROWED: {
    key: "preview",
    borrows: [
      { id: "wb1", pot_id: W1, part_id: "w_school", source_id: "w_school", source: "Children's School Fees 2026", amount: 1284567.5, paid_amount: 0.5, paid: false, description: longNote, date: ago(730) },
      { id: "wb2", pot_id: W1, part_id: "w_gone", source_id: "w_gone", source: "Deleted envelope", amount: 50, paid: false, description: "", date: ts(3) },
      { id: "wb3", pot_id: W1, part_id: "w_jo", source_id: "w_jo", source: "Jo", amount: 1, paid: false, description: "Jo", date: ago(0) },
      { id: "wb4", pot_id: W3, part_id: "u_a", source_id: "u_a", source: "Travel", amount: 120, paid: false, description: "Uber split", date: ago(2) },
    ],
  },
};

/* ── Empty and One ───────────────────────────────────────────────────── */
const empty = { POTS: { key: "preview", pots: [] }, TRANSACTIONS: { key: "preview", transactions: [] }, BORROWED: { key: "preview", borrowed: [] } };

const O1 = "pot_one";
const one = {
  POTS: { key: "preview", pots: [{ id: O1, name: "Wallet", currency: "GHS", balance: 100, parts: [part(O1, "o1", "Food", 100)] }] },
  TRANSACTIONS: { key: "preview", transactions: [wit(O1, "o1", "Food", 1, "Gum", ago(0))] },
  BORROWED: { key: "preview", borrows: [{ id: "ob1", pot_id: O1, part_id: "o1", source_id: "o1", source: "Food", amount: 1, paid: false, description: "Lent to Jo", date: ago(1) }] },
};

export const FIXTURES = { demo, worst, empty, one };
export const FIRST_POT = { demo: P1, worst: W1, empty: null, one: O1 };

export const USERS = {
  demo: { uid: "preview", displayName: "Frimpong Opoku Agyemang", email: "frimpong@example.com", photoURL: null },
  worst: { uid: "preview", displayName: "Aleksandra Wiśniewska-Kowalczyk", email: "bartholomew.fitzgerald@northwind-industries-holdings.example.com", photoURL: "https://example.invalid/broken.png" },
  empty: { uid: "preview", displayName: null, email: "jo@ex.co", photoURL: null },
  one: { uid: "preview", displayName: "Jo", email: "jo@ex.co", photoURL: null },
};
