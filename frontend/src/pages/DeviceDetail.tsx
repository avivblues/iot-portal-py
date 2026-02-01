import { ArrowLeft, Copy, RadioTower, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiGet } from "../api/client";
import type { DeviceResponse, TelemetryLastResponse } from "../api/types";
import AppShell from "../components/AppShell";
import ErrorState from "../components/ErrorState";
import TelemetryGauge from "../components/TelemetryGauge";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { metricCatalog, metricLookup } from "../data/metrics";
import { getApiBaseUrl, getAuthToken } from "../api/client";

const useDeviceId = () => {
  const params = useParams();
  return params.deviceId ?? "";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "never";
  const target = new Date(value).getTime();
  const delta = Date.now() - target;
  if (Number.isNaN(delta)) return "unknown";
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const parseError = (err: unknown) => {
  if (typeof err === "string") return err;
  const body = (err as any)?.body;
  if (body) return body;
  return (err as Error)?.message ?? "Unexpected error";
};

const DeviceDetail = () => {
  const deviceId = useDeviceId();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [device, setDevice] = useState<DeviceResponse | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryLastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<"connecting" | "open" | "error">("connecting");
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const deviceMetrics = useMemo(() => telemetry?.metrics ?? {}, [telemetry]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: deviceData }, { data: telemetryData }] = await Promise.all([
          apiGet<DeviceResponse>(`/devices/${deviceId}`),
          apiGet<TelemetryLastResponse>(`/devices/${deviceId}/telemetry/last`)
        ]);
        setDevice(deviceData);
        setTelemetry(telemetryData);
        setError(null);
      } catch (err) {
        setError(parseError(err));
      } finally {
        setLoading(false);
      }
    };
    if (deviceId) {
      fetchData();
    }
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    const token = getAuthToken();
    if (!token) {
      setStreamStatus("error");
      return;
    }
    const base = getApiBaseUrl();
    const url = new URL(`${base}/stream/devices/${deviceId}`);
    url.searchParams.set("token", token);
    const source = new EventSource(url.toString());
    source.addEventListener("open", () => setStreamStatus("open"));
    source.addEventListener("telemetry", (event) => {
      try {
        const payload = JSON.parse(event.data) as TelemetryLastResponse;
        setTelemetry(payload);
      } catch (err) {
        console.error("Failed to parse telemetry event", err);
      }
    });
    source.onerror = () => setStreamStatus("error");
    return () => {
      source.close();
    };
  }, [deviceId]);

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyHint(`${label} copied`);
      setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint("Clipboard unavailable");
    }
  };

  const refreshTelemetry = async () => {
    try {
      const { data } = await apiGet<TelemetryLastResponse>(`/devices/${deviceId}/telemetry/last`);
      setTelemetry(data);
      setStreamStatus("open");
    } catch (err) {
      setError(parseError(err));
    }
  };

  if (!deviceId) {
    return null;
  }

  return (
    <AppShell
      title="Device detail"
      subtitle="Realtime view anchored to MQTT telemetry"
      userName={user?.full_name || user?.email}
      onLogout={logout}
      activeRoute="devices"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/devices" className="inline-flex items-center gap-1 text-primary">
            <ArrowLeft className="h-4 w-4" /> Devices
          </Link>
          <span>/</span>
          <span className="font-medium text-card-foreground">{device?.name ?? "…"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(0)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reload
          </Button>
          <Button variant="subtle" size="sm" className="text-xs uppercase" disabled>
            Stream {streamStatus}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorState description={error} onAction={() => navigate(0)} />
        </div>
      )}

      {loading && !device && (
        <div className="mt-12 text-center text-muted-foreground">Loading device…</div>
      )}

      {device && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Device</p>
                  <h1 className="mt-2 text-2xl font-semibold">{device.name}</h1>
                  <p className="text-sm text-muted-foreground">{device.location || "Unassigned location"}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-success">
                  <RadioTower className="h-4 w-4" /> MQTT ready
                </div>
              </div>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Telemetry topic</dt>
                  <dd className="mt-2 font-mono text-sm text-card-foreground break-all">{device.telemetry_topic}</dd>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-7 px-2 text-xs"
                    onClick={() => handleCopy(device.telemetry_topic, "Topic")}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy topic
                  </Button>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Device key</dt>
                  <dd className="mt-2 font-mono text-sm text-card-foreground break-all">{device.device_key}</dd>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-7 px-2 text-xs"
                    onClick={() => handleCopy(device.device_key, "Key")}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy key
                  </Button>
                </div>
              </dl>
              {copyHint && <p className="mt-4 text-xs text-muted-foreground">{copyHint}</p>}
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Last seen</p>
              <p className="mt-2 text-3xl font-semibold text-card-foreground">{formatRelativeTime(device.last_seen_at)}</p>
              <p className="text-sm text-muted-foreground">{formatDateTime(device.last_seen_at)}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                Stream status: <span className="font-semibold text-card-foreground">{streamStatus}</span>
              </div>
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Live metrics</h2>
                <p className="text-sm text-muted-foreground">
                  Last update {formatRelativeTime(telemetry?.timestamp)} | {formatDateTime(telemetry?.timestamp)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshTelemetry}>
                <RefreshCw className="mr-2 h-4 w-4" /> Sync once
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metricCatalog.map((metric) => (
                <TelemetryGauge
                  key={metric.key}
                  label={metric.label}
                  unit={metric.unit}
                  value={deviceMetrics[metric.key]?.value ?? null}
                  min={metric.min}
                  max={metric.max}
                  highlight={deviceMetrics[metric.key]?.value != null ? `Updated ${formatRelativeTime(telemetry?.timestamp)}` : undefined}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/60 p-6">
            <h3 className="text-base font-semibold text-card-foreground">MQTT payload</h3>
            <p className="text-sm text-muted-foreground">Publish JSON to match the simulator contract.</p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-border/60 bg-card/80 p-4 text-xs text-card-foreground">
{`mosquitto_pub -h localhost -p 1883 -t ${device.telemetry_topic}
  -m '{
    "ts": "${new Date().toISOString()}",
    "metrics": {
      "temp_c": 25.5,
      "humidity_pct": 45.2,
      "voltage_v": 229.1,
      "current_a": 1.8,
      "power_w": 410.0
    }
  }'`}
            </pre>
          </section>
        </div>
      )}
    </AppShell>
  );
};

export default DeviceDetail;
