"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import Icon from "./Icon";
import Menu from "./Menu";
import { setAmountsHidden, useAmountsHidden } from "./money";
import { useAuth } from "@/app/auth/context/AuthContext";

const firstGrapheme = (w) => {
  try {
    return new Intl.Segmenter().segment(w)[Symbol.iterator]().next().value?.segment || w[0];
  } catch {
    return Array.from(w)[0];
  }
};

export const initialsOf = (user) => {
  const src = user?.displayName?.trim() || (user?.email || "").split("@")[0] || "?";
  const words = src.split(/[\s._-]+/).filter(Boolean);
  const pick = words.length > 1 ? [words[0], words[words.length - 1]] : words.slice(0, 1);
  return pick.map(firstGrapheme).join("").toUpperCase() || "?";
};

/** Profile photo with an initials fallback when the URL is missing or fails to load. */
export function Avatar({ user, className = "" }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);
  useEffect(() => {
    // An image that failed before hydration never fires onError in React, so check once mounted.
    const img = imgRef.current;
    setFailed(Boolean(img && img.complete && img.naturalWidth === 0));
  }, [user?.photoURL]);
  return (
    <span className={`rounded-full bg-raised text-ink font-semibold inline-flex items-center justify-center overflow-hidden flex-none ${className}`}>
      {user?.photoURL && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        initialsOf(user)
      )}
    </span>
  );
}

export function PrivacyToggle({ compact = false }) {
  const hidden = useAmountsHidden();
  return (
    <button
      type="button"
      onClick={() => setAmountsHidden(!hidden)}
      aria-pressed={hidden}
      className={compact ? "icon-btn w-11 h-11" : "btn-ghost"}
      aria-label={compact ? (hidden ? "Show amounts" : "Hide amounts") : undefined}
      title={hidden ? "Show amounts" : "Hide amounts"}
    >
      <Icon name={hidden ? "eyeOff" : "eye"} size={compact ? 20 : 16} />
      {!compact && <span className="hidden sm:inline">{hidden ? "Show amounts" : "Hide amounts"}</span>}
    </button>
  );
}

export default function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const uid = user?.uid;

  return (
    <header className="border-b border-line" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center gap-4">
        <Link href="/home" className="rounded-lg" aria-label="Lean Bank, all pots">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <PrivacyToggle />
          <Menu
            items={[
              { heading: user?.email || user?.displayName || "Account" },
              { divider: true },
              { label: "Settings", icon: "settings", onSelect: () => router.push(`/settings?c=${uid}`) },
              { label: "Sign out", icon: "logout", tone: "danger", onSelect: logout },
            ]}
          >
            {(p) => (
              <button {...p} type="button" className="icon-btn w-11 h-11 rounded-full" aria-label="Account: settings and sign out">
                <Avatar user={user} className="w-8 h-8 text-[13px]" />
              </button>
            )}
          </Menu>
        </div>
      </div>
    </header>
  );
}
