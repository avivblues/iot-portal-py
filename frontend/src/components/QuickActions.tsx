import { BellRing, Cpu, Plus, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "../lib/utils";

const actions = [
  {
    id: "device",
    label: "Add device",
    description: "Register a new gateway or sensor",
    href: "/devices?new=1",
    icon: Cpu
  },
  {
    id: "automation",
    label: "New automation",
    description: "Draft a workflow for downstream actions",
    href: "/automations",
    icon: Workflow
  },
  {
    id: "alerts",
    label: "Review alerts",
    description: "Jump to the live triage queue",
    href: "/alerts",
    icon: BellRing
  }
];

const QuickActions = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const onAction = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition",
          open ? "border-primary/60 text-primary" : "hover:border-primary/40"
        )}
      >
        <Plus className="h-4 w-4" />
        Quick actions
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-3 w-72 rounded-3xl border border-border/70 bg-card/95 p-2 text-left shadow-soft">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.href)}
              className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-background/60"
            >
              <span className="rounded-2xl border border-border/60 bg-background/70 p-2 text-primary">
                <action.icon className="h-4 w-4" />
              </span>
              <span>
                <p className="text-sm font-semibold text-card-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickActions;
