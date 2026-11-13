"use client";
import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";

/*
 * <Menu label="Options for Food" items={[{ label, icon, onSelect, tone }]}>
 *   {(triggerProps) => <button {...triggerProps}>…</button>}
 * </Menu>
 * Scales from the trigger corner, flips above when there's no room below,
 * arrow keys move between items, Escape returns focus to the trigger.
 * Opened from the keyboard it appears instantly.
 */
export default function Menu({ items, children, align = "end", className = "", onOpenChange }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ up: false, instant: false });
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const id = useId();

  const setOpenState = (v) => {
    setOpen(v);
    onOpenChange && onOpenChange(v);
  };

  const openMenu = (viaKeyboard) => {
    const r = triggerRef.current?.getBoundingClientRect();
    const needed = Math.min(items.length * 42 + 16, 340);
    const up = r ? r.bottom + needed > window.innerHeight - 8 && r.top > needed : false;
    setPlacement({ up, instant: viaKeyboard });
    setOpenState(true);
  };

  const close = (refocus) => {
    setOpenState(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onMenuKey = (e) => {
    const nodes = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const i = nodes.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nodes[(i + 1) % nodes.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nodes[(i - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      nodes[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      nodes[nodes.length - 1]?.focus();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const origin = `${placement.up ? "bottom" : "top"} ${align === "end" ? "right" : "left"}`;

  return (
    <div ref={wrapRef} className={`relative inline-flex ${className}`}>
      {children({
        ref: triggerRef,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? id : undefined,
        onClick: (e) => (open ? close(false) : openMenu(e.detail === 0)),
        onKeyDown: (e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            openMenu(true);
          }
        },
      })}
      {open && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          className="menu"
          data-instant={placement.instant ? "true" : undefined}
          onKeyDown={onMenuKey}
          style={{
            "--menu-origin": origin,
            [align === "end" ? "right" : "left"]: 0,
            ...(placement.up ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }),
          }}
        >
          {items.filter(Boolean).map((item, i) =>
            item.divider ? (
              <div key={`d${i}`} role="separator" className="h-px bg-line my-1 mx-1" />
            ) : item.heading ? (
              <div key={`h${i}`} className="px-2.5 pt-2 pb-1.5 text-xs text-muted truncate max-w-[260px]">
                {item.heading}
              </div>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="menu-item"
                data-tone={item.tone}
                disabled={item.disabled}
                onClick={() => {
                  close(true);
                  item.onSelect && item.onSelect();
                }}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span className="flex-1">{item.label}</span>
                {item.hint && <span className="text-xs text-faint">{item.hint}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
