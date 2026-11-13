"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./utils/firebaseConfig";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { initUserCollection } from "./utils/firestore-utils";
import Logo from "../components/ui/Logo";
import Icon from "../components/ui/Icon";
import { partColor } from "../components/ui/money";

const SAMPLE = [
  { name: "Rent", amount: "5,000.00", flex: 5 },
  { name: "Food", amount: "3,000.00", flex: 3 },
  { name: "Savings", amount: "2,000.00", flex: 2 },
  { name: "Giving", amount: "2,000.00", flex: 2 },
];
const SAMPLE_COLORS = [0, 2, 3, 1];

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setError("");
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      await initUserCollection(result.user.uid);
      router.push("/home");
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setError("Sign-in didn't go through. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] flex items-center" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-[1120px] w-full mx-auto px-5 sm:px-8 py-14 sm:py-16 flex flex-wrap gap-14 sm:gap-16 items-center">
        <section className="flex-[1_1_380px] min-w-0 flex flex-col gap-7">
          <Logo size={32} />
          <h1 className="m-0 text-[40px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.035em] max-w-[13ch]">
            Know what every cedi is for.
          </h1>
          <p className="m-0 text-muted text-[17px] max-w-[42ch]">
            Split each account into envelopes, log what goes in and out, and keep track of what you&apos;ve lent from
            yourself.
          </p>
          <div className="flex flex-col gap-3 items-start">
            {user ? (
              <>
                <button type="button" onClick={() => router.push("/home")} className="btn btn-lg bg-ink text-[#0b0c0e] font-semibold hover:bg-white">
                  Continue as {user.displayName?.split(" ")[0] || user.email}
                  <Icon name="chevronRight" />
                </button>
                <span className="text-faint text-[13px]">Signed in with Google.</span>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={signIn}
                  disabled={loading}
                  aria-busy={loading}
                  className="btn btn-lg bg-ink text-[#0b0c0e] font-semibold hover:bg-white min-w-[260px]"
                >
                  {loading ? (
                    <span
                      aria-hidden="true"
                      className="w-4 h-4 rounded-full"
                      style={{ border: "2px solid rgba(11,12,14,0.25)", borderTopColor: "#0b0c0e", animation: "spin 0.6s linear infinite" }}
                    />
                  ) : (
                    <GoogleMark />
                  )}
                  {loading ? "Signing in…" : "Continue with Google"}
                </button>
                <span className="text-faint text-[13px]">First time? Your account is set up as you sign in. There&apos;s no extra step.</span>
              </>
            )}
            {error && (
              <p className="m-0 text-danger text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>

        <section aria-label="Example of a pot" className="flex-[1_1_360px] min-w-0">
          <div className="card !rounded-[20px] p-6 flex flex-col gap-[18px]">
            <div className="flex justify-between text-muted text-[13px]">
              <span>Main account</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="status-dot bg-mint" />
                Balanced
              </span>
            </div>
            <div className="num text-[36px] font-medium leading-none">
              <span className="font-sans text-base text-faint tracking-normal mr-1.5">GHS</span>12,000.00
            </div>
            <div className="flex gap-[2px] h-2.5 rounded-full overflow-hidden" aria-hidden="true">
              {SAMPLE.map((s, i) => (
                <span key={s.name} style={{ flex: s.flex, background: partColor(SAMPLE_COLORS[i]) }} />
              ))}
            </div>
            <ul className="list-none m-0 p-0">
              {SAMPLE.map((s, i) => (
                <li key={s.name} className="flex items-center gap-2.5 py-2.5 border-t border-line">
                  <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: partColor(SAMPLE_COLORS[i]) }} />
                  <span className="flex-1">{s.name}</span>
                  <span className="num">{s.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
