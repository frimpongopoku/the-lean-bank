"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth/context/AuthContext";
import { useToast } from "@/app/components/ToastProvider";
import { usePots } from "@/app/hooks/contexts/usePots";
import { useTransactions } from "@/app/hooks/contexts/useTransactions";
import { useBorrow } from "@/app/hooks/contexts/useBorrow";
import useUserData from "@/app/hooks/useUserData";
import { updateProfile } from "firebase/auth";
import { auth } from "@/app/auth/utils/firebaseConfig";
import { saveAs } from "file-saver";
import AuthGuard from "@/app/auth/AuthGuard";
import Loading from "@/app/components/Loading";
import AppHeader, { Avatar } from "@/app/components/ui/AppHeader";
import Icon from "@/app/components/ui/Icon";
import { setAmountsHidden, useAmountsHidden } from "@/app/components/ui/money";

const CURRENCY_KEY = "tlb_default_currency";

export default function SettingsView({ userId }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const status = useUserData(user?.uid || userId);
  const { potData } = usePots();
  const { transactions } = useTransactions() || {};
  const { borrows } = useBorrow() || {};
  const hidden = useAmountsHidden();

  const [displayName, setDisplayName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user?.displayName]);

  useEffect(() => {
    try {
      setDefaultCurrency(localStorage.getItem(CURRENCY_KEY) || "");
    } catch {}
  }, []);

  if (status === "loading") return <Loading full />;

  const saveDisplayName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      toast.success("Name updated");
    } catch {
      toast.error("Couldn't update your name");
    } finally {
      setSavingName(false);
    }
  };

  const saveDefaultCurrency = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(CURRENCY_KEY, defaultCurrency.trim().toUpperCase());
    } catch {}
    toast.success(defaultCurrency.trim() ? `New pots start in ${defaultCurrency.trim().toUpperCase()}` : "Default currency cleared");
  };

  const exportAllData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      pots: potData?.pots || [],
      transactions: transactions || [],
      borrows: borrows || [],
    };
    saveAs(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `lean-bank-export-${Date.now()}.json`);
    toast.success("Export downloaded");
  };

  return (
    <AuthGuard>
      <div className="min-h-[100dvh]">
        <AppHeader />
        <main className="max-w-[720px] mx-auto px-4 sm:px-8 pt-7 pb-16 flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
              <Link href="/home" className="text-muted hover:text-ink">Pots</Link>
              <span aria-hidden="true" className="mx-1.5">/</span>
              <span className="text-ink" aria-current="page">Settings</span>
            </nav>
            <h1 className="m-0 text-[28px] font-semibold tracking-[-0.02em]">Settings</h1>
          </div>

          <Section title="Profile">
            <div className="flex items-center gap-4">
              <Avatar user={user} className="w-12 h-12" />
              <div className="min-w-0">
                <p className="m-0 font-medium truncate">{user?.displayName || "—"}</p>
                <p className="m-0 text-muted text-sm [overflow-wrap:anywhere]">{user?.email}</p>
              </div>
            </div>
            <form onSubmit={saveDisplayName} className="flex flex-col gap-1.5">
              <label className="field-label !mb-0" htmlFor="set-name">Display name</label>
              <div className="flex gap-2">
                <input id="set-name" className="field flex-1 min-w-0" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} placeholder="Your name" autoComplete="name" />
                <button type="submit" className="btn-ghost !h-11" disabled={savingName || !displayName.trim() || displayName.trim() === user?.displayName}>
                  {savingName ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </Section>

          <Section title="Preferences">
            <form onSubmit={saveDefaultCurrency} className="flex flex-col gap-1.5">
              <label className="field-label !mb-0" htmlFor="set-cur">Default currency</label>
              <div className="flex gap-2">
                <input
                  id="set-cur"
                  className="field !w-28 uppercase"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
                  maxLength={3}
                  placeholder="GHS"
                  autoCapitalize="characters"
                  autoComplete="off"
                />
                <button type="submit" className="btn-ghost !h-11">Save</button>
              </div>
              <p className="m-0 text-[13px] text-muted">Filled in for you when you create a pot.</p>
            </form>
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-line">
              <div>
                <p className="m-0 font-medium">Hide amounts</p>
                <p className="m-0 text-[13px] text-muted">Show dots instead of numbers on this device. Toggle anytime from the top bar.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hidden}
                aria-label="Hide amounts"
                onClick={() => setAmountsHidden(!hidden)}
                className={`relative w-11 h-[26px] rounded-full flex-none transition-colors duration-150 ${hidden ? "bg-mint" : "bg-line-strong"}`}
              >
                <span
                  className="absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-ink shadow transition-transform duration-200 ease-out"
                  style={{ transform: hidden ? "translateX(18px)" : "translateX(0)" }}
                />
              </button>
            </div>
          </Section>

          <Section title="Your data">
            <p className="m-0 text-muted text-sm">Download everything (pots, envelopes, activity and loans) as one JSON file.</p>
            <div>
              <button type="button" onClick={exportAllData} className="btn-ghost">
                <Icon name="download" />
                Export all data
              </button>
            </div>
          </Section>

          <Section title="Account">
            <div>
              <button type="button" onClick={logout} className="btn-ghost text-danger">
                <Icon name="logout" />
                Sign out
              </button>
            </div>
          </Section>
        </main>
      </div>
    </AuthGuard>
  );
}

function Section({ title, children }) {
  return (
    <section className="card p-5 sm:p-6 flex flex-col gap-4" aria-label={title}>
      <h2 className="m-0 text-[13px] font-medium text-muted">{title}</h2>
      {children}
    </section>
  );
}
