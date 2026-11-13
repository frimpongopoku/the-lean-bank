import { partColor } from "./money";

/*
 * One bar per pot, split by envelope. Unassigned money shows as a neutral
 * hatch; over-assignment as a red hatch sized to the overflow.
 */
export default function AllocationBar({ parts = [], balance = 0, height = 8, className = "" }) {
  const assigned = parts.reduce((a, p) => a + Math.max(0, Number(p.balance) || 0), 0);
  const free = (Number(balance) || 0) - parts.reduce((a, p) => a + (Number(p.balance) || 0), 0);
  const label = parts.length
    ? `Split across ${parts.length} envelope${parts.length === 1 ? "" : "s"}${
        free > 0 ? ", some unassigned" : free < 0 ? ", over-assigned" : ""
      }`
    : "No envelopes yet";

  if (!parts.length || (assigned <= 0 && free <= 0)) {
    return (
      <div
        role="img"
        aria-label={label}
        className={`hatch rounded-full ${className}`}
        style={{ height }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex gap-[2px] rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      {parts.map((p, i) =>
        Number(p.balance) > 0 ? (
          <span key={p.id || i} style={{ flex: `${Number(p.balance)} 1 0`, background: partColor(i), minWidth: 2 }} />
        ) : null
      )}
      {free > 0 && <span className="hatch" style={{ flex: `${free} 1 0`, minWidth: 4 }} />}
      {free < 0 && <span className="hatch-danger" style={{ flex: `${Math.abs(free)} 1 0`, minWidth: 6 }} />}
    </div>
  );
}
