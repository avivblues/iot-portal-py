import { Moon, Sun } from "lucide-react";

import { cn } from "../lib/utils";

export type ThemeMode = "light" | "dark";

type ThemeToggleProps = {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
};

const ThemeToggle = ({ mode, onChange }: ThemeToggleProps) => {
  const next = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-pressed={mode === "dark"}
      aria-label={`Switch to ${next} theme`}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
      onClick={() => onChange(next)}
    >
      <Sun className={cn("h-4 w-4", mode === "light" ? "text-primary" : "text-muted-foreground/70")} />
      <Moon className={cn("h-4 w-4", mode === "dark" ? "text-primary" : "text-muted-foreground/70")} />
      <span className="hidden lg:inline">{mode === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
};

export default ThemeToggle;
