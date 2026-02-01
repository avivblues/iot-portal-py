import { useMemo } from "react";

import { cn } from "../lib/utils";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type TelemetryGaugeProps = {
  label: string;
  unit: string;
  value: number | null | undefined;
  min?: number;
  max?: number;
  highlight?: string;
};

const TelemetryGauge = ({ label, unit, value, min = 0, max = 100, highlight }: TelemetryGaugeProps) => {
  const { progress, displayValue } = useMemo(() => {
    if (typeof value !== "number") {
      return { progress: 0, displayValue: "—" };
    }
    const safeMax = Math.max(max, min + 0.0001);
    const pct = clamp((value - min) / (safeMax - min), 0, 1);
    return { progress: pct, displayValue: value.toFixed(2) };
  }, [value, min, max]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="rounded-3xl border border-border/60 bg-card/70 px-5 py-4 text-card-foreground shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold">
            {displayValue}
            {displayValue !== "—" && <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>}
          </p>
          {highlight && <p className="text-xs text-muted-foreground">{highlight}</p>}
        </div>
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="h-24 w-24" viewBox="0 0 100 100">
            <circle
              className="text-border/30"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className={cn(progress > 0 ? "text-primary" : "text-muted-foreground/40")}
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute text-xs font-semibold text-muted-foreground">{Math.round(progress * 100)}%</div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryGauge;
