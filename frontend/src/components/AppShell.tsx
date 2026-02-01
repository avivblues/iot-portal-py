import { BellRing, Cpu, LayoutDashboard, Menu, Workflow } from "lucide-react";
import { ReactNode, useState } from "react";

import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";
import AccentSelect from "./AccentSelect";
import PageHeader from "./PageHeader";
import SidebarItem from "./SidebarItem";
import ThemeToggle from "./ThemeToggle";

type AppShellProps = {
  title: string;
  subtitle?: string;
  userName?: string | null;
  onLogout?: () => void;
  activeRoute?: string;
  children: ReactNode;
};

const navItems = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "devices", label: "Devices", href: "/devices", icon: Cpu },
  { id: "automations", label: "Automations", href: "/automations", icon: Workflow },
  { id: "alerts", label: "Alerts", href: "/alerts", icon: BellRing }
];

const AppShell = ({ title, subtitle, userName, onLogout, activeRoute = "overview", children }: AppShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode, accent, setMode, setAccent } = useTheme();
  const currentNav = activeRoute;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-scrim backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 z-40 w-72 border-r border-border bg-card/95 px-6 py-8 shadow-[var(--shadow-soft)] backdrop-blur-2xl transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">IoT Portal</p>
            <p className="text-xl font-semibold text-card-foreground">Command</p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">Live</span>
        </div>
        <nav className="mt-8 flex flex-col gap-2">
          {navItems.map((item) => (
            <SidebarItem key={item.id} {...item} active={currentNav === item.id} />
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-border bg-background-muted/40 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-card-foreground">Edge mesh health</p>
          <p className="mt-1 text-muted-foreground">All clusters synchronized</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-20">
          <PageHeader
            title={title}
            subtitle={subtitle}
            userName={userName}
            onLogout={onLogout}
            actions={
              <div className="flex items-center gap-2">
                <AccentSelect value={accent} onChange={setAccent} />
                <ThemeToggle mode={mode} onChange={setMode} />
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground lg:hidden"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle navigation</span>
                </button>
              </div>
            }
          />
        </div>
        <main className="px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
