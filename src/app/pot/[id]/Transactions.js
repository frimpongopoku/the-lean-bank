"use client";
import { useMemo, useState } from "react";
import { format, startOfDay, startOfMonth, subDays } from "date-fns";
import Icon from "@/app/components/ui/Icon";
import Menu from "@/app/components/ui/Menu";
import { Money, partColor, isIn, isMove, dayLabel, timeLabel, formatAmount, describeTxn } from "@/app/components/ui/money";
import TxnIcon from "@/app/components/ui/TxnIcon";
import { downloadCSV, downloadPDF } from "@/app/lib/export";

const PAGE = 50;
const PERIODS = [
  { id: "all", label: "All time" },
  { id: "month", label: "This month" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "custom", label: "Custom range" },
];

const isLoanTx = (t) => t.kind === "loan" || /^Borrowed:/.test(t.description || "");
const isAdjust = (t) => t.kind === "adjust" || t.source === "Adjustment";

export default function Activity({ txns, parts, pot }) {
  const [q, setQ] = useState("");
  const [env, setEnv] = useState("");
  const [type, setType] = useState("all");
  const [period, setPeriod] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const cur = pot?.currency || "";

  const colorFor = useMemo(() => {
    const m = {};
    parts.forEach((p, i) => (m[p.id] = partColor(i)));
    return m;
  }, [parts]);

  const envOptions = useMemo(() => {
    const names = new Map(parts.map((p) => [p.id, p.name]));
    txns.forEach((t) => t.part_id && !names.has(t.part_id) && names.set(t.part_id, `${t.source} (deleted)`));
    return [...names.entries()];
  }, [parts, txns]);

  const filtered = useMemo(() => {
    const now = new Date();
    let start = null;
    let end = null;
    if (period === "month") start = startOfMonth(now);
    if (period === "30") start = startOfDay(subDays(now, 30));
    if (period === "90") start = startOfDay(subDays(now, 90));
    if (period === "custom") {
      if (from) start = new Date(`${from}T00:00:00`);
      if (to) end = new Date(`${to}T23:59:59`);
    }
    const needle = q.trim().toLowerCase();
    return txns.filter((t) => {
      if (env && t.part_id !== env) return false;
      if (type === "in" && (!isIn(t) || isMove(t))) return false;
      if (type === "out" && (isIn(t) || isMove(t))) return false;
      if (type === "moves" && !isMove(t)) return false;
      if (start && (!t._d || t._d < start)) return false;
      if (end && (!t._d || t._d > end)) return false;
      if (needle) {
        const hay = `${t.description || ""} ${describeTxn(t)} ${t.source || ""} ${t.amount} ${formatAmount(t.amount)}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [txns, q, env, type, period, from, to]);

  const totals = useMemo(() => {
    let i = 0;
    let o = 0;
    filtered.forEach((t) => {
      if (isMove(t)) return;
      if (isIn(t)) i += Number(t.amount) || 0;
      else o += Number(t.amount) || 0;
    });
    return { in: i, out: o, net: i - o };
  }, [filtered]);

  const days = useMemo(() => {
    const groups = [];
    let current = null;
    filtered.slice(0, limit).forEach((t) => {
      const key = t._d ? format(t._d, "yyyy-MM-dd") : "unknown";
      if (!current || current.key !== key) {
        current = { key, label: dayLabel(t._d), items: [], net: 0 };
        groups.push(current);
      }
      current.items.push(t);
      if (!isMove(t)) current.net += (isIn(t) ? 1 : -1) * (Number(t.amount) || 0);
    });
    return groups;
  }, [filtered, limit]);

  const hasFilters = q || env || type !== "all" || period !== "all";
  const clear = () => {
    setQ("");
    setEnv("");
    setType("all");
    setPeriod("all");
    setFrom("");
    setTo("");
  };

  const exportRows = () =>
    filtered.map((t) => [
      t._d ? format(t._d, "yyyy-MM-dd HH:mm") : "",
      isMove(t) ? "Move" : isIn(t) ? "In" : "Out",
      (isIn(t) ? "" : "-") + (Number(t.amount) || 0).toFixed(2),
      t.source || "",
      t.description || "",
    ]);
  const headers = ["Date", "Type", `Amount${cur ? ` (${cur})` : ""}`, "Envelope", "Note"];
  const fileName = `${(pot?.name || "pot").replace(/[^\w]+/g, "-").toLowerCase()}-activity`;

  if (!txns.length) {
    return (
      <div className="card px-6 py-12 flex flex-col items-center text-center gap-3">
        <span className="w-11 h-11 rounded-full bg-raised text-muted inline-flex items-center justify-center">
          <Icon name="calendar" size={20} />
        </span>
        <h2 className="m-0 text-base font-semibold">No activity yet</h2>
        <p className="m-0 text-muted max-w-[40ch]">Everything you record (money in, money out, loans and moves) shows up here, newest first.</p>
      </div>
    );
  }

  return (
    <section aria-label="Activity" className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <label className="relative flex-[1_1_240px] min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none">
            <Icon name="search" />
          </span>
          <span className="sr-only">Search activity</span>
          <input
            type="search"
            className="field !pl-9 !h-10"
            placeholder="Search notes, envelopes, amounts"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(PAGE);
            }}
            enterKeyHint="search"
          />
        </label>
        <label className="flex-[0_1_200px] min-w-[150px]">
          <span className="sr-only">Envelope</span>
          <select className="field !h-10" value={env} onChange={(e) => setEnv(e.target.value)}>
            <option value="">All envelopes</option>
            {envOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
        <div className="seg" role="group" aria-label="Type">
          {[
            ["all", "All"],
            ["in", "In"],
            ["out", "Out"],
            ["moves", "Moves"],
          ].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={type === id} onClick={() => setType(id)}>
              {label}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">Period</span>
          <select className="field !h-10 !w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
        <Menu
          items={[
            { label: "Download CSV", icon: "download", onSelect: () => downloadCSV(fileName, headers, exportRows()) },
            { label: "Download PDF", icon: "download", onSelect: () => downloadPDF(fileName, `${pot?.name} · Activity`, headers, exportRows()) },
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

      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          <label className="flex items-center gap-2 text-[13px] text-muted">
            From
            <input type="date" className="field !h-10 !w-auto" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-[13px] text-muted">
            To
            <input type="date" className="field !h-10 !w-auto" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      )}

      {/* Totals */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 items-end">
        <Stat label="Money in"><Money value={totals.in} sign={totals.in ? "in" : "none"} className={totals.in ? "text-mint" : ""} /></Stat>
        <Stat label="Money out"><Money value={totals.out} sign={totals.out ? "out" : "none"} /></Stat>
        <Stat label="Net"><Money value={totals.net} sign={totals.net > 0 ? "in" : "auto"} /></Stat>
        <span className="sm:ml-auto text-[13px] text-faint flex items-center gap-3">
          {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
          {hasFilters && (
            <button type="button" onClick={clear} className="text-mint hover:underline underline-offset-2">
              Clear filters
            </button>
          )}
        </span>
      </div>

      {/* Day groups */}
      {filtered.length === 0 ? (
        <div className="card px-6 py-10 text-center flex flex-col items-center gap-3">
          <p className="m-0 text-muted">Nothing matches these filters.</p>
          <button type="button" className="btn-ghost btn-sm" onClick={clear}>Clear filters</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {days.map((d, gi) => (
            <section key={d.key} aria-label={d.label}>
              <h3 className={`m-0 flex justify-between px-4 sm:px-5 pt-3.5 pb-2 text-xs font-medium text-muted ${gi ? "border-t border-line" : ""}`}>
                <span>{d.label}</span>
                <Money value={d.net} sign={d.net > 0 ? "in" : "auto"} className="font-normal" />
              </h3>
              <ul className="list-none m-0 p-0">
                {d.items.map((t) => (
                  <ActivityItem key={t.id} t={t} color={colorFor[t.part_id]} />
                ))}
              </ul>
            </section>
          ))}
          {filtered.length > limit && (
            <div className="flex justify-center px-5 py-4 border-t border-line">
              <button type="button" className="btn-ghost !h-9" onClick={() => setLimit((l) => l + PAGE)}>
                Show {Math.min(PAGE, filtered.length - limit)} more
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Stat({ label, children }) {
  return (
    <div>
      <div className="text-[13px] text-muted">{label}</div>
      <div className="text-[22px]">{children}</div>
    </div>
  );
}

function ActivityItem({ t, color }) {
  const move = isMove(t);
  const incoming = isIn(t);
  const loan = isLoanTx(t);
  const adjust = isAdjust(t);
  const tag = loan ? "Loan" : t.kind === "repay" ? "Repaid" : adjust ? "Balance update" : null;
  const desc = describeTxn(t, incoming ? "Money in" : "Money out");

  return (
    <li className="flex items-center gap-3.5 px-4 sm:px-5 py-3">
      <TxnIcon incoming={incoming} move={move} loan={loan} />
      <div className="flex-1 min-w-0">
        <div className="truncate">{desc}</div>
        <div className="flex items-center gap-2 text-xs text-muted min-w-0">
          {!adjust && (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-[2px] flex-none" style={{ background: color || "var(--line-strong)" }} />
              <span className="truncate">{t.source || "—"}</span>
            </span>
          )}
          {!adjust && <span aria-hidden="true">·</span>}
          <span className="flex-none">{timeLabel(t._d)}</span>
          {tag && (
            <span className={`flex-none text-[11px] leading-4 px-1.5 rounded border ${loan ? "text-amber border-[rgba(242,180,90,0.35)]" : "text-muted border-line-strong"}`}>
              {tag}
            </span>
          )}
        </div>
      </div>
      <Money
        value={t.amount}
        sign={move ? "none" : incoming ? "in" : "out"}
        className={incoming && !move ? "text-mint" : "text-ink"}
      />
    </li>
  );
}
