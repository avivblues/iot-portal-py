import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
const trendColors = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-muted-foreground"
};
const MetricCard = ({ label, value, change, trend = "neutral", icon }) => (_jsxs(Card, { className: "relative h-full overflow-hidden bg-card/90", children: [_jsx("span", { className: "pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/10 via-transparent to-transparent" }), _jsxs(CardHeader, { className: "relative flex flex-row items-center justify-between px-5 pt-5", children: [_jsx(CardDescription, { className: "text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground", children: label }), icon && (_jsx("div", { className: "rounded-2xl border border-border/60 bg-background/60 px-2 py-1 text-primary", children: icon }))] }), _jsx(CardContent, { className: "relative px-5 pb-5", children: _jsxs("div", { className: "flex items-end justify-between", children: [_jsx(CardTitle, { className: "text-3xl font-semibold text-card-foreground lg:text-4xl", children: value }), _jsx("p", { className: cn("text-sm font-semibold", trendColors[trend]), children: change })] }) })] }));
export default MetricCard;
