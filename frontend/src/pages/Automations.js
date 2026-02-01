import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowRight, Beaker, Clock4, Workflow } from "lucide-react";
import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
const automationMetrics = [
    { label: "Active flows", value: "63", change: "+5 this week", trend: "up", icon: _jsx(Workflow, { className: "h-4 w-4" }) },
    { label: "Jobs / minute", value: "418", change: "+9% load", trend: "up", icon: _jsx(Clock4, { className: "h-4 w-4" }) },
    { label: "Experiments", value: "7", change: "Pilot", trend: "neutral", icon: _jsx(Beaker, { className: "h-4 w-4" }) }
];
const orchestrationPipelines = [
    { id: "cold-chain", title: "Cold chain stabilization", status: "Running", variant: "success", detail: "Holds temp drift < 0.4°C", lastRun: "42s" },
    { id: "energy-trim", title: "Energy trim schedule", status: "Queued", variant: "info", detail: "Staggered chiller overrides", lastRun: "4m" },
    { id: "factory-resume", title: "Factory resume", status: "Paused", variant: "warning", detail: "Awaiting QA sign off", lastRun: "—" }
];
const runbooks = [
    { name: "Batch digest", owner: "Ops · Delta", steps: 8, impact: "Orchestrates remote CIP, restarts PLC, validates sensors" },
    { name: "Grid failover", owner: "Ops · Echo", steps: 12, impact: "Shifts load to backup microgrid and throttles HVAC" }
];
const Automations = () => {
    const { user, logout } = useAuth();
    const operatorName = user?.full_name || user?.email;
    return (_jsx(AppShell, { title: "Automations", subtitle: "Low-latency workflows coordinating devices, energy, and alerts", userName: operatorName, onLogout: logout, activeRoute: "automations", children: _jsxs("div", { className: "flex flex-col gap-8", children: [_jsx("section", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: automationMetrics.map((metric) => (_jsx(MetricCard, { ...metric }, metric.label))) }), _jsxs("section", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]", children: [_jsxs(Card, { className: "border-border/50 bg-card/80", children: [_jsx(CardHeader, { className: "flex flex-col gap-2", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Orchestration pipelines" }), _jsx(CardDescription, { children: "Every run validated through policy guardrails" })] }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: ["Launch new", _jsx(ArrowRight, { className: "h-3.5 w-3.5" })] })] }) }), _jsx(CardContent, { className: "space-y-4", children: orchestrationPipelines.map((pipe) => (_jsxs("div", { className: "rounded-2xl border border-border/60 bg-background/70 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-card-foreground", children: pipe.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: pipe.detail })] }), _jsx(StatusBadge, { label: pipe.status, variant: pipe.variant })] }), _jsxs("p", { className: "mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground", children: ["Last run \u00B7 ", pipe.lastRun] })] }, pipe.id))) })] }), _jsxs(Card, { className: "border-border/50 bg-card/85 backdrop-blur", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Runbooks" }), _jsx(CardDescription, { children: "Codified steps for incident and change workflows" })] }), _jsx(CardContent, { className: "space-y-4", children: runbooks.map((book) => (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/70 p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-muted-foreground", children: book.owner }), _jsx("p", { className: "mt-1 text-base font-semibold text-card-foreground", children: book.name }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: book.impact }), _jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [book.steps, " steps"] })] }, book.name))) })] })] })] }) }));
};
export default Automations;
