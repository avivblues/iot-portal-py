import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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
const ConsumptionDonut = () => (_jsxs(Card, { className: chartCardClass, children: [_jsxs(CardHeader, { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Consumption split" }), _jsx(CardDescription, { children: "Real-time draw by subsystem" })] }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/40", children: ["Live", _jsx(ChevronDown, { className: "h-3.5 w-3.5" })] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "h-64 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: consumptionSplit, innerRadius: 60, outerRadius: 90, paddingAngle: 4, dataKey: "value", stroke: "var(--surface)", children: consumptionSplit.map((entry, index) => (_jsx(Cell, { fill: palette[index % palette.length], className: "transition-opacity hover:opacity-80" }, entry.label))) }), _jsx(Tooltip, { content: _jsx(ConsumptionTooltip, {}) })] }) }) }), _jsx("div", { className: "mt-6 grid grid-cols-2 gap-4 text-sm", children: consumptionSplit.map((slice, index) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: cn("h-2 w-2 rounded-full", swatchClasses[index % swatchClasses.length]) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: slice.label }), _jsxs("p", { className: "font-semibold text-card-foreground", children: [slice.value, "%"] })] })] }, slice.label))) })] })] }));
const ConsumptionTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0)
        return null;
    const current = payload[0];
    return (_jsxs("div", { className: "rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground shadow-soft backdrop-blur", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: current?.payload?.label }), _jsxs("p", { className: "mt-1 font-semibold", children: [current?.value, "% of draw"] })] }));
};
export default ConsumptionDonut;
