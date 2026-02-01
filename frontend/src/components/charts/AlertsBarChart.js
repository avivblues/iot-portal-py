import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { alerts7d } from "../../data/demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
const chartCardClass = "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";
const AlertsBarChart = () => (_jsxs(Card, { className: chartCardClass, children: [_jsxs(CardHeader, { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Alerts trend" }), _jsx(CardDescription, { children: "Escalations raised per day \u00B7 7 day window" })] }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40", children: ["Last 7d", _jsx(ChevronDown, { className: "h-3.5 w-3.5" })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-72 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: alerts7d, barCategoryGap: "20%", children: [_jsx(CartesianGrid, { stroke: "rgba(var(--color-muted-foreground) / 0.15)", vertical: false }), _jsx(XAxis, { dataKey: "day", axisLine: false, tickLine: false, tick: { fill: "rgba(var(--color-muted-foreground) / 0.85)" } }), _jsx(YAxis, { axisLine: false, tickLine: false, tick: { fill: "rgba(var(--color-muted-foreground) / 0.85)" } }), _jsx(Tooltip, { cursor: { fill: "rgba(var(--color-primary) / 0.08)" }, content: _jsx(AlertsTooltip, {}) }), _jsx(Bar, { dataKey: "alerts", radius: [10, 10, 4, 4], fill: "rgba(var(--color-primary) / 0.85)" })] }) }) }) })] }));
const AlertsTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0)
        return null;
    const current = payload[0];
    return (_jsxs("div", { className: "rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground shadow-soft backdrop-blur", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: current?.payload?.day }), _jsxs("p", { className: "mt-1 font-semibold", children: [current?.value, " alerts"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Auto triaged + manual escalations" })] }));
};
export default AlertsBarChart;
