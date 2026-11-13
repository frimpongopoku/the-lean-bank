"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import Icon from "@/app/components/ui/Icon";
import Menu from "@/app/components/ui/Menu";
import { Money, partColor, daysAgo, shortDate, dateWithAge, formatAmount } from "@/app/components/ui/money";
import { parseAmount } from "../forms/InputField";
import useMoneyActions from "@/app/hooks/useMoneyActions";
import { downloadCSV, downloadPDF } from "@/app/lib/export";

const owedOn = (l) => Math.max(0, (Number(l.amount) || 0) - (Number(l.paid_amount) || 0));

export default function Loans({ loans, pot, focusLoanId }) {
  const { repay } = useMoneyActions();
  const [env, setEnv] = useState("");
  const [openId, setOpenId] = useState(focusLoanId || null);
  const [showRepaid, setShowRepaid] = useState(false);
  const parts = pot?.parts || [];
  const cur = pot?.currency || "";

  const colorFor = useMemo(() => {
    const m = {};
    parts.forEach((p, i) => (m[p.id] = partColor(i)));
    return m;
  }, [parts]);

  const scoped = env ? loans.filter((l) => (l.source_id || l.part_id) === env) : loans;
  const open = scoped.filter((l) => !l.paid).sort((a, b) => (a._d?.getTime() || 0) - (b._d?.getTime() || 0));
  const repaid = scoped.filter((l) => l.paid).sort((a, b) => (b._d?.getTime() || 0) - (a._d?.getTime() || 0));
  const owed = open.reduce((a, l) => a + owedOn(l), 0);
  const repaidTotal = scoped.reduce((a, l) => a + (Number(l.paid_amount) || (l.paid ? Number(l.amount) || 0 : 0)), 0);

  const envOptions = useMemo(() => {
    const m = new Map();
    loans.forEach((l) => {
      const id = l.source_id || l.part_id;
      if (id && !m.has(id)) m.set(id, parts.find((p) => p.id === id)?.name || `${l.source} (deleted)`);
    });
    return [...m.entries()];
  }, [loans, parts]);

  const headers = ["Date", "Envelope", "Note", `Amount${cur ? ` (${cur})` : ""}`, "Repaid", "Status"];
  const rows = () =>
    scoped.map((l) => [
      l._d ? format(l._d, "yyyy-MM-dd") : "",
      l.source || "",
      l.description || "",
      (Number(l.amount) || 0).toFixed(2),
      (Number(l.paid_amount) || (l.paid ? Number(l.amount) : 0) || 0).toFixed(2),
      l.paid ? "Repaid" : "Open",
    ]);
  const fileName = `${(pot?.name || "pot").replace(/[^\w]+/g, "-").toLowerCase()}-loans`;

  if (!loans.length) {
    return (
      <div className="card px-6 py-12 flex flex-col items-center text-center gap-3">
        <span className="w-11 h-11 rounded-full bg-raised text-amber inline-flex items-center justify-center">
          <Icon name="loan" size={20} />
        </span>
        <h2 className="m-0 text-base font-semibold">No loans</h2>
        <p className="m-0 text-muted max-w-[44ch]">
          When you borrow from an envelope, record it with <span className="text-ink">Lend out</span>. It stays here until
          it&apos;s repaid, so nothing quietly goes missing.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Loans" className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-x-8 gap-y-3 items-end">
        <div>
          <div className="text-[13px] text-muted">Still owed to your envelopes</div>
          <Money value={owed} currency={cur} className="text-[28px] sm:text-[32px] font-medium text-amber" currencyClassName="text-[0.55em]" />
        </div>
        <div>
          <div className="text-[13px] text-muted">Open loans</div>
          <div className="num text-[22px]">{open.length}</div>
        </div>
        <div>
          <div className="text-[13px] text-muted">Repaid all-time</div>
          <Money value={repaidTotal} className="text-[22px]" />
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          {envOptions.length > 1 && (
            <label>
              <span className="sr-only">Envelope</span>
              <select className="field !h-10 !w-auto" value={env} onChange={(e) => setEnv(e.target.value)}>
                <option value="">All envelopes</option>
                {envOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </label>
          )}
          <Menu
            items={[
              { label: "Download CSV", icon: "download", onSelect: () => downloadCSV(fileName, headers, rows()) },
              { label: "Download PDF", icon: "download", onSelect: () => downloadPDF(fileName, `${pot?.name} · Loans`, headers, rows()) },
            ]}
          >
            {(p) => (
              <button {...p} type="button" className="btn-ghost !h-10">
                <Icon name="download" />
                Export
              </button>
            )}
          </Menu>
        </div>
      </div>

      <section aria-labelledby="open-h" className="card overflow-hidden">
        <h2 id="open-h" className="m-0 px-4 sm:px-5 pt-4 pb-3 text-sm font-semibold">Open</h2>
        {open.length === 0 ? (
          <p className="m-0 px-5 pb-5 text-muted text-sm">Everything is repaid.</p>
        ) : (
          <ul className="list-none m-0 p-0">
            {open.map((l) => (
              <LoanRow
                key={l.id}
                loan={l}
                pot={pot}
                color={colorFor[l.source_id || l.part_id]}
                expanded={openId === l.id}
                onToggle={() => setOpenId((id) => (id === l.id ? null : l.id))}
                onRepay={(v) => {
                  setOpenId(null);
                  repay(pot.id, l, v);
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {repaid.length > 0 && (
        <section aria-label="Repaid loans" className="border border-line rounded-2xl">
          <button
            type="button"
            aria-expanded={showRepaid}
            onClick={() => setShowRepaid((v) => !v)}
            className="w-full flex items-center gap-2.5 px-4 sm:px-5 py-4 text-left text-ink font-medium"
          >
            <span className={`text-muted transition-transform duration-200 ease-out ${showRepaid ? "rotate-90" : ""}`}>
              <Icon name="chevronRight" />
            </span>
            Repaid
            <span className="text-muted font-normal">
              {repaid.length} loan{repaid.length === 1 ? "" : "s"}
            </span>
          </button>
          {showRepaid && (
            <ul className="list-none m-0 p-0 border-t border-line">
              {repaid.map((l, i) => (
                <li key={l.id} className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${i ? "border-t border-line" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-ink-2">{l.description || "Loan"}</div>
                    <div className="text-xs text-muted truncate">
                      From {l.source} · {shortDate(l._d)}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Icon name="check" size={14} className="text-mint" />
                    Repaid
                  </span>
                  <Money value={l.amount} className="text-muted w-24 text-right" />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}

function LoanRow({ loan, pot, color, expanded, onToggle, onRepay }) {
  const rowRef = useRef(null);
  const total = Number(loan.amount) || 0;
  const back = Number(loan.paid_amount) || 0;
  const owed = owedOn(loan);
  const part = (pot?.parts || []).find((p) => p.id === (loan.source_id || loan.part_id));

  useEffect(() => {
    if (expanded) rowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [expanded]);

  return (
    <li ref={rowRef} className={`border-t border-line ${expanded ? "bg-surface-2" : ""}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_150px_120px_110px] items-center gap-x-3 md:gap-x-4 px-4 sm:px-5 py-3.5">
        <div className="min-w-0">
          <div className="font-medium truncate" title={loan.description || undefined}>{loan.description || "Loan"}</div>
          <Money value={owed} className="md:hidden block text-[15px] mt-0.5" />
          <div className="text-xs text-muted flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-[2px] flex-none" style={{ background: color || "var(--line-strong)" }} />
            <span className="truncate">
              From {loan.source} · {dateWithAge(loan._d)}
            </span>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-1.5">
          <span className="h-1 rounded-full bg-line-strong overflow-hidden">
            <span className="block h-full bg-amber" style={{ width: `${total ? (back / total) * 100 : 0}%` }} />
          </span>
          <span className="text-xs text-muted">
            {back > 0 ? (
              <>
                <Money value={back} /> of <Money value={total} /> back
              </>
            ) : (
              "Nothing back yet"
            )}
          </span>
        </div>
        <Money value={owed} className="hidden md:block text-right text-[15px]" />
        <div className="text-right">
          <button type="button" className="btn-ghost !h-9 !px-3 text-[13px]" aria-expanded={expanded} onClick={onToggle}>
            {expanded ? "Close" : "Repay"}
          </button>
        </div>
      </div>
      {expanded && <RepayForm loan={loan} owed={owed} part={part} currency={pot?.currency || ""} onCancel={onToggle} onSubmit={onRepay} />}
    </li>
  );
}

function RepayForm({ loan, owed, part, currency, onCancel, onSubmit }) {
  const [amount, setAmount] = useState(String(owed));
  const [dest, setDest] = useState(part ? "envelope" : "settle");
  const [error, setError] = useState("");
  const value = parseAmount(amount);
  const valid = Number.isFinite(value) && value > 0 && value <= owed + 0.001;
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.select();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!Number.isFinite(value) || value <= 0) return setError("Enter an amount above zero.");
    if (value > owed + 0.001) return setError(`Only ${currency} ${formatAmount(owed)} is still owed.`);
    onSubmit({ amount: value, toEnvelope: dest === "envelope" && !!part });
  };

  const partial = valid && value < owed - 0.001;
  const after = (Number(part?.balance) || 0) + (valid ? value : 0);

  return (
    <form onSubmit={submit} className="px-4 sm:px-5 pb-5 pt-1 flex flex-col gap-4" aria-label={`Repay ${loan.description || "loan"}`}>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="flex-[0_1_240px]">
          <label className="field-label" htmlFor={`repay-${loan.id}`}>Amount repaid</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none">{currency}</span>
            <input
              ref={inputRef}
              id={`repay-${loan.id}`}
              className="field num"
              style={{ paddingLeft: currency ? `${currency.length * 9 + 22}px` : undefined }}
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              aria-invalid={!!error}
            />
          </div>
        </div>
        <span className="text-[13px] text-muted pb-3">
          {partial ? (
            <>
              <Money value={owed - value} /> will still be owed.
            </>
          ) : (
            "Pay part of it now and the rest later."
          )}
        </span>
      </div>

      <fieldset className="border-0 p-0 m-0 flex flex-wrap gap-3">
        <legend className="text-[13px] text-muted mb-2">Where does the money go?</legend>
        <Option checked={dest === "envelope"} disabled={!part} onChange={() => setDest("envelope")} name={`dest-${loan.id}`}>
          <span className="font-medium">{part ? `Back into ${part.name}` : `Back into ${loan.source}`}</span>
          <span className="text-[13px] text-muted">
            {part ? (
              <>
                {part.name} goes from <Money value={part.balance} /> to <Money value={after} className="text-ink" />. Logged as money in.
              </>
            ) : (
              "That envelope was deleted."
            )}
          </span>
        </Option>
        <Option checked={dest === "settle"} onChange={() => setDest("settle")} name={`dest-${loan.id}`}>
          <span className="font-medium">Settle without refunding</span>
          <span className="text-[13px] text-muted">The money was used elsewhere. Closes the loan; no envelope changes.</span>
        </Option>
      </fieldset>

      {error && <p className="m-0 text-[13px] text-danger" role="alert">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">
          {valid ? `Repay ${currency} ${formatAmount(value)}` : "Repay"}
        </button>
      </div>
    </form>
  );
}

function Option({ checked, disabled, onChange, name, children }) {
  return (
    <label
      className={`flex gap-3 items-start rounded-xl border p-3.5 flex-[1_1_260px] transition-colors duration-150 ${
        disabled ? "opacity-50 cursor-not-allowed border-line-strong" : "cursor-pointer"
      } ${checked && !disabled ? "border-mint bg-[rgba(94,230,176,0.05)]" : "border-line-strong hover:border-[#3a3f47]"}`}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="mt-[3px] accent-[#5EE6B0] w-4 h-4 flex-none" />
      <span className="flex flex-col gap-0.5 min-w-0">{children}</span>
    </label>
  );
}
