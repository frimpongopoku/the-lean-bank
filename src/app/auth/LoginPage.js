"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./utils/firebaseConfig";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "./context/AuthContext";
import {
  faArrowRight,
  faShieldHalved,
  faChartPie,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { initUserCollection } from "./utils/firestore-utils";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      await initUserCollection(result.user.uid);
      router.push("/home");
    } catch (err) {
      setError("Sign-in failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: faWallet, label: "Pots & Partitions", desc: "Organise money into purpose-built envelopes" },
    { icon: faChartPie, label: "Real-time Checksum", desc: "Always know if your allocations balance" },
    { icon: faShieldHalved, label: "Private by Default", desc: "All balances hidden until you reveal them" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      {/* Brand */}
      <div className="text-center mb-12 animate-slide-up">
        <p className="text-xs uppercase tracking-[0.3em] text-white/35 mb-3 font-semibold">
          Personal Finance
        </p>
        <h1
          className="text-5xl sm:text-6xl font-bold mb-3"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #22d3ee 55%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The Lean Bank
        </h1>
        <p className="text-white/45 text-base max-w-xs mx-auto leading-relaxed">
          Allocate, track, and understand your money at a glance.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs text-white/55 font-medium"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <FontAwesomeIcon icon={f.icon} className="text-brand-emerald text-xs" />
            {f.label}
          </div>
        ))}
      </div>

      {/* Auth card */}
      <div
        className="w-full max-w-sm p-8 text-center animate-scale-in"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "24px",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {user ? (
          <>
            <p className="text-white/60 text-sm mb-2">Signed in as</p>
            <p className="text-white font-semibold mb-6">{user.displayName}</p>
            <button
              onClick={() => router.push("/home")}
              className="btn-primary w-full justify-center"
            >
              Go to Dashboard
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </>
        ) : (
          <>
            <p className="text-white/55 text-sm mb-6">Sign in to your account</p>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 font-semibold text-sm py-3 px-5 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.11)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {loading ? "Signing in…" : "Continue with Google"}
            </button>
          </>
        )}
        {error && (
          <p className="text-brand-rose text-sm mt-4">{error}</p>
        )}
      </div>

      <p className="text-white/20 text-xs mt-8 text-center">
        Your data is stored securely and privately.
      </p>
    </div>
  );
}
