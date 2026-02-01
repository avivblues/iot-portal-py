import { BellRing, Cpu, LayoutDashboard, Workflow } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";

import { useTheme } from "../context/ThemeContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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

const SIDEBAR_STATE_KEY = "ui.sidebar";

const AppShell = ({ title, subtitle, userName, onLogout, activeRoute = "overview", children }: AppShellProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const { mode, accent, setMode, setAccent } = useTheme();
  const currentNav = activeRoute;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY) as "expanded" | "collapsed" | null;
    if (stored) {
      setSidebarState(stored);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, sidebarState);
    } catch {
      /* noop */
    }
  }, [sidebarState]);

  const toggleSidebarState = useCallback(() => {
    setSidebarState((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "[" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setMobileSidebarOpen((prev) => !prev);
        } else {
          toggleSidebarState();
        }
      }
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleSidebarState]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-scrim backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        items={navItems}
        activeRoute={currentNav}
        state={sidebarState}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={sidebarState === "collapsed" ? "lg:pl-24" : "lg:pl-72"}>
        <Topbar
          title={title}
          subtitle={subtitle}
          userName={userName}
          onLogout={onLogout}
          accent={accent}
          mode={mode}
          onAccentChange={setAccent}
          onModeChange={setMode}
          onSidebarToggle={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              setMobileSidebarOpen((prev) => !prev);
            } else {
              toggleSidebarState();
            }
          }}
          sidebarState={sidebarState}
        />
        <main className="px-4 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
