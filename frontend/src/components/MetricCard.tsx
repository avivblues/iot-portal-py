import { ReactNode } from "react";

import { cn } from "../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";

const trendColors = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-muted"
} as const;

type MetricCardProps = {
  label: string;
  value: string | number;
  change: string;
  trend?: keyof typeof trendColors;
  icon?: ReactNode;
};

const MetricCard = ({ label, value, change, trend = "neutral", icon }: MetricCardProps) => (
  <Card className="h-full bg-surface-highlight/50">
    <CardHeader className="flex flex-row items-center justify-between px-5 pt-5">
      <CardDescription className="uppercase tracking-[0.2em] text-[0.65rem]">{label}</CardDescription>
      {icon && <div className="rounded-2xl border border-border/40 bg-surface px-2 py-1 text-accent-soft">{icon}</div>}
    </CardHeader>
    <CardContent className="px-5 pb-5">
      <div className="flex items-end justify-between">
        <CardTitle className="text-3xl font-semibold text-foreground lg:text-4xl">{value}</CardTitle>
        <p className={cn("text-sm font-semibold", trendColors[trend])}>{change}</p>
      </div>
    </CardContent>
  </Card>
);

export default MetricCard;
