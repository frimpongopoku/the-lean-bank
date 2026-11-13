"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./ui/Icon";

const ToastContext = createContext(null);

const TONES = {
  success: { icon: "check", color: "var(--mint)" },
  error: { icon: "alert", color: "var(--danger)" },
  info: { icon: "info", color: "var(--muted)" },
};

const EXIT_MS = 200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const paused = useRef(false);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), EXIT_MS);
    const tm = timers.current.get(id);
    if (tm) clearTimeout(tm.handle);
    timers.current.delete(id);
  }, []);

  const schedule = useCallback(
    (id, ms) => {
      const handle = setTimeout(() => remove(id), ms);
      timers.current.set(id, { handle, start: Date.now(), remaining: ms });
    },
    [remove]
  );

  // Pause every timer while hovered or while the tab is hidden, so a toast
  // with Undo never expires unseen.
  const pauseAll = useCallback(() => {
    if (paused.current) return;
    paused.current = true;
    timers.current.forEach((tm) => {
      clearTimeout(tm.handle);
      tm.remaining -= Date.now() - tm.start;
    });
  }, []);
  const resumeAll = useCallback(() => {
    if (!paused.current) return;
    paused.current = false;
    timers.current.forEach((tm, id) => {
      tm.start = Date.now();
      tm.handle = setTimeout(() => remove(id), Math.max(tm.remaining, 800));
    });
  }, [remove]);

  useEffect(() => {
    const onVis = () => (document.hidden ? pauseAll() : resumeAll());
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pauseAll, resumeAll]);

  const add = useCallback(
    (type, message, opts = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-2), { id, type, message, undoFn: opts.undo ?? null }]);
      schedule(id, opts.duration ?? (opts.undo ? 6000 : 3500));
      return id;
    },
    [schedule]
  );

  const toast = useMemo(
    () => ({
      success: (m, o) => add("success", m, o),
      error: (m, o) => add("error", m, o),
      info: (m, o) => add("info", m, o),
    }),
    [add]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center w-[min(420px,calc(100vw-32px))]"
        style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
        onPointerEnter={pauseAll}
        onPointerLeave={resumeAll}
      >
        {toasts.map((t) => {
          const tone = TONES[t.type] || TONES.info;
          return (
            <div
              key={t.id}
              role="status"
              data-state={t.closing ? "closed" : "open"}
              className="toast w-full flex items-center gap-3 pl-4 pr-2 min-h-[48px] py-1.5 rounded-xl bg-raised border border-line-strong shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            >
              <span style={{ color: tone.color }} className="flex-none">
                <Icon name={tone.icon} size={16} strokeWidth={2.2} />
              </span>
              <span className="text-ink text-sm flex-1 leading-snug py-1.5">{t.message}</span>
              {t.undoFn && (
                <button
                  type="button"
                  onClick={() => {
                    t.undoFn();
                    remove(t.id);
                  }}
                  className="btn-quiet btn-sm text-mint font-semibold"
                >
                  Undo
                </button>
              )}
              <button type="button" onClick={() => remove(t.id)} className="icon-btn w-8 h-8" aria-label="Dismiss">
                <Icon name="x" size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
