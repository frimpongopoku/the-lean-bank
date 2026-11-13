"use client";
import { useSyncExternalStore } from "react";
import { format, isToday, isYesterday, differenceInCalendarDays, isSameYear } from "date-fns";

/* ── Privacy: one global switch, remembered per device ───────────────────── */
const KEY = "tlb_hide_amounts";
const listeners = new Set();

const read = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === null ? true : v === "1"; // private by default
  } catch {
    return true;
  }
};

export const setAmountsHidden = (hidden) => {
  try {
    localStorage.setItem(KEY, hidden ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l());
};

const subscribe = (cb) => {
  listeners.add(cb);
  const onStorage = (e) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
};

export const useAmountsHidden = () => useSyncExternalStore(subscribe, read, () => true);

/* ── Formatting ───────────────────────────────────────────────────────────── */
export const MASK = "••••••";

export const formatAmount = (n) =>
  (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * A money figure. Always tabular mono; masked with a fixed-length mask so the
 * digit count never leaks.
 *   sign: "none" | "auto" (− for negatives) | "in" (+) | "out" (−)
 */
export function Money({ value, currency, sign = "auto", className = "", currencyClassName = "" }) {
  const hidden = useAmountsHidden();
  const n = Number(value) || 0;
  let prefix = "";
  if (sign === "in") prefix = "+";
  else if (sign === "out") prefix = "−";
  else if (sign === "auto" && n < 0) prefix = "−";
  const shown = Math.abs(n);

  return (
    <span className={`num whitespace-nowrap ${className}`}>
      {currency && (
        <span className={`font-sans tracking-normal text-faint mr-[0.35em] ${currencyClassName}`}>{currency}</span>
      )}
      {hidden ? (
        <span aria-label="Amount hidden">{MASK}</span>
      ) : (
        <>
          {prefix}
          {formatAmount(shown)}
        </>
      )}
    </span>
  );
}

/* ── Envelope colours: distinct hues at matched lightness ─────────────────── */
export const PART_COLORS = [
  "#6AA8FF", "#C792EA", "#F59E6B", "#5EE6B0", "#7FD3E6",
  "#E6D86A", "#FF8FA3", "#A3B4C8", "#8C7CF0", "#9AD86A",
];
export const partColor = (index) => PART_COLORS[((index % PART_COLORS.length) + PART_COLORS.length) % PART_COLORS.length];

/* ── Dates ────────────────────────────────────────────────────────────────── */
export const toDate = (input) => {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input) ? null : input;
  if (typeof input === "object" && typeof input.seconds === "number") return new Date(input.seconds * 1000);
  if (typeof input === "object" && typeof input.toDate === "function") return input.toDate();
  const d = new Date(input);
  if (!isNaN(d)) return d;
  // dd/MM/yyyy (old seed data)
  const m = String(input).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return null;
};

export const dayLabel = (d) => {
  if (!d) return "Unknown date";
  if (isToday(d)) return `Today · ${format(d, "EEE d MMM")}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, "EEE d MMM")}`;
  return format(d, isSameYear(d, new Date()) ? "EEE d MMM" : "EEE d MMM yyyy");
};

export const shortDate = (d) => {
  if (!d) return "—";
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, isSameYear(d, new Date()) ? "d MMM" : "d MMM yyyy");
};

export const timeLabel = (d) => (d ? format(d, "HH:mm") : "");

export const daysAgo = (d) => {
  if (!d) return "";
  const n = differenceInCalendarDays(new Date(), d);
  if (n <= 0) return "today";
  if (n === 1) return "1 day ago";
  if (n < 60) return `${n} days ago`;
  if (n < 365) return `${Math.floor(n / 30)} months ago`;
  const y = Math.floor(n / 365);
  return y === 1 ? "over a year ago" : `${y} years ago`;
};

/** "3 Sep · 71 days ago", but just "Today" / "Yesterday" when the age adds nothing. */
export const dateWithAge = (d) => {
  if (!d) return "—";
  const n = differenceInCalendarDays(new Date(), d);
  return n <= 1 ? shortDate(d) : `${shortDate(d)} · ${daysAgo(d)}`;
};

/** Human description: legacy "Transfer → X: note" becomes "Moved to X · note". */
export const describeTxn = (t, fallback = "") => {
  const raw = (t?.description || "").trim();
  const m = raw.match(/^Transfer ([→←]) (.+?)(?::\s*(.*))?$/);
  if (m) {
    const [, dir, other, note] = m;
    return `${dir === "→" ? "Moved to" : "Moved from"} ${other}${note ? ` · ${note}` : ""}`;
  }
  return raw.replace(/^Borrowed:\s*/, "") || fallback;
};

/* ── Transactions ─────────────────────────────────────────────────────────── */
export const isMove = (t) => t?.kind === "move" || /^Transfer [→←]/.test(t?.description || "");
export const isIn = (t) => t?.type === "Deposit";

export const sumParts = (parts) => (parts || []).reduce((a, p) => a + (Number(p?.balance) || 0), 0);
