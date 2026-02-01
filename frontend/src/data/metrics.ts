export type MetricDefinition = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
};

export const metricCatalog: MetricDefinition[] = [
  { key: "temp_c", label: "Temperature", unit: "°C", min: -10, max: 80 },
  { key: "humidity_pct", label: "Humidity", unit: "%", min: 0, max: 100 },
  { key: "voltage_v", label: "Voltage", unit: "V", min: 200, max: 250 },
  { key: "current_a", label: "Current", unit: "A", min: 0, max: 10 },
  { key: "power_w", label: "Power", unit: "W", min: 0, max: 1000 }
];

export const metricLookup = metricCatalog.reduce<Record<string, MetricDefinition>>((acc, metric) => {
  acc[metric.key] = metric;
  return acc;
}, {});
