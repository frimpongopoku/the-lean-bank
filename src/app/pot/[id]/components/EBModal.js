"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/*
 * useModal() → { Modal, openModal, closeModal }
 * Desktop: centred dialog (scale 0.96 → 1, 220ms ease-out).
 * Phone:   bottom sheet (translateY 100% → 0, iOS drawer curve), drag the
 *          handle down or flick to dismiss.
 * Keyboard-initiated open/close (shortcut, Escape) is instant: no animation
 * on actions people repeat many times a day.
 */

const EXIT_MS = 220;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function createStore() {
  let state = { phase: "closed", content: null, instant: false };
  const listeners = new Set();
  return {
    get: () => state,
    set: (patch) => {
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    sub: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

let openCount = 0;
const lockScroll = () => {
  if (openCount++ === 0) document.documentElement.style.overflow = "hidden";
};
const unlockScroll = () => {
  if (--openCount <= 0) {
    openCount = 0;
    document.documentElement.style.overflow = "";
  }
};

export function useModal() {
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = createStore();
  const store = storeRef.current;

  const openModal = useCallback(
    (content, opts = {}) => store.set({ phase: "open", content, instant: !!opts.instant }),
    [store]
  );

  const closeModal = useCallback(
    (opts) => {
      const s = store.get();
      if (s.phase === "closed") return;
      if (opts && opts.instant === true) {
        store.set({ phase: "closed", content: null });
        return;
      }
      store.set({ phase: "closing", instant: false });
      setTimeout(() => {
        if (store.get().phase === "closing") store.set({ phase: "closed", content: null });
      }, EXIT_MS);
    },
    [store]
  );

  const Modal = useMemo(
    () =>
      function ModalHost({ closeOnOverlayClick = true }) {
        const s = useSyncExternalStore(store.sub, store.get, store.get);
        if (s.phase === "closed" || typeof document === "undefined") return null;
        return createPortal(
          <ModalFrame
            state={s}
            onClose={closeModal}
            closeOnOverlayClick={closeOnOverlayClick}
          />,
          document.body
        );
      },
    [store, closeModal]
  );

  return { Modal, openModal, closeModal };
}

function ModalFrame({ state, onClose, closeOnOverlayClick }) {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const drag = useRef(null);
  const closing = state.phase === "closing";

  // Remember what had focus, lock page scroll, label the dialog by its heading.
  useLayoutEffect(() => {
    returnFocusRef.current = document.activeElement;
    lockScroll();
    const el = dialogRef.current;
    const heading = el?.querySelector("h1, h2");
    if (heading) {
      if (!heading.id) heading.id = `dlg-${Math.random().toString(36).slice(2, 8)}`;
      el.setAttribute("aria-labelledby", heading.id);
    }
    const target =
      el?.querySelector("[data-autofocus]") ||
      el?.querySelector("input:not([type=radio]):not([type=hidden]), select, textarea") ||
      el?.querySelector(FOCUSABLE);
    target?.focus({ preventScroll: true });
    return () => {
      unlockScroll();
      const r = returnFocusRef.current;
      if (r && typeof r.focus === "function" && document.contains(r)) r.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose({ instant: true });
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])].filter(
        (n) => n.offsetParent !== null
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  // Drag-to-dismiss for the bottom sheet (handle only, so content still scrolls).
  const onPointerDown = (e) => {
    if (!window.matchMedia("(max-width: 640px)").matches) return;
    if (drag.current) return; // ignore extra fingers
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, t: performance.now(), dy: 0, id: e.pointerId };
    dialogRef.current.style.transition = "none";
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    let dy = e.clientY - d.y;
    if (dy < 0) dy = -Math.sqrt(-dy) * 2; // friction upwards instead of a hard stop
    d.dy = dy;
    dialogRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    const el = dialogRef.current;
    const velocity = d.dy / Math.max(1, performance.now() - d.t);
    el.style.transition = "";
    if (d.dy > 120 || velocity > 0.11) {
      el.style.transform = "";
      onClose();
    } else {
      el.style.transform = "";
    }
  };

  return (
    <div
      className="overlay"
      data-state={closing ? "closed" : "open"}
      data-instant={state.instant ? "true" : undefined}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) onClose();
      }}
    >
      <div ref={dialogRef} className="dialog" role="dialog" aria-modal="true">
        <div
          className="sheet-handle"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="sheet-grabber" aria-hidden="true" />
        </div>
        {state.content}
      </div>
    </div>
  );
}
