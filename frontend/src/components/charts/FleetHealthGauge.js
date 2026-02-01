import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Card, { className: chartCardClass, children: [_jsxs(CardHeader, { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Fleet health" }), _jsx(CardDescription, { children: "Gateways & automation workers \u00B7 rolling 1h" })] }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40", children: ["Now", _jsx(ChevronDown, { className: "h-3.5 w-3.5" })] })] }), _jsxs(CardContent, { className: "flex flex-col gap-6 lg:flex-row", children: [_jsxs("div", { className: "h-56 w-full lg:w-1/2", children: [_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadialBarChart, { data: breakdown, startAngle: 220, endAngle: -40, innerRadius: "40%", outerRadius: "100%", children: [_jsx(PolarAngleAxis, { type: "number", domain: [0, Math.max(...breakdown.map((item) => item.value))], tick: false }), _jsx(RadialBar, { cornerRadius: 16, dataKey: "value", background: true, fillOpacity: 0.2 })] }) }), _jsxs("div", { className: "pointer-events-none -mt-32 flex flex-col items-center text-center", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-muted-foreground", children: "Available" }), _jsxs("p", { className: "text-4xl font-semibold text-card-foreground", children: [availability, "%"] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [total, " devices"] })] })] }), _jsx("div", { className: "grid flex-1 gap-4 text-sm", children: breakdown.map((item) => (_jsxs("div", { className: "flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: item.label }), _jsx("p", { className: "text-xl font-semibold text-card-foreground", children: item.value })] }), _jsxs("span", { className: cn("text-xs font-semibold", item.textClass), children: [(Math.round((item.value / total) * 1000) / 10).toFixed(1), "%"] })] }, item.label))) })] })] }));
};
export default FleetHealthGauge;
