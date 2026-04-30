"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const ToastContext = createContext(null);

const STYLES = {
  success: {
    icon: faCircleCheck,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.28)",
  },
  error: {
    icon: faCircleXmark,
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.28)",
  },
  info: {
    icon: faCircleInfo,
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.12)",
    border: "rgba(34,211,238,0.28)",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message, opts = {}) => {
      const id = Math.random().toString(36).slice(2);
      const duration = opts.duration ?? 3500;
      setToasts((prev) => [
        ...prev,
        { id, type, message, undoFn: opts.undo ?? null },
      ]);
      const timer = setTimeout(() => dismiss(id), duration);
      return () => clearTimeout(timer);
    },
    [dismiss]
  );

  const toast = {
    success: (msg, opts) => addToast("success", msg, opts),
    error: (msg, opts) => addToast("error", msg, opts),
    info: (msg, opts) => addToast("info", msg, opts),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col-reverse gap-2 items-center pointer-events-none"
        style={{ minWidth: 300, maxWidth: "90vw" }}
      >
        {toasts.map((t) => {
          const s = STYLES[t.type] || STYLES.info;
          return (
            <div
              key={t.id}
              className="animate-slide-up pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
              }}
            >
              <FontAwesomeIcon
                icon={s.icon}
                style={{ color: s.color }}
                className="flex-shrink-0 text-sm"
              />
              <span className="text-white/85 text-sm flex-1 leading-snug">
                {t.message}
              </span>
              {t.undoFn && (
                <button
                  onClick={() => {
                    t.undoFn();
                    dismiss(t.id);
                  }}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
                  style={{
                    color: s.color,
                    background: `${s.color}20`,
                    border: `1px solid ${s.color}40`,
                  }}
                >
                  Undo
                </button>
              )}
              <button
                onClick={() => dismiss(t.id)}
                className="text-white/30 hover:text-white/65 transition-colors flex-shrink-0 ml-1"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
