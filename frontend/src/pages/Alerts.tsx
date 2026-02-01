import { AlertTriangle, BellRing, Filter, Loader2, Siren, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "../api/client";
import { AlertListResponse, AlertResponse, AlertStatus } from "../api/types";
import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card";
import ErrorState from "../components/ErrorState";
import MetricCard from "../components/MetricCard";
import Skeleton from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { metricLookup } from "../data/metrics";

type StatusFilter = AlertStatus | "all";

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Acked", value: "acked" },
  { label: "Resolved", value: "resolved" }
];

const statusBadgeVariant: Record<AlertStatus, "danger" | "warning" | "success"> = {
  open: "danger",
  acked: "warning",
  resolved: "success"
};

const severityVariant: Record<string, "danger" | "warning"> = {
  critical: "danger",
  warning: "warning"
};

const formatRelativeTime = (iso: string) => {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "unknown";
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const Alerts = () => {
  const { user, logout } = useAuth();
  const operatorName = user?.full_name || user?.email;
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [summary, setSummary] = useState<AlertListResponse["summary"] | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setError(null);
    try {
      const target = statusFilter === "all" ? "/alerts" : `/alerts?status=${statusFilter}`;
      const { data } = await apiGet<AlertListResponse>(target);
      setAlerts(data.items);
      setSummary(data.summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load alerts";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAlerts();
    const id = window.setInterval(fetchAlerts, 15000);
    return () => window.clearInterval(id);
  }, [fetchAlerts]);

  const metrics = useMemo(() => {
    return [
      {
        label: "Open alerts",
        value: summary ? summary.open : "—",
        change: summary ? `${summary.acked} acked` : "Syncing…",
        trend: summary && summary.open === 0 ? "neutral" : "up",
        icon: <BellRing className="h-4 w-4" />
      },
      {
        label: "Critical queue",
        value: summary ? summary.critical_active : "—",
        change: summary && summary.critical_active > 0 ? "Needs action" : "Clear",
        trend: summary && summary.critical_active > 0 ? "down" : "neutral",
        icon: <Siren className="h-4 w-4" />
      },
      {
        label: "Resolved",
        value: summary ? summary.resolved : "—",
        change: summary ? `${summary.resolved} total` : "Syncing…",
        trend: "neutral" as const,
        icon: <Target className="h-4 w-4" />
      }
    ];
  }, [summary]);

  const handleAction = async (alertId: string, action: "ack" | "resolve") => {
    setActionTarget(`${alertId}:${action}`);
    try {
      await apiPost(`/alerts/${alertId}/${action}`);
      await fetchAlerts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      setError(message);
    } finally {
      setActionTarget(null);
    }
  };

  const renderAlertCard = (alert: AlertResponse) => {
    const metric = metricLookup[alert.metric_key];
    const metricLabel = metric?.label || alert.metric_key;
    const unit = metric?.unit ?? "";
    const value = alert.value !== undefined && alert.value !== null ? `${alert.value.toFixed(2)}${unit}` : "n/a";
    const rangeMin = alert.threshold_min !== null && alert.threshold_min !== undefined ? `${alert.threshold_min.toFixed(2)}${unit}` : undefined;
    const rangeMax = alert.threshold_max !== null && alert.threshold_max !== undefined ? `${alert.threshold_max.toFixed(2)}${unit}` : undefined;
    const rangeLabel = rangeMin && rangeMax ? `${rangeMin} - ${rangeMax}` : rangeMin || rangeMax;
    const severityChip = severityVariant[alert.severity] || "warning";
    const statusChip = statusBadgeVariant[alert.status];
    const canAck = alert.status === "open";
    const canResolve = alert.status !== "resolved";
    const relative = formatRelativeTime(alert.created_at);
    const actionKeyAck = `${alert.id}:ack`;
    const actionKeyResolve = `${alert.id}:resolve`;

    return (
      <div key={alert.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-card-foreground">
              {metricLabel}
              <span className="text-muted-foreground"> · {alert.device_name}</span>
            </p>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge label={alert.severity} variant={severityChip} />
            <StatusBadge label={alert.status} variant={statusChip} />
          </div>
        </div>
        <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground/70">Current value</span>
            <span className="text-sm text-card-foreground">{value}</span>
            {rangeLabel && <span className="text-muted-foreground">Range {rangeLabel}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground/70">Metadata</span>
            <span>Raised {relative}</span>
            <span>{alert.device_location || "Unknown location"}</span>
          </div>
        </div>
        {canAck || canResolve ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {canAck && (
              <Button
                variant="subtle"
                size="sm"
                disabled={actionTarget === actionKeyAck}
                onClick={() => handleAction(alert.id, "ack")}
              >
                {actionTarget === actionKeyAck ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                Acknowledge
              </Button>
            )}
            {canResolve && (
              <Button
                variant="primary"
                size="sm"
                disabled={actionTarget === actionKeyResolve}
                onClick={() => handleAction(alert.id, "resolve")}
              >
                {actionTarget === actionKeyResolve ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                Resolve
              </Button>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AppShell
      title="Alerts"
      subtitle="Live feed of threshold breaches across the fleet"
      userName={operatorName}
      onLogout={logout}
      activeRoute="alerts"
    >
      <div className="flex flex-col gap-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alert queue</CardTitle>
                  <CardDescription>Evaluated continuously from the telemetry worker</CardDescription>
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
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setStatusFilter(filter.value);
                    }}
                    className={`rounded-full border px-3 py-1 transition ${
                      statusFilter === filter.value
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && <Skeleton className="h-32 w-full" />}
              {!loading && error && <ErrorState description={error} onAction={fetchAlerts} />}
              {!loading && !error && alerts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-center text-sm text-muted-foreground">
                  <p className="font-semibold text-card-foreground">No alerts in this bucket</p>
                  <p className="mt-2">Tune thresholds or wait for new telemetry to trigger evaluations.</p>
                </div>
              )}
              {!loading && !error && alerts.map((alert) => renderAlertCard(alert))}
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
