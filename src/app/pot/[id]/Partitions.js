"use client";
import React, { useMemo, useState } from "react";
import Icon from "@/app/components/ui/Icon";
import Menu from "@/app/components/ui/Menu";
import { Money, partColor, isIn, isMove, shortDate } from "@/app/components/ui/money";

const SORTS = [
  { id: "order", label: "Your order" },
  { id: "largest", label: "Largest first" },
  { id: "recent", label: "Recently used" },
  { id: "az", label: "A–Z" },
];

/* The Envelopes tab: one dense row per envelope; actions appear on hover/focus (always on touch). */
export default function Envelopes({ parts, txns, assigned, onCreate, onEdit, onDelete, onRecord }) {
  const [sort, setSort] = useState("order");

  const lastByPart = useMemo(() => {
    const map = {};
    for (const t of txns) {
      if (t.part_id && !map[t.part_id]) map[t.part_id] = t;
    }
    return map;
  }, [txns]);

  const rows = useMemo(() => {
    const list = parts.map((p, i) => ({ ...p, _i: i, _last: lastByPart[p.id] }));
    if (sort === "largest") list.sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0));
    if (sort === "az") list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    if (sort === "recent") list.sort((a, b) => (b._last?._d?.getTime() || 0) - (a._last?._d?.getTime() || 0));
    return list;
  }, [parts, sort, lastByPart]);

  if (!parts.length) {
    return (
      <div className="card px-6 py-12 flex flex-col items-center text-center gap-3">
        <span className="w-11 h-11 rounded-full bg-raised text-muted inline-flex items-center justify-center">
          <Icon name="wallet" size={20} />
        </span>
        <h2 className="m-0 text-base font-semibold">No envelopes yet</h2>
        <p className="m-0 text-muted max-w-[40ch]">
          Split this pot by purpose: Rent, Food, Savings. Each envelope tracks what it holds and what moves in and out.
        </p>
        <button type="button" className="btn-primary mt-2" onClick={onCreate}>
          <Icon name="plus" />
          Create an envelope
        </button>
      </div>
    );
  }

  return (
    <section aria-label="Envelopes" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 text-[13px] text-muted">
          Sort
          <select className="field !h-9 !w-auto !text-[13px] sm:!text-[13px]" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-ghost !h-9" onClick={onCreate}>
          <Icon name="plus" />
          New envelope
        </button>
      </div>

      <div className="card">
        <div className="hidden md:grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_110px_150px_116px] gap-4 px-5 pt-3.5 pb-2.5 text-xs text-faint">
          <span>Envelope</span>
          <span>Last movement</span>
          <span>Share</span>
          <span className="text-right">Balance</span>
          <span className="sr-only">Actions</span>
        </div>
        <ul className="list-none m-0 p-0">
          {rows.map((p, n) => (
            <EnvelopeRow
              key={p.id}
              part={p}
              first={n === 0}
              color={partColor(p._i)}
              share={assigned > 0 ? Math.max(0, (Number(p.balance) || 0) / assigned) : 0}
              onRecord={(mode) => onRecord(mode, p)}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function LastMovement({ t }) {
  if (!t) return <span className="text-faint">No activity yet</span>;
  const move = isMove(t);
  const loan = t.kind === "loan" || /^Borrowed:/.test(t.description || "");
  const incoming = isIn(t);
  const verb = move ? (incoming ? "Moved in" : "Moved out") : loan ? "Lent" : incoming ? "In" : "Out";
  return (
    <span className="truncate">
      {verb} <Money value={t.amount} className="text-ink-2" /> · {shortDate(t._d)}
    </span>
  );
}

function EnvelopeRow({ part, first, color, share, onRecord, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pct = Math.round(share * 100);
  const negative = Number(part.balance) < 0;

  const moreItems = [
    { label: "Lend out", icon: "loan", onSelect: () => onRecord("lend") },
    { label: "Move to another envelope", icon: "move", onSelect: () => onRecord("move") },
    { divider: true },
    { label: "Edit envelope", icon: "edit", onSelect: onEdit },
    { label: "Delete envelope", icon: "trash", tone: "danger", onSelect: onDelete },
  ];

  return (
    <li
      className={`reveal-row grid grid-cols-[minmax(0,1fr)_auto_auto] md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_110px_150px_116px] items-center gap-x-3 md:gap-x-4 px-4 md:px-5 py-3 ${
        first ? "" : "border-t border-line"
      } ${menuOpen ? "bg-surface-2" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2.5 h-2.5 rounded-[3px] flex-none" style={{ background: color }} />
        <div className="min-w-0 flex flex-col">
          <span className="font-medium truncate">{part.name}</span>
          <span className="md:hidden text-xs text-muted truncate">
            <LastMovement t={part._last} />
          </span>
        </div>
      </div>

      <span className="hidden md:block text-[13px] text-muted min-w-0 truncate">
        <LastMovement t={part._last} />
      </span>

      <div className="hidden md:flex items-center gap-2" title={`${pct}% of what's in envelopes`}>
        <span className="flex-1 h-1 rounded-full bg-line overflow-hidden">
          <span className="block h-full" style={{ width: `${pct}%`, background: color }} />
        </span>
        <span className="num text-xs text-muted w-9 text-right">{pct}%</span>
      </div>

      <Money value={part.balance} className={`text-right text-[15px] ${negative ? "text-amber" : ""}`} />

      <div className="row-actions flex justify-end gap-0.5" data-open={menuOpen ? "true" : undefined}>
        <button type="button" className="icon-btn hidden md:inline-flex" aria-label={`Add money to ${part.name}`} title="Add money" onClick={() => onRecord("add")}>
          <Icon name="plus" />
        </button>
        <button type="button" className="icon-btn hidden md:inline-flex" aria-label={`Spend from ${part.name}`} title="Spend" onClick={() => onRecord("spend")}>
          <Icon name="minus" />
        </button>
        <Menu
          onOpenChange={setMenuOpen}
          items={[
            { label: "Add money", icon: "plus", onSelect: () => onRecord("add"), mobileOnly: true },
            { label: "Spend", icon: "minus", onSelect: () => onRecord("spend"), mobileOnly: true },
            ...moreItems,
          ].filter((i) => !i.mobileOnly || (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches))}
        >
          {(p) => (
            <button {...p} type="button" className="icon-btn md:w-9 w-11 h-11 md:h-9 -mr-2 md:mr-0" aria-label={`More for ${part.name}`}>
              <Icon name="more" />
            </button>
          )}
        </Menu>
      </div>
    </li>
  );
}
