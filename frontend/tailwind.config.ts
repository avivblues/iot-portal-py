import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./src/**/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        "background-muted": "var(--color-bg-muted)",
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          highlight: "var(--color-surface-highlight)"
        },
        border: "var(--color-border)",
        accent: {
          DEFAULT: "var(--color-accent)",
          soft: "var(--color-accent-soft)",
          neon: "var(--color-accent-neon)"
        },
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        brand: "var(--radius-lg)"
      },
      boxShadow: {
        brand: "0 24px 60px -32px rgba(32, 200, 255, 0.45)",
        outline: "0 0 0 1px rgba(148, 163, 184, 0.45)"
      },
      backgroundImage: {
        "gradient-hero": "radial-gradient(circle at top, rgba(45, 212, 191, 0.12), transparent 55%)"
      }
    }
  },
  plugins: []
};

export default config;
