import { ElementType } from "react";

import { cn } from "../lib/utils";

type SidebarItemProps = {
  icon: ElementType;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  showLabel?: boolean;
};

const SidebarItem = ({ icon: Icon, label, href, active, badge, showLabel = true }: SidebarItemProps) => (
  <a
    href={href}
    title={label}
    aria-label={!showLabel ? label : undefined}
    className={cn(
      "group flex items-center rounded-2xl border py-3 text-sm font-medium transition-all",
      showLabel ? "px-4 justify-between" : "px-3 justify-center",
      active
        ? "border-ring bg-primary/10 text-foreground shadow-[var(--shadow-soft)]"
        : "border-transparent text-muted-foreground hover:border-border hover:bg-card/60 hover:text-foreground"
    )}
  >
    <span className={cn("flex items-center gap-3", !showLabel && "justify-center")}>
      <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      {showLabel && <span>{label}</span>}
    </span>
    {badge && showLabel && (
      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{badge}</span>
    )}
  </a>
);

export default SidebarItem;
