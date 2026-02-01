import { ReactNode } from "react";

import { cn } from "../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";

const trendColors = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-muted-foreground"
} as const;

type MetricCardProps = {
  label: string;
  value: string | number;
  change: string;
  trend?: keyof typeof trendColors;
  icon?: ReactNode;
};

const MetricCard = ({ label, value, change, trend = "neutral", icon }: MetricCardProps) => (
  <Card className="relative h-full overflow-hidden bg-card/90">
    <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
    <CardHeader className="relative flex flex-row items-center justify-between px-5 pt-5">
      <CardDescription className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </CardDescription>
      {icon && (
        <div className="rounded-2xl border border-border/60 bg-background/60 px-2 py-1 text-primary">
          {icon}
        </div>
      )}
    </CardHeader>
    <CardContent className="relative px-5 pb-5">
      <div className="flex items-end justify-between">
        <CardTitle className="text-3xl font-semibold text-card-foreground lg:text-4xl">{value}</CardTitle>
        <p className={cn("text-sm font-semibold", trendColors[trend])}>{change}</p>
      </div>
    </CardContent>
  </Card>
);

export default MetricCard;
