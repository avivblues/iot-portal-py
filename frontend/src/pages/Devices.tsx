import { BatteryCharging, Cog, Cpu, RadioTower, Wifi } from "lucide-react";

import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const fleetMetrics = [
  { label: "Gateways online", value: "124", change: "+3 vs day", trend: "up" as const, icon: <RadioTower className="h-4 w-4" /> },
  { label: "Sensor clusters", value: "412", change: "Stable", trend: "neutral" as const, icon: <Cpu className="h-4 w-4" /> },
  { label: "Battery health", value: "92%", change: "-1% week", trend: "down" as const, icon: <BatteryCharging className="h-4 w-4" /> },
  { label: "Firmware rev", value: "v3.8.12", change: "Rollout 68%", trend: "up" as const, icon: <Cog className="h-4 w-4" /> }
];

const deviceRoster = [
  { id: "gw-east-041", name: "Gateway · East 041", status: "Nominal", variant: "success" as const, signal: "-58 dBm", lastSeen: "18s" },
  { id: "cold-chain-12", name: "Cold Chain 12", status: "Observing", variant: "warning" as const, signal: "-72 dBm", lastSeen: "44s" },
  { id: "factory-node-03", name: "Factory Node 03", status: "Degraded", variant: "danger" as const, signal: "-80 dBm", lastSeen: "2m" },
  { id: "solar-grid-17", name: "Solar Grid 17", status: "Nominal", variant: "success" as const, signal: "-61 dBm", lastSeen: "8s" }
];

const maintenanceWindows = [
  { cluster: "Cluster 7", action: "Apply low-power firmware", window: "22:00 - 22:30 UTC", owner: "Delta SRE" },
  { cluster: "Factory mesh", action: "Swap failing transceivers", window: "01:00 - 03:00 UTC", owner: "Gamma Ops" }
];

const Devices = () => {
  const { user, logout } = useAuth();
  const operatorName = user?.full_name || user?.email;

  return (
    <AppShell
      title="Devices overview"
      subtitle="Live inventory of gateways, sensors, and edge workers"
      userName={operatorName}
      onLogout={logout}
      activeRoute="devices"
    >
      <div className="flex flex-col gap-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {fleetMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-border/50 bg-card/85 backdrop-blur">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle>Live fleet</CardTitle>
                  <CardDescription>Edge gateways emitting telemetry every 15s</CardDescription>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-success/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Streaming
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {deviceRoster.map((device) => (
                <div key={device.id} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:-translate-y-0.5">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-card-foreground">{device.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{device.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <StatusBadge label={device.status} variant={device.variant} />
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      {device.signal}
                    </span>
                    <span>Last seen {device.lastSeen} ago</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle>Maintenance windows</CardTitle>
              <CardDescription>Coordinated rollouts across critical assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {maintenanceWindows.map((window) => (
                <div key={window.cluster} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{window.cluster}</p>
                  <p className="mt-2 text-base font-semibold text-card-foreground">{window.action}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Window · {window.window}</p>
                  <p className="text-xs text-muted-foreground">Owner · {window.owner}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
};

export default Devices;
