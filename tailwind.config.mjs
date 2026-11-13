/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Touch devices fire sticky :hover on tap; only apply hover where a real pointer exists.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        raised: "var(--raised)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        ink: "var(--text)",
        "ink-2": "var(--text-2)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        mint: "var(--mint)",
        "mint-hover": "var(--mint-hover)",
        amber: "var(--amber)",
        danger: "var(--danger)",
        // Legacy aliases so any untouched markup still lands on the new palette.
        brand: {
          emerald: "var(--mint)",
          cyan: "var(--mint)",
          rose: "var(--danger)",
          amber: "var(--amber)",
          violet: "var(--muted)",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};
