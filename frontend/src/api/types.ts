export type DeviceResponse = {
  id: string;
  tenant_id: string;
  name: string;
  location?: string | null;
  mqtt_topic_base: string;
  telemetry_topic: string;
  device_key: string;
  status: string;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type DeviceListResponse = {
  items: DeviceResponse[];
};

export type TelemetryMetricSample = {
  unit: string;
  value: number | null;
};

export type TelemetryLastResponse = {
  device_id: string;
  timestamp: string | null;
  metrics: Record<string, TelemetryMetricSample>;
};

export type AlertStatus = "open" | "acked" | "resolved";
export type AlertSeverity = "warning" | "critical";

export type AlertResponse = {
  id: string;
  device_id: string;
  device_name: string;
  device_location?: string | null;
  metric_key: string;
  status: AlertStatus;
  severity: AlertSeverity;
  message: string;
  value?: number | null;
  threshold_min?: number | null;
  threshold_max?: number | null;
  created_at: string;
  acked_at?: string | null;
  resolved_at?: string | null;
};

export type AlertSummary = {
  open: number;
  acked: number;
  resolved: number;
  critical_active: number;
};

export type AlertListResponse = {
  items: AlertResponse[];
  summary: AlertSummary;
};

export type DashboardTelemetryPoint = {
  timestamp: string;
  power_w?: number | null;
  current_a?: number | null;
};

export type DashboardAlertPoint = {
  label: string;
  count: number;
};

export type DashboardStatusSlice = {
  label: string;
  value: number;
};

export type DashboardFleetHealth = {
  healthy: number;
  warning: number;
  critical: number;
};

export type DashboardSummaryResponse = {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  active_alerts: number;
  resolved_today: number;
  alerts_trend: DashboardAlertPoint[];
  telemetry_series: DashboardTelemetryPoint[];
  device_status_split: DashboardStatusSlice[];
  fleet_health: DashboardFleetHealth;
};
