"use client";
import { useEffect, useRef } from "react";

/* Single-key shortcut, ignored while typing, with modifiers held, or with a dialog open. */
export default function useShortcut(key, handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (e.key.toLowerCase() !== key) return;
      const t = e.target;
      if (t?.closest?.("input, textarea, select, [contenteditable=true], [role=dialog], [role=menu]")) return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      ref.current(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [key]);
}
