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
      "group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition-colors",
      active
        ? "border-accent/40 bg-surface-highlight/80 text-foreground shadow-brand"
        : "text-muted hover:border-accent/30 hover:bg-surface-highlight/30 hover:text-foreground"
    )}
  >
    <span className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted transition-colors group-hover:text-foreground" />
      {label}
    </span>
    {badge && (
      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent-soft">{badge}</span>
    )}
  </a>
);

export default SidebarItem;
