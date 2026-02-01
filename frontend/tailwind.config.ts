import type { Config } from "tailwindcss";

const withOpacity = (variable: string) => {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue) {
      return `rgb(var(${variable}) / ${opacityValue})`;
    }
    return `rgb(var(${variable}) / 1)`;
  };
};

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./src/**/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: withOpacity("--color-background"),
        "background-muted": withOpacity("--color-background-muted"),
        foreground: withOpacity("--color-foreground"),
        card: {
          DEFAULT: withOpacity("--color-card"),
          foreground: withOpacity("--color-card-foreground")
        },
        muted: {
          DEFAULT: withOpacity("--color-muted"),
          foreground: withOpacity("--color-muted-foreground")
        },
        border: withOpacity("--color-border"),
        ring: withOpacity("--color-ring"),
        primary: {
          DEFAULT: withOpacity("--color-primary"),
          foreground: withOpacity("--color-primary-foreground")
        },
        accent: {
          DEFAULT: withOpacity("--color-accent"),
          foreground: withOpacity("--color-accent-foreground")
        },
        success: {
          DEFAULT: withOpacity("--color-success"),
          foreground: withOpacity("--color-success-foreground")
        },
        warning: {
          DEFAULT: withOpacity("--color-warning"),
          foreground: withOpacity("--color-warning-foreground")
        },
        danger: {
          DEFAULT: withOpacity("--color-danger"),
          foreground: withOpacity("--color-danger-foreground")
        },
        scrim: "var(--color-scrim)"
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        brand: "var(--radius-lg)"
      },
      boxShadow: {
        focus: "0 0 0 1px var(--color-ring)",
        soft: "var(--shadow-soft)"
      },
      backgroundImage: {
        "gradient-hero": "radial-gradient(circle at top, rgba(var(--color-primary) / 0.12), transparent 60%)"
      }
    }
  },
  plugins: []
};

export default config;
