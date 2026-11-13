"use client";
import { useLayoutEffect, useRef, useState } from "react";

/* Underline tabs; the indicator slides via transform only. Arrow keys move focus+selection. */
export default function Tabs({ tabs, value, onChange, label = "Views", idPrefix = "tab" }) {
  const listRef = useRef(null);
  const [ind, setInd] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = listRef.current?.querySelector(`[data-tab="${value}"]`);
      if (el) setInd({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [value, tabs.length]);

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === value);
    let next = null;
    if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
    if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === "Home") next = tabs[0];
    if (e.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      onChange(next.id);
      listRef.current?.querySelector(`[data-tab="${next.id}"]`)?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="relative flex gap-7 border-b border-line overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${idPrefix}-${t.id}`}
            aria-controls={`${idPrefix}-panel-${t.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            data-tab={t.id}
            onClick={() => onChange(t.id)}
            className={`relative inline-flex items-center gap-2 h-11 px-0.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
              selected ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.badge}
          </button>
        );
      })}
      {ind && (
        <span
          aria-hidden="true"
          className="tab-indicator"
          style={{ transform: `translateX(${ind.x}px) scaleX(${ind.w})` }}
        />
      )}
    </div>
  );
}
