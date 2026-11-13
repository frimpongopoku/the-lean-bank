"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useModal } from "../pot/[id]/components/EBModal";
import CreateOrEditPotForm from "./CreateOrEditPotForm";
import { usePots } from "../hooks/contexts/usePots";
import { useTransactions, generateUniqueId } from "../hooks/contexts/useTransactions";
import { useBorrow } from "../hooks/contexts/useBorrow";
import { useAuth } from "../auth/context/AuthContext";
import { useToast } from "../components/ToastProvider";
import useUserData from "../hooks/useUserData";
import useMoneyActions from "../hooks/useMoneyActions";
import AppHeader from "../components/ui/AppHeader";
import AllocationBar from "../components/ui/AllocationBar";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Icon from "../components/ui/Icon";
import TxnIcon from "../components/ui/TxnIcon";
import Menu from "../components/ui/Menu";
import useShortcut from "../components/ui/useShortcut";
import RecordForm from "../pot/forms/RecordForm";
import { Money, partColor, sumParts, toDate, shortDate, timeLabel, daysAgo, isIn, isMove, describeTxn } from "../components/ui/money";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function PotHome() {
  const { Modal, openModal, closeModal } = useModal();
  const toast = useToast();
  const { user } = useAuth();
  const { potData, addPot, editPot, removePot } = usePots();
  const { transactions } = useTransactions() || {};
  const { borrows } = useBorrow() || {};
  const { record } = useMoneyActions();
  const status = useUserData(user?.uid);

  const pots = potData?.pots || [];
  const ready = status === "ready" && Array.isArray(potData?.pots);
  const potById = useMemo(() => Object.fromEntries(pots.map((p) => [p.id, p])), [pots]);

  // Totals per currency (no conversion between currencies)
  const totals = useMemo(() => {
    const map = new Map();
    pots.forEach((p) => {
      const c = p.currency || "";
      const t = map.get(c) || { balance: 0, free: 0, loans: 0 };
      t.balance += Number(p.balance) || 0;
      t.free += (Number(p.balance) || 0) - sumParts(p.parts);
      map.set(c, t);
    });
    (borrows || []).forEach((b) => {
      if (b.paid) return;
      const pot = potById[b.pot_id];
      if (!pot) return;
      const t = map.get(pot.currency || "");
      if (t) t.loans += (Number(b.amount) || 0) - (Number(b.paid_amount) || 0);
    });
    return [...map.entries()];
  }, [pots, borrows, potById]);

  const recent = useMemo(
    () =>
      (transactions || [])
        .filter((t) => potById[t.pot_id])
        .map((t) => ({ ...t, _d: toDate(t.date) }))
        .sort((a, b) => (b._d?.getTime() || 0) - (a._d?.getTime() || 0))
        .slice(0, 7),
    [transactions, potById]
  );

  const openLoans = useMemo(
    () =>
      (borrows || [])
        .filter((b) => !b.paid && potById[b.pot_id])
        .map((b) => ({ ...b, _d: toDate(b.date) }))
        .sort((a, b) => (a._d?.getTime() || 0) - (b._d?.getTime() || 0)),
    [borrows, potById]
  );

  const openRecord = (opts = {}) =>
    openModal(
      <RecordForm
        pots={pots}
        initialPotId={opts.potId}
        onClose={closeModal}
        onSubmit={({ potId, ...rest }) => {
          closeModal();
          record(potId, rest);
        }}
      />,
      { instant: opts.instant }
    );

  useShortcut("r", () => ready && pots.length && openRecord({ instant: true }));
  useShortcut("n", () => ready && createOrEditPot(null, true));

  function createOrEditPot(pot, instant) {
    openModal(
      <CreateOrEditPotForm
        isEdit={!!pot}
        data={pot}
        onClose={closeModal}
        onSubmit={(content) => {
          closeModal();
          if (pot) {
            editPot(content);
            toast.success(`${content.name} updated`);
          } else {
            addPot({ ...content, parts: [], id: generateUniqueId("pot_"), createdAt: new Date(), user_id: user?.uid });
            toast.success(`${content.name} created`);
          }
        }}
      />,
      { instant }
    );
  }

  const deletePot = (pot) =>
    openModal(
      <ConfirmDialog
        title={`Delete ${pot.name}?`}
        confirmLabel="Delete pot"
        onCancel={closeModal}
        onConfirm={() => {
          closeModal();
          removePot(pot.id);
          toast.success(`${pot.name} deleted`, { undo: () => addPot(pot) });
        }}
      >
        Its {pot.parts?.length || 0} envelope{pot.parts?.length === 1 ? "" : "s"} go with it. Activity and loans already
        recorded stay in your exports.
      </ConfirmDialog>
    );

  const firstName = user?.displayName?.split(" ")[0];
  const single = totals.length === 1 ? totals[0] : null;

  return (
    <div className="min-h-[100dvh]">
      <Modal />
      <AppHeader />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 sm:pt-10 pb-16 flex flex-col gap-10">
        {/* Hero */}
        <section className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2 min-w-0">
            <p className="m-0 text-muted">
              {greeting()}
              {firstName ? `, ${firstName}` : ""}
            </p>
            {!ready ? (
              <div className="skeleton h-12 w-72 max-w-full" />
            ) : single ? (
              <>
                <h1 className="m-0 text-[36px] sm:text-[48px] font-medium leading-[1.05] tracking-[-0.03em]">
                  <Money value={single[1].balance} currency={single[0]} currencyClassName="text-[0.5em] align-[0.6em]" />
                </h1>
                <p className="m-0 text-muted">
                  Across {pots.length} pot{pots.length === 1 ? "" : "s"}
                  {single[1].free > 0.004 && (
                    <>
                      {" · "}
                      <Money value={single[1].free} className="text-ink" /> waiting to be assigned
                    </>
                  )}
                  {single[1].free < -0.004 && (
                    <>
                      {" · "}
                      <span className="text-danger">over-assigned by <Money value={Math.abs(single[1].free)} /></span>
                    </>
                  )}
                  {single[1].loans > 0 && (
                    <>
                      {" · "}
                      <Money value={single[1].loans} className="text-ink" /> out on loan
                    </>
                  )}
                </p>
              </>
            ) : totals.length > 1 ? (
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {totals.map(([cur, t]) => (
                  <h1 key={cur || "none"} className="m-0 text-[30px] sm:text-[40px] font-medium leading-tight tracking-[-0.03em]">
                    <Money value={t.balance} currency={cur || "No currency"} currencyClassName="text-[0.5em] align-[0.5em]" />
                  </h1>
                ))}
              </div>
            ) : (
              <h1 className="m-0 text-[32px] sm:text-[40px] font-semibold tracking-[-0.03em]">Welcome to Lean Bank</h1>
            )}
          </div>
          {ready && pots.length > 0 && (
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={() => createOrEditPot(null)}>
                <Icon name="plus" />
                New pot
              </button>
              <button type="button" className="btn-primary" onClick={() => openRecord()}>
                Record money
                <kbd className="hidden md:inline num text-[11px] border border-black/25 rounded px-1.5 leading-4">R</kbd>
              </button>
            </div>
          )}
        </section>

        {/* Pots */}
        <section aria-labelledby="pots-h" className="flex flex-col gap-4">
          <h2 id="pots-h" className="m-0 text-[13px] font-medium text-muted">Pots</h2>

          {!ready ? (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))]">
              {[0, 1].map((i) => (
                <div key={i} className="card p-5 flex flex-col gap-4">
                  <div className="skeleton h-5 w-40" />
                  <div className="skeleton h-8 w-52" />
                  <div className="skeleton h-2 w-full" />
                </div>
              ))}
            </div>
          ) : pots.length === 0 ? (
            <EmptyPots onCreate={() => createOrEditPot(null)} />
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))]">
              {pots.map((pot) => (
                <PotCard
                  key={pot.id}
                  pot={pot}
                  href={`/pot/${pot.id}?c=${user?.uid}`}
                  onEdit={() => createOrEditPot(pot)}
                  onDelete={() => deletePot(pot)}
                />
              ))}
              <button
                type="button"
                onClick={() => createOrEditPot(null)}
                className="btn min-h-[180px] h-auto flex-col gap-1.5 rounded-2xl border border-dashed border-line-strong text-muted hover:text-ink hover:border-[#3a3f47]"
              >
                <Icon name="plus" size={20} />
                <span className="text-ink">New pot</span>
                <span className="text-xs font-normal whitespace-normal">A bank account, wallet or cash stash</span>
              </button>
            </div>
          )}
        </section>

        {/* Activity + loans */}
        {ready && pots.length > 0 && (
          <div className="flex flex-wrap gap-4 items-start">
            <section aria-labelledby="act-h" className="card flex-[999_1_520px] min-w-0 py-2">
              <div className="flex items-center justify-between px-5 py-3">
                <h2 id="act-h" className="m-0 text-[15px] font-semibold">Recent activity</h2>
              </div>
              {recent.length === 0 ? (
                <p className="m-0 px-5 pb-5 pt-1 text-muted text-sm">
                  Nothing recorded yet. Use <span className="text-ink">Record money</span> when money comes in or goes out.
                </p>
              ) : (
                <ul className="list-none m-0 p-0">
                  {recent.map((t) => (
                    <ActivityRow key={t.id} t={t} pot={potById[t.pot_id]} href={`/pot/${t.pot_id}?c=${user?.uid}&tab=activity`} />
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="loan-h" className="card flex-[1_1_320px] min-w-0 p-5 flex flex-col gap-4">
              <h2 id="loan-h" className="m-0 text-[15px] font-semibold">Open loans</h2>
              {openLoans.length === 0 ? (
                <p className="m-0 text-muted text-sm">
                  None. When you borrow from an envelope, choose <span className="text-ink">Lend out</span> and it&apos;s tracked here until repaid.
                </p>
              ) : (
                <>
                  <div>
                    {totals
                      .filter(([, t]) => t.loans > 0)
                      .map(([cur, t]) => (
                        <div key={cur} className="text-[26px] font-medium text-amber leading-tight">
                          <Money value={t.loans} currency={cur} currencyClassName="text-[0.55em]" />
                        </div>
                      ))}
                    <p className="m-0 mt-1 text-muted text-[13px]">
                      Borrowed from your envelopes · {openLoans.length} open · oldest {daysAgo(openLoans[0]._d)}
                    </p>
                  </div>
                  <ul className="list-none m-0 p-0 border-t border-line">
                    {openLoans.slice(0, 4).map((l) => (
                      <li key={l.id} className="border-b border-line">
                        <Link
                          href={`/pot/${l.pot_id}?c=${user?.uid}&tab=loans&loan=${l.id}`}
                          className="flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg text-ink hover:bg-surface-2"
                          aria-label={`Repay ${l.description || "loan"} from ${l.source || "an envelope"}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate" title={l.description || undefined}>{l.description || "Loan"}</div>
                            <div className="text-muted text-xs truncate">
                              {l.source || "Envelope"} · {daysAgo(l._d)}
                            </div>
                          </div>
                          <Money value={(Number(l.amount) || 0) - (Number(l.paid_amount) || 0)} className="flex-none" />
                          <Icon name="chevronRight" size={14} className="flex-none text-faint" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function PotCard({ pot, href, onEdit, onDelete }) {
  const parts = pot.parts || [];
  const free = (Number(pot.balance) || 0) - sumParts(parts);
  const legend = parts.slice(0, 3);

  return (
    <article className="card p-5 flex flex-col gap-[18px] relative transition-colors duration-150 hover:border-line-strong">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <Link
            href={href}
            className="text-base font-semibold text-ink truncate hover:underline underline-offset-[3px] after:absolute after:inset-0 after:rounded-2xl after:content-['']"
          >
            {pot.name}
          </Link>
          <span className="text-muted text-[13px] truncate">
            {[pot.description, pot.currency].filter(Boolean).join(" · ") || "—"}
          </span>
        </div>
        <Menu
          className="relative z-10"
          items={[
            { label: "Edit pot", icon: "edit", onSelect: onEdit },
            { label: "Delete pot", icon: "trash", tone: "danger", onSelect: onDelete },
          ]}
        >
          {(p) => (
            <button {...p} type="button" className="icon-btn -mr-1.5 -mt-1" aria-label={`Options for ${pot.name}`}>
              <Icon name="more" />
            </button>
          )}
        </Menu>
      </div>

      <div className="text-[28px] font-medium tracking-[-0.03em] leading-none">
        <Money value={pot.balance} currency={pot.currency} currencyClassName="text-[0.55em]" />
      </div>

      <div className="flex flex-col gap-2.5">
        <AllocationBar parts={parts} balance={pot.balance} />
        <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-muted text-xs">
          {legend.map((p, i) => (
            <span key={p.id} className="inline-flex items-center gap-1.5 min-w-0 max-w-[45%]">
              <span className="w-2 h-2 rounded-[2px] flex-none" style={{ background: partColor(i) }} />
              <span className="truncate">{p.name}</span>
            </span>
          ))}
          {parts.length > 3 && <span>+{parts.length - 3} more</span>}
          {parts.length === 0 && <span>No envelopes yet</span>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5 text-[13px]">
        <PotStatus free={free} hasParts={parts.length > 0} />
        <span className="text-mint font-medium flex-none" aria-hidden="true">Open →</span>
      </div>
    </article>
  );
}

export function PotStatus({ free, hasParts }) {
  if (!hasParts)
    return <span className="text-muted">Add envelopes to split this pot</span>;
  if (free > 0.004)
    return (
      <span className="inline-flex items-center gap-2 text-ink min-w-0">
        <span className="status-dot border-[1.5px] border-mint" />
        <span className="truncate">
          <Money value={free} /> to assign
        </span>
      </span>
    );
  if (free < -0.004)
    return (
      <span className="inline-flex items-center gap-2 text-danger min-w-0">
        <span className="status-dot bg-danger" />
        <span className="truncate">
          Over by <Money value={Math.abs(free)} />
        </span>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-2 text-muted">
      <span className="status-dot bg-mint" />
      Balanced
    </span>
  );
}

function ActivityRow({ t, pot, href }) {
  const incoming = isIn(t);
  const move = isMove(t);
  return (
    <li>
      <Link href={href} className="flex items-center gap-3.5 px-5 py-3 text-ink hover:bg-surface-2">
        <TxnIcon incoming={incoming} move={move} loan={t.kind === "loan" || /^Borrowed:/.test(t.description || "")} />
        <div className="flex-1 min-w-0">
          <div className="truncate">{describeTxn(t, incoming ? "Money in" : "Money out")}</div>
          <div className="text-muted text-xs truncate">
            {t.source || "—"} · {pot?.name} · {shortDate(t._d)} {timeLabel(t._d)}
          </div>
        </div>
        <Money
          value={t.amount}
          sign={move ? "none" : incoming ? "in" : "out"}
          className={incoming && !move ? "text-mint" : "text-ink"}
        />
      </Link>
    </li>
  );
}

function EmptyPots({ onCreate }) {
  return (
    <div className="card px-6 py-12 flex flex-col items-center text-center gap-3">
      <div className="w-full max-w-[280px] flex flex-col gap-2 mb-2" aria-hidden="true">
        <div className="flex gap-[2px] h-2.5 rounded-full overflow-hidden">
          <span style={{ flex: 5, background: partColor(0) }} />
          <span style={{ flex: 3, background: partColor(2) }} />
          <span style={{ flex: 2, background: partColor(3) }} />
          <span className="hatch" style={{ flex: 2 }} />
        </div>
      </div>
      <h2 className="m-0 text-lg font-semibold">Start with your first pot</h2>
      <p className="m-0 text-muted max-w-[42ch]">
        A pot is a real account: a bank account, mobile money wallet or cash. Then split it into envelopes like Rent,
        Food and Savings.
      </p>
      <button type="button" className="btn-primary mt-2" onClick={onCreate}>
        <Icon name="plus" />
        Create a pot
      </button>
    </div>
  );
}
