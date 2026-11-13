"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { startOfMonth, format } from "date-fns";
import Envelopes from "./Partitions";
import Activity from "./Transactions";
import Loans from "./Borrowed";
import { useModal } from "./components/EBModal";
import Loading from "@/app/components/Loading";
import Fallback from "@/app/components/Fallback";
import CreateOrEditPartition from "../forms/CreateOrEditPartition";
import CreateOrEditPotForm from "@/app/home/CreateOrEditPotForm";
import RecordForm from "../forms/RecordForm";
import AssignForm from "../forms/AssignForm";
import { usePots } from "@/app/hooks/contexts/usePots";
import { generateUniqueId, useTransactions } from "@/app/hooks/contexts/useTransactions";
import { useBorrow } from "@/app/hooks/contexts/useBorrow";
import { useAuth } from "@/app/auth/context/AuthContext";
import { useToast } from "@/app/components/ToastProvider";
import useUserData from "@/app/hooks/useUserData";
import useMoneyActions from "@/app/hooks/useMoneyActions";
import AppHeader from "@/app/components/ui/AppHeader";
import AllocationBar from "@/app/components/ui/AllocationBar";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import Tabs from "@/app/components/ui/Tabs";
import Icon from "@/app/components/ui/Icon";
import useShortcut from "@/app/components/ui/useShortcut";
import { Money, sumParts, toDate, isIn, isMove, formatAmount, shortDate } from "@/app/components/ui/money";

const TAB_IDS = ["envelopes", "activity", "loans"];

