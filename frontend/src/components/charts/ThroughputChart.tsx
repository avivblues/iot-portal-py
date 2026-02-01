import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";

import { throughput24h } from "../../data/demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";

const chartCardClass = "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";

const ThroughputChart = () => {
  const energyGradientId = useId();

  return (
    <Card className={chartCardClass}>
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle>Energy / Throughput</CardTitle>
          <CardDescription>Last 24 hours across edge + core mesh</CardDescription>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40"
        >
          Last 24h
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={throughput24h} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={energyGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(var(--color-muted-foreground) / 0.15)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "rgba(var(--color-muted-foreground) / 0.8)", fontSize: 12 }}
              />
              <YAxis
                yAxisId="energy"
                axisLine={false}
                tickLine={false}
                tickCount={5}
                tick={{ fill: "rgba(var(--color-muted-foreground) / 0.8)", fontSize: 12 }}
              />
              <YAxis yAxisId="throughput" hide domain={[0, "dataMax + 1"]} />
              <Tooltip content={<ThroughputTooltip />} cursor={{ stroke: "rgba(var(--color-muted) / 0.3)" }} />
              <Area
                yAxisId="energy"
                type="monotone"
                dataKey="energy"
                stroke="rgb(var(--color-primary))"
                strokeWidth={2.4}
                fill={`url(#${energyGradientId})`}
                name="Energy (kWh)"
              />
              <Line
                yAxisId="throughput"
                type="monotone"
                dataKey="throughput"
                stroke="rgb(var(--color-accent))"
                strokeWidth={2.4}
                dot={false}
                name="Throughput (GB/s)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const ThroughputTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  const energyPoint = payload.find((entry) => entry.dataKey === "energy");
  const throughputPoint = payload.find((entry) => entry.dataKey === "throughput");

  return (
    <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground shadow-soft backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {energyPoint && <p className="mt-1 font-semibold">{energyPoint.value} kWh</p>}
      {throughputPoint && (
        <p className="text-xs text-muted-foreground">{throughputPoint.value as number} GB/s peak</p>
      )}
    </div>
  );
};

export default ThroughputChart;
