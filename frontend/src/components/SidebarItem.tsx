import { ElementType } from "react";

import { cn } from "../lib/utils";

type SidebarItemProps = {
  icon: ElementType;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
};

const SidebarItem = ({ icon: Icon, label, href, active, badge }: SidebarItemProps) => (
  <a
    href={href}
    className={cn(
      "group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
      active
        ? "border-ring bg-primary/10 text-foreground shadow-[var(--shadow-soft)]"
        : "border-transparent text-muted-foreground hover:border-border hover:bg-card/60 hover:text-foreground"
    )}
  >
    <span className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      {label}
    </span>
    {badge && (
      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{badge}</span>
    )}
  </a>
);

export default SidebarItem;
