// The Lean Bank mark: an "L" whose base is an allocation bar split into
// shrinking envelopes. Kept in sync with /public/logo.svg.
export function LogoMark({ size = 28, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#5EE6B0" />
      <g fill="#0B0C0E">
        <rect x="12" y="12" width="11" height="40" rx="2.5" />
        <rect x="12" y="42" width="23" height="10" rx="2.5" />
        <rect x="37.5" y="42" width="9.5" height="10" rx="2" />
        <rect x="49.5" y="42" width="3.5" height="10" rx="1.5" />
      </g>
    </svg>
  );
}

export default function Logo({ size = 28, withWordmark = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-semibold tracking-[-0.01em] text-[15px] text-ink">Lean Bank</span>
      )}
    </span>
  );
}
