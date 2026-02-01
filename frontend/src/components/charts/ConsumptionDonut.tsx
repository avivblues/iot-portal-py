import { ChevronDown } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";

import { consumptionSplit } from "../../data/demo";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";

const palette = [
  "rgba(var(--color-primary) / 0.95)",
  "rgba(var(--color-accent) / 0.9)",
  "rgba(var(--color-success) / 0.85)",
  "rgba(var(--color-warning) / 0.9)",
  "rgba(var(--color-danger) / 0.85)"
];

const swatchClasses = [
  "bg-[rgb(var(--color-primary))]",
  "bg-[rgb(var(--color-accent))]",
  "bg-[rgb(var(--color-success))]",
  "bg-[rgb(var(--color-warning))]",
  "bg-[rgb(var(--color-danger))]"
];

const chartCardClass = "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";

const ConsumptionDonut = () => (
  <Card className={chartCardClass}>
    <CardHeader className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <CardTitle>Consumption split</CardTitle>
        <CardDescription>Real-time draw by subsystem</CardDescription>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40"
      >
        Live
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </CardHeader>
    <CardContent>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={consumptionSplit}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="var(--surface)"
            >
              {consumptionSplit.map((entry, index) => (
                <Cell key={entry.label} fill={palette[index % palette.length]} className="transition-opacity hover:opacity-80" />
              ))}
            </Pie>
            <Tooltip content={<ConsumptionTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        {consumptionSplit.map((slice, index) => (
          <div key={slice.label} className="flex items-center gap-3">
            <span className={cn("h-2 w-2 rounded-full", swatchClasses[index % swatchClasses.length])} />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{slice.label}</p>
              <p className="font-semibold text-card-foreground">{slice.value}%</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ConsumptionTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  const current = payload[0];
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground shadow-soft backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{current?.payload?.label}</p>
      <p className="mt-1 font-semibold">{current?.value}% of draw</p>
    </div>
  );
};

export default ConsumptionDonut;
