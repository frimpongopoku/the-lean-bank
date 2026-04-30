"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faUser, faPalette, faDownload,
  faArrowRightFromBracket, faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/context/AuthContext";
import { useToast } from "@/app/components/ToastProvider";
import { usePots } from "@/app/hooks/contexts/usePots";
import { useTransactions } from "@/app/hooks/contexts/useTransactions";
import { useBorrow } from "@/app/hooks/contexts/useBorrow";
import { getUserCollection } from "@/app/auth/utils/firestore-utils";
import { updateProfile } from "firebase/auth";
import { auth } from "@/app/auth/utils/firebaseConfig";
import { saveAs } from "file-saver";
import AuthGuard from "@/app/auth/AuthGuard";
import Loading from "@/app/components/Loading";
import { UNDEFINED } from "@/app/auth/context/AuthContext";

const CURRENCY_KEY = "tlb_default_currency";

export default function SettingsView({ userId }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const toast = useToast();
  const { potData, setPotData } = usePots();
  const { transactions, setTransactions } = useTransactions();
  const { borrows, setBorrows } = useBorrow();

  const [displayName, setDisplayName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user?.displayName]);

  useEffect(() => {
    setDefaultCurrency(localStorage.getItem(CURRENCY_KEY) || "");
  }, []);

  useEffect(() => {
    if (!userId) return;
    getUserCollection(userId).then((data) => {
      if (!data) return;
      const { TRANSACTIONS, POTS, BORROWED } = data;
      setPotData(POTS);
      setTransactions(TRANSACTIONS);
      setBorrows(BORROWED);
    });
  }, [userId]);

  if (potData?.key === UNDEFINED) return <Loading full />;

  const saveDisplayName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      toast.success("Display name updated");
    } catch {
      toast.error("Failed to update display name");
    } finally {
      setSavingName(false);
    }
  };

  const saveDefaultCurrency = () => {
    localStorage.setItem(CURRENCY_KEY, defaultCurrency.trim().toUpperCase());
    toast.success("Default currency saved");
  };

  const exportAllData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      pots: potData?.pots || [],
      transactions: transactions || [],
      borrows: borrows || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    saveAs(blob, `lean-bank-export-${Date.now()}.json`);
    toast.success("Data exported");
  };

  const initials = (user?.displayName || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AuthGuard signout>
      <div className="min-h-screen px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/45 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <section className="glass-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faUser} className="text-brand-cyan text-sm" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Profile</h2>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-brand-emerald flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.12)" }}
              >
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold">{user?.displayName || "—"}</p>
                <p className="text-white/40 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs uppercase tracking-wider font-semibold block">
                Display name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                  placeholder="Your name"
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl text-white/90"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={saveDisplayName}
                  disabled={savingName}
                  className="btn-primary text-sm px-4"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  {savingName ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="glass-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faPalette} className="text-brand-violet text-sm" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Preferences</h2>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs uppercase tracking-wider font-semibold block">
                Default currency
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  maxLength={3}
                  placeholder="e.g. GHS"
                  className="w-28 px-3 py-2.5 text-sm rounded-xl text-white/90 uppercase"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    outline: "none",
                  }}
                />
                <button onClick={saveDefaultCurrency} className="btn-primary text-sm px-4">
                  <FontAwesomeIcon icon={faCheck} />
                  Save
                </button>
              </div>
              <p className="text-white/30 text-xs">
                Pre-fills the currency field when creating a new pot.
              </p>
            </div>
          </section>

          {/* Data */}
          <section className="glass-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faDownload} className="text-brand-amber text-sm" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Data Export</h2>
            </div>
            <p className="text-white/40 text-sm mb-4">
              Download a full JSON snapshot of all your pots, transactions, and borrows.
            </p>
            <button onClick={exportAllData} className="btn-ghost text-sm">
              <FontAwesomeIcon icon={faDownload} className="text-brand-emerald" />
              Export all data
            </button>
          </section>

          {/* Account */}
          <section className="glass-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-brand-rose text-sm" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Account</h2>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-semibold text-brand-rose px-4 py-2.5 rounded-xl transition-all"
              style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.18)" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.16)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.08)"; }}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              Sign out
            </button>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
