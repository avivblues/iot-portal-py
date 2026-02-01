import { ReactNode } from "react";

import { cn } from "../lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  userName?: string | null;
  onLogout?: () => void;
  actions?: ReactNode;
  className?: string;
};

const PageHeader = ({ title, subtitle, userName, onLogout, actions, className }: PageHeaderProps) => (
  <div
    className={cn(
      "flex flex-col gap-4 border-b border-border/60 bg-background/80 bg-gradient-hero px-6 py-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between",
      className
    )}
  >
    <div>
      <p className="text-xs uppercase tracking-[0.35em] text-muted">IOT PORTAL</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground lg:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3">
      {actions}
      <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3 text-right">
        <p className="text-sm font-medium text-foreground">{userName ?? ""}</p>
        <p className="text-xs uppercase tracking-wide text-muted">Admin</p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-2xl border border-border/60 bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent-soft"
      >
        Logout
      </button>
    </div>
  </div>
);

export default PageHeader;
