import React from "react";

function Loading({ className, full, ...props }) {
  if (full) return <FullScreenLoader {...props} />;
  return (
    <span
      className={`inline-block w-5 h-5 border-2 border-white/20 border-t-brand-emerald rounded-full animate-spin ${className || ""}`}
    />
  );
}

const FullScreenLoader = ({ message = "Loading, please wait…" }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="glass text-center px-10 py-10 animate-scale-in">
        <div className="w-12 h-12 border-2 border-white/10 border-t-brand-emerald rounded-full animate-spin mx-auto mb-5" />
        <p className="text-text-muted text-sm tracking-wide">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
