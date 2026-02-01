import { Activity, AlertTriangle, ArrowUpRight, RadioTower, Workflow } from "lucide-react";

import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Card";
import AlertsBarChart from "../components/charts/AlertsBarChart";
import ConsumptionDonut from "../components/charts/ConsumptionDonut";
import FleetHealthGauge from "../components/charts/FleetHealthGauge";
import ThroughputChart from "../components/charts/ThroughputChart";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const metricCards = [
  { label: "Online devices", value: "248", change: "+18 vs hour", trend: "up" as const, icon: <RadioTower className="h-4 w-4" /> },
  { label: "Active automations", value: "63", change: "+4 launched", trend: "up" as const, icon: <Workflow className="h-4 w-4" /> },
  { label: "Alerts open", value: "7", change: "-3 resolved", trend: "down" as const, icon: <AlertTriangle className="h-4 w-4" /> },
  { label: "Data throughput", value: "4.2 GB/s", change: "+9% baseline", trend: "up" as const, icon: <Activity className="h-4 w-4" /> }
];

const liveNetwork = [
  { id: "gw-west", name: "Gateway West", status: "Nominal", variant: "success" as const, detail: "28ms edge latency", updated: "2m ago" },
  { id: "cold-chain", name: "Cold Chain 04", status: "Observing", variant: "warning" as const, detail: "Temp recovered +0.4°C", updated: "12m ago" },
  { id: "factory-b", name: "Factory B", status: "Degraded", variant: "danger" as const, detail: "Retrying PLC sync", updated: "24m ago" }
];

const maintenancePlan = {
  title: "Firmware rollout • Cluster 7",
  description: "Apply the low-power firmware across 48 gateways. Telemetry buffers will persist for 30 minutes.",
  window: "01 Feb · 22:00 UTC",
  owner: "SRE · Delta Team"
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const operatorName = user?.full_name || user?.email;

  return (
    <AppShell
      title="Operations dashboard"
      subtitle="Unified observability across field devices, gateways, and automations"
      userName={operatorName}
      onLogout={logout}
      activeRoute="overview"
    >
      <div className="flex flex-col gap-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <ThroughputChart />
          <AlertsBarChart />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ConsumptionDonut />
          <FleetHealthGauge />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live network status</CardTitle>
                  <CardDescription>Telemetry cadence 15s · packet loss budget 0.25%</CardDescription>
                </div>
                <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success">
                  Auto-heal
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {liveNetwork.length === 0 ? (
                <p className="text-sm text-muted-foreground">No live events right now. Sensors will appear here when telemetry streams in.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {liveNetwork.map((site) => (
                    <li
                      key={site.id}
                      className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold text-card-foreground">{site.name}</p>
                        <p className="text-sm text-muted-foreground">{site.detail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge label={site.status} variant={site.variant} />
                        <span className="text-xs text-muted-foreground">{site.updated}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/85 backdrop-blur">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming maintenance</CardTitle>
                  <CardDescription>Change window locked; automations will buffer.</CardDescription>
                </div>
                <span className="rounded-full border border-warning/50 bg-warning/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning">
                  Scheduled
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{maintenancePlan.owner}</p>
                <p className="mt-2 text-xl font-semibold text-card-foreground">{maintenancePlan.title}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Window</p>
                <p>{maintenancePlan.window}</p>
                <p className="mt-3 font-semibold text-foreground">Notes</p>
                <p>{maintenancePlan.description}</p>
              </div>
            </CardContent>
            <CardFooter>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent/80 px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent"
              >
                View runbook
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </AppShell>
  );
};

export default Dashboard;
