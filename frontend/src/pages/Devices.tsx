import { Loader2, Plus, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiGet, apiPost } from "../api/client";
import type { DeviceListResponse, DeviceResponse } from "../api/types";
import AppShell from "../components/AppShell";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

type FormState = {
  name: string;
  location: string;
};

const statusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success" as const;
    case "maintenance":
      return "warning" as const;
    default:
      return "info" as const;
  }
};

const formatRelative = (value?: string | null) => {
  if (!value) return "Never";
  const delta = Date.now() - new Date(value).getTime();
  if (Number.isNaN(delta)) return "Never";
  if (delta < 60_000) return "Just now";
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`;
  return `${Math.floor(delta / 86_400_000)}d ago`;
};

const parseError = (err: unknown) => {
  if (typeof err === "string") return err;
  const body = (err as { body?: string })?.body;
  if (body) return body;
  return (err as Error)?.message ?? "Unexpected error";
};

const Devices = () => {
  const { user, logout } = useAuth();
  const operatorName = user?.full_name || user?.email;
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ name: "", location: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data } = await apiGet<DeviceListResponse>("/devices");
      setDevices(data.items);
      setError(null);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDevices();
  }, []);

  useEffect(() => {
    if (!flash) return undefined;
    const timeout = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [flash]);

  const deviceCount = useMemo(() => devices.length, [devices]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!formState.name.trim()) {
      setFormError("Name is required");
      return;
    }
    try {
      setCreating(true);
      await apiPost<DeviceResponse>("/devices", {
        name: formState.name.trim(),
        location: formState.location.trim() || undefined
      });
      setFlash({ type: "success", message: "Device created" });
      setModalOpen(false);
      setFormState({ name: "", location: "" });
      await fetchDevices();
    } catch (err) {
      const message = parseError(err);
      setFormError(message);
      setFlash({ type: "error", message });
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell
      title="Devices"
      subtitle="Provision hardware and track status"
      userName={operatorName}
      onLogout={logout}
      activeRoute="devices"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{deviceCount} registered devices</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchDevices} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add device
            </Button>
          </div>
        </div>

        {flash && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              flash.type === "success"
                ? "border-success/40 bg-success/10 text-success"
                : "border-danger/40 bg-danger/10 text-danger"
            }`}
          >
            {flash.message}
          </div>
        )}

        {error && <ErrorState description={error} onAction={fetchDevices} />}

        {loading && (
          <div className="flex items-center gap-3 rounded-3xl border border-border/60 bg-card/70 p-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading devices...
          </div>
        )}

        {!loading && devices.length === 0 && !error && (
          <div className="rounded-3xl border border-dashed border-border/60 bg-background/60 p-10 text-center">
            <p className="text-lg font-semibold text-card-foreground">No devices yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Use the button above to register a gateway or sensor.</p>
          </div>
        )}

        {devices.length > 0 && (
          <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card/80 shadow-soft">
            <table className="min-w-full divide-y divide-border/60 text-sm">
              <thead className="bg-background/70 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last seen</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-card-foreground">{device.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{device.device_key.slice(0, 12)}...</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{device.location || "-"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={device.status} variant={statusVariant(device.status)} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatRelative(device.last_seen_at)}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="subtle" size="sm">
                        <Link to={`/devices/${device.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/90 p-6 text-card-foreground shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Add device</h3>
                <p className="text-sm text-muted-foreground">Name and location are all you need for now.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="device-name">Name</Label>
                <Input
                  id="device-name"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Gateway East 041"
                  required
                />
              </div>
              <div>
                <Label htmlFor="device-location">Location (optional)</Label>
                <Input
                  id="device-location"
                  value={formState.location}
                  onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="Surabaya Rack A1"
                />
              </div>
              {formError && <p className="text-sm text-danger">{formError}</p>}
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create device
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Devices;
