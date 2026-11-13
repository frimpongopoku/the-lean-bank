"use client";
import { PREVIEW } from "@/app/auth/utils/firestore-utils";
import { AuthProvider } from "@/app/auth/context/AuthContext";
import { PotsProvider } from "@/app/hooks/contexts/usePots";
import { TransactionProvider } from "@/app/hooks/contexts/useTransactions";
import { BorrowProvider } from "@/app/hooks/contexts/useBorrow";
import { ToastProvider } from "@/app/components/ToastProvider";
import PotHome from "@/app/home/PotHome";
import OnePotView from "@/app/pot/[id]/OnePotView";
import LoginPage from "@/app/auth/LoginPage";
import { FIXTURES, FIRST_POT, USERS } from "./fixtures";

const DATA = [
  ["demo", "Demo"],
  ["worst", "Worst case"],
  ["empty", "Empty"],
  ["one", "One"],
];
const SCREENS = [
  ["home", "Dashboard"],
  ["pot", "Pot"],
  ["login", "Sign in"],
];

export default function PreviewApp({ screen, data, tab }) {
  const key = FIXTURES[data] ? data : "demo";
  PREVIEW.on = true;
  PREVIEW.data = FIXTURES[key];
  const user = USERS[key];

  const href = (patch) => {
    const p = new URLSearchParams({ screen, data: key, ...(tab ? { tab } : {}), ...patch });
    return `/preview?${p}`;
  };

  return (
    <div key={`${screen}-${key}-${tab}`}>
      <ToastProvider>
        <AuthProvider previewUser={screen === "login" ? null : user}>
          <PotsProvider>
            <TransactionProvider>
              <BorrowProvider>
                {screen === "home" && <PotHome />}
                {screen === "pot" &&
                  (FIRST_POT[key] ? (
                    <OnePotView potId={FIRST_POT[key]} userId="preview" initialTab={tab} />
                  ) : (
                    <p style={{ padding: 32 }}>No pot in this dataset.</p>
                  ))}
                {screen === "login" && <LoginPage />}
              </BorrowProvider>
            </TransactionProvider>
          </PotsProvider>
        </AuthProvider>
      </ToastProvider>

      {/* Dev chrome: plain on purpose, not part of the design under test */}
      <div
        style={{
          position: "fixed", left: "50%", bottom: 88, transform: "translateX(-50%)", zIndex: 9999,
          display: "flex", gap: 6, padding: 4, background: "#e5e7eb", borderRadius: 999,
          font: "12px system-ui", color: "#111", boxShadow: "0 2px 8px rgba(0,0,0,.3)", flexWrap: "wrap", justifyContent: "center",
        }}
        data-preview-toolbar
      >
        {SCREENS.map(([id, label]) => (
          <a key={id} href={href({ screen: id })} style={{ padding: "4px 10px", borderRadius: 999, background: screen === id ? "#fff" : "transparent", color: "#111", textDecoration: "none" }}>
            {label}
          </a>
        ))}
        <span style={{ width: 1, background: "#9ca3af", margin: "2px 4px" }} />
        {DATA.map(([id, label]) => (
          <a key={id} href={href({ data: id })} style={{ padding: "4px 10px", borderRadius: 999, background: key === id ? "#fff" : "transparent", color: "#111", textDecoration: "none" }}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