function OnePotView({ potId, userId, initialTab, focusLoanId }) {
  const { Modal, openModal, closeModal } = useModal();
  const toast = useToast();
  const { user } = useAuth();
  const uid = user?.uid || userId;
  const status = useUserData(uid);
  const { record, assign } = useMoneyActions();

  const { potData, editPot, addPartToPot, updatePartInPot, removePartFromPot } = usePots();
  const { transactions, addDeposit, addWithdrawal } = useTransactions() || {};
  const { borrows } = useBorrow() || {};

  const [tab, setTab] = useState(TAB_IDS.includes(initialTab) ? initialTab : "envelopes");
  const changeTab = (id) => {
    setTab(id);
    const url = new URL(window.location.href);
    if (id === "envelopes") url.searchParams.delete("tab");
    else url.searchParams.set("tab", id);
    url.searchParams.delete("loan");
    window.history.replaceState(null, "", url);
  };

  const pot = useMemo(() => (potData?.pots || []).find((p) => String(p.id) === String(potId)), [potData, potId]);
  const parts = pot?.parts || [];
  const balance = Number(pot?.balance) || 0;
  const assigned = sumParts(parts);
  const free = Math.round((balance - assigned) * 100) / 100;
  const cur = pot?.currency || "";

  const potTxns = useMemo(
    () =>
      (transactions || [])
        .filter((t) => t?.pot_id === pot?.id)
        .map((t) => ({ ...t, _d: toDate(t.date) }))
        .sort((a, b) => (b._d?.getTime() || 0) - (a._d?.getTime() || 0)),
    [transactions, pot?.id]
  );
  const potLoans = useMemo(
    () => (borrows || []).filter((b) => b?.pot_id === pot?.id).map((b) => ({ ...b, _d: toDate(b.date) })),
    [borrows, pot?.id]
  );
  const openLoans = potLoans.filter((l) => !l.paid);

  useEffect(() => {
    if (pot?.name) document.title = `${pot.name} · Lean Bank`;
  }, [pot?.name]);

  /* ── Actions ─────────────────────────────────────────────────────────── */
  const openRecord = (opts = {}) =>
    openModal(
      <RecordForm
        pots={[pot]}
        initialMode={opts.mode}
        initialPartId={opts.partId}
        onClose={closeModal}
        onSubmit={({ potId: id, ...rest }) => {
          closeModal();
          record(id, rest);
        }}
      />,
      { instant: opts.instant }
    );

  useShortcut("r", () => pot && openRecord({ instant: true }));

  const editPotDetails = (focus) =>
    openModal(
      <CreateOrEditPotForm
        isEdit
        data={pot}
        focus={focus}
        onClose={closeModal}
        onSubmit={(content) => {
          closeModal();
          const diff = Math.round((Number(content.balance) - balance) * 100) / 100;
          editPot(content);
          if (diff !== 0) {
            const fn = diff > 0 ? addDeposit : addWithdrawal;
            fn({
              kind: "adjust",
              description: "Balance updated",
              amount: Math.abs(diff),
              source: "Adjustment",
              pot_id: pot.id,
              part_id: null,
              date: new Date(),
            });
            toast.success(`Balance updated to ${cur} ${formatAmount(content.balance)}`);
          } else {
            toast.success("Pot updated");
          }
        }}
      />
    );

  const createOrEditEnvelope = (part) =>
    openModal(
      <CreateOrEditPartition
        mode={part ? "edit" : "create"}
        data={part}
        currency={cur}
        unassigned={free}
        onClose={closeModal}
        onSubmit={(form) => {
          closeModal();
          if (part) {
            updatePartInPot(pot.id, { ...part, ...form });
            toast.success(`${form.name} updated`);
          } else {
            addPartToPot(pot.id, { ...form, id: generateUniqueId("prt_"), date: new Date(), pot_id: pot.id, currency: cur });
            toast.success(`${form.name} created`);
          }
        }}
      />
    );

  const deleteEnvelope = (part) =>
    openModal(
      <ConfirmDialog
        title={`Delete ${part.name}?`}
        confirmLabel="Delete envelope"
        onCancel={closeModal}
        onConfirm={() => {
          closeModal();
          removePartFromPot(pot.id, part.id);
          toast.success(`${part.name} deleted`, { undo: () => addPartToPot(pot.id, part) });
        }}
      >
        {Number(part.balance) > 0 ? (
          <>
            The <span className="num text-ink">{cur} {formatAmount(part.balance)}</span> it holds goes back to Unassigned.
            Its activity history is kept.
          </>
        ) : (
          "Its activity history is kept."
        )}
      </ConfirmDialog>
    );

  const openAssign = () =>
    openModal(
      <AssignForm
        parts={parts}
        unassigned={free}
        currency={cur}
        onClose={closeModal}
        onSubmit={(v) => {
          closeModal();
          assign(pot.id, v);
        }}
      />
    );

  /* ── States ──────────────────────────────────────────────────────────── */
  if (status === "error") return <Fallback title="Couldn't load" message="We couldn't reach your data. Check your connection and try again." backUrl="/home" />;
  if (status !== "ready") return <Loading full message="Loading pot…" />;
  if (!pot) return <Fallback message="This pot doesn't exist or was deleted." backUrl="/home" />;

  /* ── Month summary (moves and adjustments excluded) ──────────────────── */
  const monthStart = startOfMonth(new Date());
  const monthTx = potTxns.filter((t) => t._d && t._d >= monthStart && !isMove(t) && t.kind !== "adjust" && t.source !== "Adjustment");
  const monthIn = monthTx.filter(isIn).reduce((a, t) => a + (Number(t.amount) || 0), 0);
  const monthOut = monthTx.filter((t) => !isIn(t)).reduce((a, t) => a + (Number(t.amount) || 0), 0);
  const outBy = {};
  monthTx.filter((t) => !isIn(t)).forEach((t) => {
    outBy[t.source] = outBy[t.source] || { amount: 0, n: 0 };
    outBy[t.source].amount += Number(t.amount) || 0;
    outBy[t.source].n += 1;
  });
  const topOut = Object.entries(outBy).sort((a, b) => b[1].amount - a[1].amount)[0];
  const owed = openLoans.reduce((a, l) => a + (Number(l.amount) || 0) - (Number(l.paid_amount) || 0), 0);
  const oldestLoan = [...openLoans].sort((a, b) => (a._d?.getTime() || 0) - (b._d?.getTime() || 0))[0];
  const lastAdjust = potTxns.find((t) => t.kind === "adjust" || t.source === "Adjustment");

  const health =
    !parts.length
      ? null
      : free > 0.004
      ? { tone: "free", title: <><Money value={free} currency={cur} currencyClassName="!text-mint" /> to assign</>, text: "This money is in the account but no envelope holds it yet.", action: "Assign to envelopes", onAction: openAssign }
      : free < -0.004
      ? { tone: "over", title: <>Over-assigned by <Money value={Math.abs(free)} currency={cur} currencyClassName="!text-danger" /></>, text: "Envelopes hold more than the account. Update the balance, or take money out of an envelope.", action: "Update balance", onAction: () => editPotDetails("balance") }
      : { tone: "ok", title: "Balanced", text: "Every bit of this account sits in an envelope." };

  const tabs = [
    { id: "envelopes", label: "Envelopes", badge: <span className="num text-xs text-muted">{parts.length}</span> },
    { id: "activity", label: "Activity" },
    {
      id: "loans",
      label: "Loans",
      badge: openLoans.length ? (
        <span className="num text-[11px] leading-[18px] min-w-[18px] text-center px-1.5 rounded-full bg-amber text-[#0b0c0e]">{openLoans.length}</span>
      ) : null,
    },
  ];

  return (
    <div className="min-h-[100dvh]">
      <Modal />
      <AppHeader />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6 sm:pt-7 pb-28 sm:pb-16 flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-2.5">
          <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
            <Link href="/home" className="text-muted hover:text-ink">Pots</Link>
            <span aria-hidden="true" className="mx-1.5">/</span>
            <span className="text-ink" aria-current="page">{pot.name}</span>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              <h1 className="m-0 text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] break-words min-w-0">{pot.name}</h1>
              {cur && <span className="text-xs text-muted border border-line-strong rounded-md px-2 py-0.5">{cur}</span>}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={() => editPotDetails()}>
                <Icon name="edit" />
                <span className="hidden sm:inline">Edit pot</span>
                <span className="sr-only sm:hidden">Edit pot</span>
              </button>
              <button type="button" className="btn-primary hidden sm:inline-flex" onClick={() => openRecord()}>
                Record money
                <kbd className="hidden md:inline num text-[11px] border border-black/25 rounded px-1.5 leading-4">R</kbd>
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <section aria-label="Pot summary" className="card p-5 sm:p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
            <Figure label="In the account" first>
              <Money value={balance} className="text-[26px] sm:text-[30px] font-medium" />
              <span className="text-xs text-muted">
                {lastAdjust ? `Updated ${shortDate(lastAdjust._d)} · ` : ""}
                <button type="button" className="text-mint hover:underline underline-offset-2" onClick={() => editPotDetails("balance")}>
                  Update balance
                </button>
              </span>
            </Figure>
            <Figure label="In envelopes">
              <Money value={assigned} className="text-[26px] sm:text-[30px] font-medium" />
              <span className="text-xs text-muted">
                {parts.length} envelope{parts.length === 1 ? "" : "s"}
              </span>
            </Figure>
            <Figure label="Unassigned">
              <Money value={free} className={`text-[26px] sm:text-[30px] font-medium ${free < -0.004 ? "text-danger" : ""}`} />
              <span className="text-xs text-muted">Account minus envelopes</span>
            </Figure>
          </div>

          <AllocationBar parts={parts} balance={balance} height={10} />

          {health && (
            <div
              className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3.5 py-3 ${
                health.tone === "over" ? "bg-[rgba(255,122,107,0.09)]" : "bg-[rgba(94,230,176,0.07)]"
              }`}
              role={health.tone === "over" ? "alert" : "status"}
            >
              <span className={`flex items-baseline gap-2 min-w-0 max-w-full font-semibold ${health.tone === "over" ? "text-danger" : "text-mint"}`}>
                <span className={`status-dot flex-none self-center ${health.tone === "free" ? "border-[1.5px] border-mint" : health.tone === "over" ? "bg-danger" : "bg-mint"}`} />
                <span className="min-w-0 [overflow-wrap:anywhere]">{health.title}</span>
              </span>
              <span className="text-ink-2 flex-[1_1_260px] min-w-0">{health.text}</span>
              {health.action && (
                <button type="button" className="btn-ghost btn-sm" onClick={health.onAction}>
                  {health.action}
                </button>
              )}
            </div>
          )}
        </section>

        <Tabs tabs={tabs} value={tab} onChange={changeTab} label="Pot views" idPrefix="pot" />

        <div role="tabpanel" id={`pot-panel-${tab}`} aria-labelledby={`pot-${tab}`}>
          {tab === "envelopes" && (
            <div className="flex flex-wrap gap-6 items-start">
              <div className="flex-[999_1_600px] min-w-0">
                <Envelopes
                  parts={parts}
                  txns={potTxns}
                  currency={cur}
                  assigned={assigned}
                  onCreate={() => createOrEditEnvelope()}
                  onEdit={createOrEditEnvelope}
                  onDelete={deleteEnvelope}
                  onRecord={(mode, part) => openRecord({ mode, partId: part.id })}
                />
              </div>
              <aside className="flex-[1_1_300px] min-w-0 flex flex-col gap-4">
                <section aria-labelledby="month-h" className="card p-5 flex flex-col gap-3.5">
                  <h2 id="month-h" className="m-0 text-sm font-semibold">{format(new Date(), "MMMM")} so far</h2>
                  <MonthBar label="Money in" value={monthIn} max={Math.max(monthIn, monthOut)} tone="in" />
                  <MonthBar label="Money out" value={monthOut} max={Math.max(monthIn, monthOut)} tone="out" />
                  <p className="m-0 text-muted text-[13px]">
                    {topOut ? (
                      <>
                        Most spent from <span className="text-ink">{topOut[0]}</span>: <Money value={topOut[1].amount} /> across{" "}
                        {topOut[1].n} entr{topOut[1].n === 1 ? "y" : "ies"}
                      </>
                    ) : (
                      "Nothing has gone out this month."
                    )}
                  </p>
                </section>
                <button
                  type="button"
                  onClick={() => changeTab("loans")}
                  className="card p-5 flex flex-col gap-1.5 text-left transition-colors hover:border-line-strong"
                >
                  <span className="text-sm font-semibold">Loans from this pot</span>
                  {openLoans.length ? (
                    <>
                      <Money value={owed} className="text-[22px] text-amber" />
                      <span className="text-muted text-[13px]">
                        {openLoans.length} open · oldest {shortDate(oldestLoan?._d)} · View loans →
                      </span>
                    </>
                  ) : (
                    <span className="text-muted text-[13px]">Nothing owed. View history →</span>
                  )}
                </button>
              </aside>
            </div>
          )}
          {tab === "activity" && <Activity txns={potTxns} parts={parts} pot={pot} />}
          {tab === "loans" && <Loans loans={potLoans} pot={pot} focusLoanId={focusLoanId} />}
        </div>
      </main>

      {/* Phone: primary action within thumb reach */}
      <div
        className="sm:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-6 bg-gradient-to-t from-bg from-60% to-transparent"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
      >
        <button type="button" className="btn-primary btn-lg w-full" onClick={() => openRecord()}>
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Record money
        </button>
      </div>
    </div>
  );
}

function Figure({ label, children, first }) {
  return (
    <div className={`flex flex-col gap-1.5 ${first ? "sm:pr-6" : "sm:px-6 sm:border-l sm:border-line"}`}>
      <span className="text-[13px] text-muted">{label}</span>
      {children}
    </div>
  );
}

function MonthBar({ label, value, max, tone }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-3">
        <span className="text-muted">{label}</span>
        <Money value={value} sign={value ? (tone === "in" ? "in" : "out") : "none"} className={tone === "in" && value ? "text-mint" : ""} />
      </div>
      <span className="h-1.5 rounded-full bg-line overflow-hidden">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: tone === "in" ? "var(--mint)" : "var(--muted)" }} />
      </span>
    </div>
  );
}

export default OnePotView;
