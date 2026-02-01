import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../lib/utils";
const SidebarItem = ({ icon: Icon, label, href, active, badge, showLabel = true }) => (_jsxs("a", { href: href, title: label, "aria-label": !showLabel ? label : undefined, className: cn("group flex items-center rounded-2xl border py-3 text-sm font-medium transition-all", showLabel ? "px-4 justify-between" : "px-3 justify-center", active
        ? "border-ring bg-primary/10 text-foreground shadow-[var(--shadow-soft)]"
        : "border-transparent text-muted-foreground hover:border-border hover:bg-card/60 hover:text-foreground"), children: [_jsxs("span", { className: cn("flex items-center gap-3", !showLabel && "justify-center"), children: [_jsx(Icon, { className: "h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" }), showLabel && _jsx("span", { children: label })] }), badge && showLabel && (_jsx("span", { className: "rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary", children: badge }))] }));
export default SidebarItem;
