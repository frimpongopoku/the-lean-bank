"use client";
import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { FormHeader, parseAmount } from "./InputField";
import { Money, formatAmount, partColor, useAmountsHidden, MASK } from "@/app/components/ui/money";

export const MODES = [
  { id: "add", label: "Add", verb: "Add", noteHint: "Where did it come from?" },
  { id: "spend", label: "Spend", verb: "Spend", noteHint: "What was it for?" },
  { id: "lend", label: "Lend out", verb: "Lend", noteHint: "Who or what is it for?" },
  { id: "move", label: "Move", verb: "Move", noteHint: "Why the move?" },
];

/*
 * One sheet for every money movement. Shows the envelope's balance before and
 * after so the result is visible before saving.
 * onSubmit({ mode, amount, partId, toPartId, description, date })
 */
export default function RecordForm({ pots = [], initialPotId, initialMode = "spend", initialPartId, onSubmit, onClose }) {
  const hidden = useAmountsHidden();
  const [potId, setPotId] = useState(initialPotId || pots.find((p) => p.parts?.length)?.id || pots[0]?.id);
  const pot = pots.find((p) => p.id === potId) || pots[0];
  const parts = pot?.parts || [];
  const currency = pot?.currency || "";
  const canMove = parts.length > 1;
  const [mode, setMode] = useState(initialMode === "move" && !canMove ? "spend" : initialMode);
  const [partId, setPartId] = useState(initialPartId || parts[0]?.id || "");
  const [toPartId, setToPartId] = useState(() => parts.find((p) => p.id !== (initialPartId || parts[0]?.id))?.id || "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [showDate, setShowDate] = useState(false);
  const [error, setError] = useState("");
  const amountRef = useRef(null);

  const idx = (id) => parts.findIndex((p) => p.id === id);
  const from = parts.find((p) => p.id === partId);
  const to = parts.find((p) => p.id === toPartId);
  const value = parseAmount(amount);
  const valid = Number.isFinite(value) && value > 0;
  const m = MODES.find((x) => x.id === mode);

  const fromAfter = useMemo(() => {
    if (!from) return 0;
    const b = Number(from.balance) || 0;
    if (!valid) return b;
    return mode === "add" ? b + value : b - value;
  }, [from, mode, value, valid]);
  const toAfter = (Number(to?.balance) || 0) + (valid ? value : 0);

  const opt = (p) => `${p.name} · ${hidden ? MASK : formatAmount(p.balance)}`;

  const submit = (e) => {
    e.preventDefault();
    if (!from) return setError("Pick an envelope.");
    if (!valid) {
      setError("Enter an amount above zero.");
      amountRef.current?.focus();
      return;
    }
    if (mode === "move" && (!to || to.id === from.id)) return setError("Pick a different envelope to move into.");
    const when = date === today ? new Date() : new Date(`${date}T12:00:00`);
    onSubmit({ potId: pot.id, mode, amount: value, partId: from.id, toPartId: to?.id, description: note.trim(), date: when });
  };

  const cta = valid
    ? mode === "add"
      ? `Add ${currency} ${formatAmount(value)} to ${from?.name ?? ""}`
      : mode === "spend"
      ? `Spend ${currency} ${formatAmount(value)} from ${from?.name ?? ""}`
      : mode === "lend"
      ? `Lend ${currency} ${formatAmount(value)} from ${from?.name ?? ""}`
      : `Move ${currency} ${formatAmount(value)}`
    : m.verb;

  const potPicker =
    pots.length > 1 ? (
      <div>
        <label className="field-label" htmlFor="rec-pot">Pot</label>
        <select
          id="rec-pot"
          className="field"
          value={pot?.id}
          onChange={(e) => {
            const next = pots.find((p) => p.id === e.target.value);
            setPotId(next.id);
            const first = next.parts?.[0]?.id || "";
            setPartId(first);
            setToPartId(next.parts?.find((p) => p.id !== first)?.id || "");
            if (mode === "move" && (next.parts?.length || 0) < 2) setMode("spend");
          }}
        >
          {pots.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
    ) : null;

  if (!parts.length) {
    return (
      <div>
        <FormHeader title="Record money" onClose={onClose} />
        <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
          {potPicker}
          <p className="m-0 text-muted text-sm">This pot has no envelopes yet. Create one first, then record money in and out of it.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <FormHeader title="Record money" onClose={onClose} />
      <div className="px-5 sm:px-6 pt-4 pb-5 flex flex-col gap-4">
        {potPicker}
        <div role="radiogroup" aria-label="What happened" className="seg w-full">
          {MODES.map((x) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={mode === x.id}
              disabled={x.id === "move" && !canMove}
              title={x.id === "move" && !canMove ? "You need two envelopes to move money" : undefined}
              onClick={() => {
                setMode(x.id);
                setError("");
              }}
              className="!h-9 !px-1 text-[13px] sm:!text-sm disabled:opacity-40"
            >
              {x.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <label className="flex flex-col items-center gap-1 pt-2 pb-1">
          <span className="text-[13px] text-muted">Amount</span>
          <span className="flex items-baseline justify-center gap-2 w-full">
            {currency && <span className="text-faint text-lg">{currency}</span>}
            <input
              ref={amountRef}
              data-autofocus=""
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="0.00"
              aria-invalid={!!error && !valid}
              className="num bg-transparent border-0 outline-none text-ink text-[44px] sm:text-[52px] font-medium leading-tight p-0 placeholder:text-line-strong"
              style={{ width: `${Math.max(4, (amount || "0.00").length) + 0.5}ch`, maxWidth: "100%" }}
            />
          </span>
        </label>

        {/* Envelopes */}
        <div className="flex flex-col gap-3">
          <EnvelopeSelect
            label={mode === "add" ? "Into envelope" : mode === "lend" ? "Lend from" : "From envelope"}
            value={partId}
            onChange={(id) => {
              setPartId(id);
              if (id === toPartId) setToPartId(parts.find((p) => p.id !== id)?.id || "");
            }}
            parts={parts}
            colorIndex={idx(partId)}
            opt={opt}
          />
          {mode === "move" && (
            <EnvelopeSelect
              label="Into envelope"
              value={toPartId}
              onChange={setToPartId}
              parts={parts.filter((p) => p.id !== partId)}
              colorIndex={idx(toPartId)}
              opt={opt}
            />
          )}
        </div>

        {/* Note + date */}
        <div className="flex flex-col gap-2">
          <label className="field-label !mb-0" htmlFor="rec-note">Note</label>
          <input
            id="rec-note"
            className="field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={m.noteHint}
            maxLength={120}
            autoComplete="off"
            enterKeyHint="done"
          />
          {showDate ? (
            <div className="flex items-center gap-2">
              <label htmlFor="rec-date" className="text-[13px] text-muted">Date</label>
              <input
                id="rec-date"
                type="date"
                className="field !h-10 !w-auto"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value || today)}
              />
            </div>
          ) : (
            <button type="button" className="self-start text-[13px] text-muted hover:text-ink underline-offset-2 hover:underline" onClick={() => setShowDate(true)}>
              Today · change date
            </button>
          )}
        </div>

        {/* Preview */}
        {from && (
          <div className="rounded-xl bg-bg px-3.5 py-3 flex flex-col gap-1.5 text-[13px]" aria-live="polite">
            <PreviewRow name={from.name} before={from.balance} after={fromAfter} />
            {mode === "move" && to && <PreviewRow name={to.name} before={to.balance} after={toAfter} />}
            {fromAfter < 0 && valid && (
              <p className="m-0 text-amber">{from.name} would go below zero.</p>
            )}
            {mode === "lend" && (
              <p className="m-0 pt-1.5 mt-0.5 border-t border-line text-amber">Opens a loan you can repay from the Loans tab.</p>
            )}
            {mode === "move" && <p className="m-0 text-muted">The account balance doesn&apos;t change.</p>}
          </div>
        )}

        {error && <p className="m-0 text-[13px] text-danger" role="alert">{error}</p>}

        <button type="submit" className="btn-primary btn-lg w-full">
          <span className="truncate">{cta}</span>
        </button>
      </div>
    </form>
  );
}

function EnvelopeSelect({ label, value, onChange, parts, colorIndex, opt }) {
  const id = `env-${label.replace(/\s/g, "")}`;
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-[3px] pointer-events-none"
          style={{ background: colorIndex >= 0 ? partColor(colorIndex) : "var(--line-strong)" }}
        />
        <select id={id} className="field !h-12 !pl-9" value={value} onChange={(e) => onChange(e.target.value)}>
          {parts.map((p) => (
            <option key={p.id} value={p.id}>
              {opt(p)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PreviewRow({ name, before, after }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted truncate">{name}</span>
      <span className="flex items-center gap-1.5">
        <Money value={before} className="text-faint" />
        <span className="text-faint" aria-hidden="true">→</span>
        <span className="sr-only">becomes</span>
        <Money value={after} className={after < 0 ? "text-amber" : "text-ink"} />
      </span>
    </div>
  );
}
