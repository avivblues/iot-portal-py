import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { throughput24h } from "../../data/demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
const chartCardClass = "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";
const ThroughputChart = () => {
    const energyGradientId = useId();
    return (_jsxs(Card, { className: chartCardClass, children: [_jsxs(CardHeader, { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Energy / Throughput" }), _jsx(CardDescription, { children: "Last 24 hours across edge + core mesh" })] }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40", children: ["Last 24h", _jsx(ChevronDown, { className: "h-3.5 w-3.5" })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-72 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: throughput24h, margin: { left: 0, right: 12, top: 10, bottom: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: energyGradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "rgb(var(--color-primary))", stopOpacity: 0.35 }), _jsx("stop", { offset: "100%", stopColor: "rgb(var(--color-primary))", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { stroke: "rgba(var(--color-muted-foreground) / 0.15)", vertical: false }), _jsx(XAxis, { dataKey: "timestamp", tickLine: false, axisLine: false, tickMargin: 8, tick: { fill: "rgba(var(--color-muted-foreground) / 0.8)", fontSize: 12 } }), _jsx(YAxis, { yAxisId: "energy", axisLine: false, tickLine: false, tickCount: 5, tick: { fill: "rgba(var(--color-muted-foreground) / 0.8)", fontSize: 12 } }), _jsx(YAxis, { yAxisId: "throughput", hide: true, domain: [0, "dataMax + 1"] }), _jsx(Tooltip, { content: _jsx(ThroughputTooltip, {}), cursor: { stroke: "rgba(var(--color-muted) / 0.3)" } }), _jsx(Area, { yAxisId: "energy", type: "monotone", dataKey: "energy", stroke: "rgb(var(--color-primary))", strokeWidth: 2.4, fill: `url(#${energyGradientId})`, name: "Energy (kWh)" }), _jsx(Line, { yAxisId: "throughput", type: "monotone", dataKey: "throughput", stroke: "rgb(var(--color-accent))", strokeWidth: 2.4, dot: false, name: "Throughput (GB/s)" })] }) }) }) })] }));
};
const ThroughputTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0)
        return null;
    const energyPoint = payload.find((entry) => entry.dataKey === "energy");
    const throughputPoint = payload.find((entry) => entry.dataKey === "throughput");
    return (_jsxs("div", { className: "rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground shadow-soft backdrop-blur", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }), energyPoint && _jsxs("p", { className: "mt-1 font-semibold", children: [energyPoint.value, " kWh"] }), throughputPoint && (_jsxs("p", { className: "text-xs text-muted-foreground", children: [throughputPoint.value, " GB/s peak"] }))] }));
};
export default ThroughputChart;
