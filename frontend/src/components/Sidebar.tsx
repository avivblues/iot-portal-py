import { Wifi, X } from "lucide-react";
import { ComponentType } from "react";

import { cn } from "../lib/utils";
import SidebarItem from "./SidebarItem";

export type SidebarMode = "expanded" | "collapsed";

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

type SidebarProps = {
  items: SidebarNavItem[];
  activeRoute?: string;
  state: SidebarMode;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const Sidebar = ({ items, activeRoute, state, mobileOpen, onCloseMobile }: SidebarProps) => {
  const collapsed = state === "collapsed" && !mobileOpen;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-40 flex w-72 flex-col border-r border-border/60 bg-card/80 pb-6 pt-6 shadow-[var(--shadow-soft)] backdrop-blur-2xl transition-transform duration-300",
        collapsed ? "lg:w-24" : "lg:w-72",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
    >
      <div className={cn("flex items-center justify-between px-6", collapsed && "px-4 lg:justify-center")}>
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-border/60 bg-background/60 p-2 text-primary shadow-soft">
            <Wifi className="h-5 w-5" />
          </span>
          {!collapsed && (
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground">IoT Portal</p>
              <p className="text-lg font-semibold text-card-foreground">Command</p>
            </div>
          )}
        </div>
        <button
          type="button"
          className="rounded-full border border-border/70 bg-background/80 p-2 text-muted-foreground transition hover:text-foreground lg:hidden"
          onClick={onCloseMobile}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close navigation</span>
        </button>
      </div>

      <nav className={cn("mt-8 flex-1 space-y-2 px-4", collapsed && "px-2")}>
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            href={item.href}
            label={item.label}
            badge={item.badge}
            active={activeRoute === item.id}
            showLabel={!collapsed}
          />
        ))}
      </nav>

      <div className={cn("mt-auto px-6", collapsed && "px-3")}>
        {collapsed ? (
          <div className="hidden lg:flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-background-muted/30 px-2 py-4 text-[0.65rem] uppercase tracking-[0.35em] text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            Live
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-card-foreground">Edge mesh health</p>
            <p className="mt-1 text-muted-foreground">Synchronizing clusters…</p>
            <div className="mt-3 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-success">
              <span className="h-2 w-2 rounded-full bg-success" />
              Live
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
