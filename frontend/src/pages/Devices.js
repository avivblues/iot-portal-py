import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BatteryCharging, Cog, Cpu, RadioTower, Wifi } from "lucide-react";
import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
const fleetMetrics = [
    { label: "Gateways online", value: "124", change: "+3 vs day", trend: "up", icon: _jsx(RadioTower, { className: "h-4 w-4" }) },
    { label: "Sensor clusters", value: "412", change: "Stable", trend: "neutral", icon: _jsx(Cpu, { className: "h-4 w-4" }) },
    { label: "Battery health", value: "92%", change: "-1% week", trend: "down", icon: _jsx(BatteryCharging, { className: "h-4 w-4" }) },
    { label: "Firmware rev", value: "v3.8.12", change: "Rollout 68%", trend: "up", icon: _jsx(Cog, { className: "h-4 w-4" }) }
];
const deviceRoster = [
    { id: "gw-east-041", name: "Gateway · East 041", status: "Nominal", variant: "success", signal: "-58 dBm", lastSeen: "18s" },
    { id: "cold-chain-12", name: "Cold Chain 12", status: "Observing", variant: "warning", signal: "-72 dBm", lastSeen: "44s" },
    { id: "factory-node-03", name: "Factory Node 03", status: "Degraded", variant: "danger", signal: "-80 dBm", lastSeen: "2m" },
    { id: "solar-grid-17", name: "Solar Grid 17", status: "Nominal", variant: "success", signal: "-61 dBm", lastSeen: "8s" }
];
const maintenanceWindows = [
    { cluster: "Cluster 7", action: "Apply low-power firmware", window: "22:00 - 22:30 UTC", owner: "Delta SRE" },
    { cluster: "Factory mesh", action: "Swap failing transceivers", window: "01:00 - 03:00 UTC", owner: "Gamma Ops" }
];
const Devices = () => {
    const { user, logout } = useAuth();
    const operatorName = user?.full_name || user?.email;
    return (_jsx(AppShell, { title: "Devices overview", subtitle: "Live inventory of gateways, sensors, and edge workers", userName: operatorName, onLogout: logout, activeRoute: "devices", children: _jsxs("div", { className: "flex flex-col gap-8", children: [_jsx("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4", children: fleetMetrics.map((metric) => (_jsx(MetricCard, { ...metric }, metric.label))) }), _jsxs("section", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]", children: [_jsxs(Card, { className: "border-border/50 bg-card/85 backdrop-blur", children: [_jsx(CardHeader, { className: "flex flex-col gap-2", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Live fleet" }), _jsx(CardDescription, { children: "Edge gateways emitting telemetry every 15s" })] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-success/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success" }), "Streaming"] })] }) }), _jsx(CardContent, { className: "space-y-3", children: deviceRoster.map((device) => (_jsxs("div", { className: "flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:-translate-y-0.5", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("p", { className: "font-semibold text-card-foreground", children: device.name }), _jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-muted-foreground", children: device.id })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground", children: [_jsx(StatusBadge, { label: device.status, variant: device.variant }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Wifi, { className: "h-4 w-4 text-muted-foreground" }), device.signal] }), _jsxs("span", { children: ["Last seen ", device.lastSeen, " ago"] })] })] }, device.id))) })] }), _jsxs(Card, { className: "border-border/50 bg-card/80", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Maintenance windows" }), _jsx(CardDescription, { children: "Coordinated rollouts across critical assets" })] }), _jsx(CardContent, { className: "space-y-4", children: maintenanceWindows.map((window) => (_jsxs("div", { className: "rounded-2xl border border-border/60 bg-background/70 p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-muted-foreground", children: window.cluster }), _jsx("p", { className: "mt-2 text-base font-semibold text-card-foreground", children: window.action }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: ["Window \u00B7 ", window.window] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Owner \u00B7 ", window.owner] })] }, window.cluster))) })] })] })] }) }));
};
export default Devices;
