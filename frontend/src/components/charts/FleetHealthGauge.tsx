import { ChevronDown } from "lucide-react";
import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts";

import { fleetHealth } from "../../data/demo";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";

const chartCardClass = "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";

const breakdown = [
  { label: "Healthy", value: fleetHealth.healthy, fill: "rgba(var(--color-success) / 0.9)", textClass: "text-[rgb(var(--color-success))]" },
  { label: "Warning", value: fleetHealth.warning, fill: "rgba(var(--color-warning) / 0.9)", textClass: "text-[rgb(var(--color-warning))]" },
  { label: "Critical", value: fleetHealth.critical, fill: "rgba(var(--color-danger) / 0.9)", textClass: "text-[rgb(var(--color-danger))]" }
];

const FleetHealthGauge = () => {
  const total = fleetHealth.healthy + fleetHealth.warning + fleetHealth.critical;
  const availability = Math.round((fleetHealth.healthy / total) * 100);

  return (
    <Card className={chartCardClass}>
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>Fleet health</CardTitle>
          <CardDescription>Gateways & automation workers · rolling 1h</CardDescription>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40"
        >
          Now
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 lg:flex-row">
        <div className="h-56 w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={breakdown}
              startAngle={220}
              endAngle={-40}
              innerRadius="40%"
              outerRadius="100%"
            >
              <PolarAngleAxis type="number" domain={[0, Math.max(...breakdown.map((item) => item.value))]} tick={false} />
              <RadialBar cornerRadius={16} minAngle={15} clockWise dataKey="value" background fillOpacity={0.2} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none -mt-32 flex flex-col items-center text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Available</p>
            <p className="text-4xl font-semibold text-card-foreground">{availability}%</p>
            <p className="text-xs text-muted-foreground">{total} devices</p>
          </div>
        </div>
        <div className="grid flex-1 gap-4 text-sm">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="text-xl font-semibold text-card-foreground">{item.value}</p>
              </div>
              <span className={cn("text-xs font-semibold", item.textClass)}>
                {(Math.round((item.value / total) * 1000) / 10).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FleetHealthGauge;
