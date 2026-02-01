import { Activity, AlertTriangle, ArrowUpRight, RadioTower, Workflow } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { apiGet, clearAuthToken } from "../api/client";
import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Card";
import ErrorState from "../components/ErrorState";
import MetricCard from "../components/MetricCard";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string | null;
};

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiGet<UserProfile>("/auth/me");
      setUser(data);
    } catch (err) {
      const status = (err as any).status;
      if (status === 401 && typeof window !== "undefined") {
        clearAuthToken();
        window.location.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Unable to load operator context");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = "/login";
  };

  const renderContent = () => {
    if (loading) {
      return <DashboardSkeleton />;
    }

    if (error) {
      return <ErrorState description={error} onAction={fetchProfile} />;
    }

    return (
      <div className="flex flex-col gap-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <Card className="border-accent/20 bg-surface">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle>Live network status</CardTitle>
              <CardDescription>All uplinks sampled every 15 seconds. Packet loss budget: 0.25%.</CardDescription>
            </CardHeader>
            <CardContent>
              {liveNetwork.length === 0 ? (
                <p className="text-sm text-muted">No live events right now. Sensors will appear here when telemetry streams in.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {liveNetwork.map((site) => (
                    <li key={site.id} className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-surface-raised/60 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-base font-semibold text-foreground">{site.name}</p>
                        <p className="text-sm text-muted">{site.detail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge label={site.status} variant={site.variant} />
                        <span className="text-xs text-muted">{site.updated}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-surface-highlight/60">
            <CardHeader>
              <CardTitle>Upcoming maintenance</CardTitle>
              <CardDescription>Change window locked; automations will buffer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted">{maintenancePlan.owner}</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{maintenancePlan.title}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background-muted/40 p-4 text-sm text-muted">
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
    );
  };

  return (
    <AppShell
      title="Operations dashboard"
      subtitle="Unified observability across field devices, gateways, and automations"
      userName={user?.full_name || user?.email}
      onLogout={handleLogout}
      activeRoute="overview"
    >
      {renderContent()}
    </AppShell>
  );
};

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={`metric-${index}`} className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  </div>
);

export default Dashboard;
