import { Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react";

import AccentSelect, { AccentTone } from "./AccentSelect";
import ThemeToggle, { ThemeMode } from "./ThemeToggle";

type TopbarProps = {
  title: string;
  subtitle?: string;
  userName?: string | null;
  onLogout?: () => void;
  accent: AccentTone;
  mode: ThemeMode;
  onAccentChange: (tone: AccentTone) => void;
  onModeChange: (mode: ThemeMode) => void;
  onSidebarToggle: () => void;
  sidebarState: "expanded" | "collapsed";
};

const Topbar = ({ title, subtitle, userName, onLogout, accent, mode, onAccentChange, onModeChange, onSidebarToggle, sidebarState }: TopbarProps) => (
  <header className="sticky top-0 z-30 border-b border-border/60 bg-[rgba(var(--color-background)_/_0.92)] backdrop-blur-2xl">
    <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onSidebarToggle}
          className="inline-flex items-center justify-center rounded-2xl border border-border/70 bg-card/80 p-2 text-muted-foreground transition hover:text-foreground"
          aria-label="Toggle navigation"
        >
          <span className="lg:hidden">
            <Menu className="h-5 w-5" />
          </span>
          <span className="hidden lg:inline">
            {sidebarState === "collapsed" ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </span>
        </button>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">Control Room</p>
          <h1 className="font-display text-2xl font-semibold text-foreground lg:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <AccentSelect value={accent} onChange={onAccentChange} />
          <ThemeToggle mode={mode} onChange={onModeChange} />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            99.99% SLA
          </div>
          <div className="rounded-full border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            Sync &lt; 30s
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Operator</p>
            <p className="font-semibold">{userName ?? ""}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-primary/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition hover:bg-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Topbar;
