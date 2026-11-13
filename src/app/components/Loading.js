import React from "react";
import { LogoMark } from "./ui/Logo";

function Loading({ className, full, ...props }) {
  if (full) return <FullScreenLoader {...props} />;
  return (
    <span
      aria-hidden="true"
      className={`inline-block w-4 h-4 border-2 border-current/20 border-t-current rounded-full ${className || ""}`}
      style={{ animation: "spin 0.6s linear infinite", borderColor: "rgba(255,255,255,0.2)", borderTopColor: "currentColor" }}
    />
  );
}

const FullScreenLoader = ({ message = "Loading…" }) => (
  <div className="flex flex-col items-center justify-center gap-4 min-h-[100dvh]" role="status" aria-live="polite">
    <LogoMark size={40} />
    <span className="inline-flex items-center gap-2 text-muted text-sm">
      <span
        aria-hidden="true"
        className="inline-block w-3.5 h-3.5 rounded-full"
        style={{ border: "2px solid var(--line-strong)", borderTopColor: "var(--mint)", animation: "spin 0.6s linear infinite" }}
      />
      {message}
    </span>
  </div>
);

export default Loading;
