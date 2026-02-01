import { cn } from "../lib/utils";

export type AccentTone = "cyan" | "emerald" | "violet";

const accentOptions: Array<{ id: AccentTone; label: string; swatchClass: string }> = [
  { id: "cyan", label: "Cyan", swatchClass: "bg-[var(--accent-cyan)]" },
  { id: "emerald", label: "Emerald", swatchClass: "bg-[var(--accent-emerald)]" },
  { id: "violet", label: "Violet", swatchClass: "bg-[var(--accent-violet)]" }
];

type AccentSelectProps = {
  value: AccentTone;
  onChange: (tone: AccentTone) => void;
};

const AccentSelect = ({ value, onChange }: AccentSelectProps) => (
  <div className="flex items-center gap-1 rounded-full border border-border bg-card/80 px-2 py-1 text-xs font-semibold">
    {accentOptions.map((option) => (
      <button
        key={option.id}
        type="button"
        aria-pressed={value === option.id}
        onClick={() => onChange(option.id)}
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 uppercase tracking-wide transition",
          value === option.id ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span className={cn("h-2 w-2 rounded-full", option.swatchClass)} />
        <span className="hidden sm:inline">{option.label}</span>
        <span className="sm:hidden">{option.label.charAt(0)}</span>
      </button>
    ))}
  </div>
);

export default AccentSelect;
