import { ChevronDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";

import { alerts7d } from "../../data/demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";

const chartCardClass = "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";

const AlertsBarChart = () => (
  <Card className={chartCardClass}>
    <CardHeader className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <CardTitle>Alerts trend</CardTitle>
        <CardDescription>Escalations raised per day · 7 day window</CardDescription>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40"
      >
        Last 7d
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </CardHeader>
    <CardContent>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={alerts7d} barCategoryGap="20%">
            <CartesianGrid stroke="rgba(var(--color-muted-foreground) / 0.15)" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(var(--color-muted-foreground) / 0.85)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(var(--color-muted-foreground) / 0.85)" }} />
            <Tooltip cursor={{ fill: "rgba(var(--color-primary) / 0.08)" }} content={<AlertsTooltip />} />
            <Bar dataKey="alerts" radius={[10, 10, 4, 4]} fill="rgba(var(--color-primary) / 0.85)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const AlertsTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  const current = payload[0];
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground shadow-soft backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{current?.payload?.day}</p>
      <p className="mt-1 font-semibold">{current?.value} alerts</p>
      <p className="text-xs text-muted-foreground">Auto triaged + manual escalations</p>
    </div>
  );
};

export default AlertsBarChart;
