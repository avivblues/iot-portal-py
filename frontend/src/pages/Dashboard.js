import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, AlertTriangle, ArrowUpRight, RadioTower, Workflow } from "lucide-react";
import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Card";
import AlertsBarChart from "../components/charts/AlertsBarChart";
import ConsumptionDonut from "../components/charts/ConsumptionDonut";
import FleetHealthGauge from "../components/charts/FleetHealthGauge";
import ThroughputChart from "../components/charts/ThroughputChart";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
const metricCards = [
    { label: "Online devices", value: "248", change: "+18 vs hour", trend: "up", icon: _jsx(RadioTower, { className: "h-4 w-4" }) },
    { label: "Active automations", value: "63", change: "+4 launched", trend: "up", icon: _jsx(Workflow, { className: "h-4 w-4" }) },
    { label: "Alerts open", value: "7", change: "-3 resolved", trend: "down", icon: _jsx(AlertTriangle, { className: "h-4 w-4" }) },
    { label: "Data throughput", value: "4.2 GB/s", change: "+9% baseline", trend: "up", icon: _jsx(Activity, { className: "h-4 w-4" }) }
];
const liveNetwork = [
    { id: "gw-west", name: "Gateway West", status: "Nominal", variant: "success", detail: "28ms edge latency", updated: "2m ago" },
    { id: "cold-chain", name: "Cold Chain 04", status: "Observing", variant: "warning", detail: "Temp recovered +0.4°C", updated: "12m ago" },
    { id: "factory-b", name: "Factory B", status: "Degraded", variant: "danger", detail: "Retrying PLC sync", updated: "24m ago" }
];
const maintenancePlan = {
    title: "Firmware rollout • Cluster 7",
    description: "Apply the low-power firmware across 48 gateways. Telemetry buffers will persist for 30 minutes.",
    window: "01 Feb · 22:00 UTC",
    owner: "SRE · Delta Team"
};
const Dashboard = () => {
    const { user, logout } = useAuth();
    const operatorName = user?.full_name || user?.email;
    return (_jsx(AppShell, { title: "Operations dashboard", subtitle: "Unified observability across field devices, gateways, and automations", userName: operatorName, onLogout: logout, activeRoute: "overview", children: _jsxs("div", { className: "flex flex-col gap-8", children: [_jsx("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4", children: metricCards.map((card) => (_jsx(MetricCard, { ...card }, card.label))) }), _jsxs("section", { className: "grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]", children: [_jsx(ThroughputChart, {}), _jsx(AlertsBarChart, {})] }), _jsxs("section", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [_jsx(ConsumptionDonut, {}), _jsx(FleetHealthGauge, {})] }), _jsxs("section", { className: "grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]", children: [_jsxs(Card, { className: "border-border/50 bg-card/80 backdrop-blur", children: [_jsx(CardHeader, { className: "flex flex-col gap-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Live network status" }), _jsx(CardDescription, { children: "Telemetry cadence 15s \u00B7 packet loss budget 0.25%" })] }), _jsx("span", { className: "rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success", children: "Auto-heal" })] }) }), _jsx(CardContent, { children: liveNetwork.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No live events right now. Sensors will appear here when telemetry streams in." })) : (_jsx("ul", { className: "flex flex-col gap-4", children: liveNetwork.map((site) => (_jsxs("li", { className: "flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-base font-semibold text-card-foreground", children: site.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: site.detail })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(StatusBadge, { label: site.status, variant: site.variant }), _jsx("span", { className: "text-xs text-muted-foreground", children: site.updated })] })] }, site.id))) })) })] }), _jsxs(Card, { className: "border-border/50 bg-card/85 backdrop-blur", children: [_jsx(CardHeader, { className: "space-y-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Upcoming maintenance" }), _jsx(CardDescription, { children: "Change window locked; automations will buffer." })] }), _jsx("span", { className: "rounded-full border border-warning/50 bg-warning/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-warning", children: "Scheduled" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm uppercase tracking-[0.3em] text-muted-foreground", children: maintenancePlan.owner }), _jsx("p", { className: "mt-2 text-xl font-semibold text-card-foreground", children: maintenancePlan.title })] }), _jsxs("div", { className: "rounded-2xl border border-border/70 bg-background-muted/40 p-4 text-sm text-muted-foreground", children: [_jsx("p", { className: "font-semibold text-foreground", children: "Window" }), _jsx("p", { children: maintenancePlan.window }), _jsx("p", { className: "mt-3 font-semibold text-foreground", children: "Notes" }), _jsx("p", { children: maintenancePlan.description })] })] }), _jsx(CardFooter, { children: _jsxs("button", { type: "button", className: "inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent/80 px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent", children: ["View runbook", _jsx(ArrowUpRight, { className: "h-4 w-4" })] }) })] })] })] }) }));
};
export default Dashboard;
