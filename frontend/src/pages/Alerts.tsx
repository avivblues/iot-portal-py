import { AlertTriangle, BellRing, Filter, Siren, Target } from "lucide-react";

import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const alertMetrics = [
  { label: "Open alerts", value: "7", change: "-3 resolved", trend: "down" as const, icon: <BellRing className="h-4 w-4" /> },
  { label: "MTTA", value: "41s", change: "-5s week", trend: "up" as const, icon: <Target className="h-4 w-4" /> },
  { label: "Critical", value: "2", change: "Holding steady", trend: "neutral" as const, icon: <Siren className="h-4 w-4" /> }
];

const alertFeed = [
  { id: "alert-1", title: "Gateway mesh degraded", severity: "Critical", variant: "danger" as const, detail: "Cluster delta retrying PLC sync", raised: "2m", owner: "Delta SRE" },
  { id: "alert-2", title: "Cold chain drift", severity: "Warning", variant: "warning" as const, detail: "Temp oscillation +0.6°C", raised: "14m", owner: "Gamma Ops" },
  { id: "alert-3", title: "Overcurrent chiller", severity: "Info", variant: "info" as const, detail: "Auto trim applied", raised: "28m", owner: "Energy Ops" }
];

const filters = ["Critical", "Warning", "Maintenance", "Heartbeat"];

const Alerts = () => {
  const { user, logout } = useAuth();
  const operatorName = user?.full_name || user?.email;

  return (
    <AppShell
      title="Alerts"
      subtitle="Single triage surface across automations, gateways, and energy"
      userName={operatorName}
      onLogout={logout}
      activeRoute="alerts"
    >
      <div className="flex flex-col gap-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {alertMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alert queue</CardTitle>
                  <CardDescription>Federated alerts normalized with MITRE tags</CardDescription>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                {filters.map((filter) => (
                  <span key={filter} className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-muted-foreground">
                    {filter}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertFeed.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-card-foreground">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.detail}</p>
                    </div>
                    <StatusBadge label={alert.severity} variant={alert.variant} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>Raised {alert.raised} ago</span>
                    <span>Owner {alert.owner}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/85 backdrop-blur">
            <CardHeader>
              <CardTitle>Runway</CardTitle>
              <CardDescription>What happens when triage completes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Playbook</p>
                <p className="mt-1 text-base font-semibold text-card-foreground">Escalation · Severity 1</p>
                <p className="mt-1">Auto-pages on-call, clamps automations, and mirrors telemetry to cold storage.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Playbook</p>
                <p className="mt-1 text-base font-semibold text-card-foreground">Containment · Severity 2</p>
                <p className="mt-1">Applies policy overrides and schedules follow-up automation reviews.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
};

export default Alerts;
