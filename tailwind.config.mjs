/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060d1f",
        surface: "rgba(255,255,255,0.05)",
        "surface-hover": "rgba(255,255,255,0.08)",
        "lb-border": "rgba(255,255,255,0.08)",
        brand: {
          emerald: "#10b981",
          "emerald-light": "#34d399",
          cyan: "#22d3ee",
          "cyan-light": "#67e8f9",
          rose: "#f43f5e",
          "rose-light": "#fb7185",
          amber: "#f59e0b",
          "amber-light": "#fcd34d",
          violet: "#a78bfa",
          "violet-light": "#c4b5fd",
        },
        text: {
          primary: "rgba(255,255,255,0.92)",
          muted: "rgba(255,255,255,0.5)",
          faint: "rgba(255,255,255,0.28)",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      backdropBlur: {
        xs: "2px",
        sm: "8px",
        DEFAULT: "12px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)",
        "glow-emerald": "0 0 28px rgba(16,185,129,0.35)",
        "glow-rose": "0 0 28px rgba(244,63,94,0.35)",
        "glow-cyan": "0 0 28px rgba(34,211,238,0.28)",
        "glow-amber": "0 0 28px rgba(245,158,11,0.32)",
        "glow-violet": "0 0 28px rgba(167,139,250,0.28)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
