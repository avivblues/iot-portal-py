import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../lib/utils";
const accentOptions = [
    { id: "cyan", label: "Cyan", swatchClass: "bg-[var(--accent-cyan)]" },
    { id: "emerald", label: "Emerald", swatchClass: "bg-[var(--accent-emerald)]" },
    { id: "violet", label: "Violet", swatchClass: "bg-[var(--accent-violet)]" }
];
const AccentSelect = ({ value, onChange }) => (_jsx("div", { className: "flex items-center gap-1 rounded-full border border-border bg-card/80 px-2 py-1 text-xs font-semibold", children: accentOptions.map((option) => (_jsxs("button", { type: "button", "aria-pressed": value === option.id, onClick: () => onChange(option.id), className: cn("flex items-center gap-1 rounded-full px-2 py-1 uppercase tracking-wide transition", value === option.id ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground"), children: [_jsx("span", { className: cn("h-2 w-2 rounded-full", option.swatchClass) }), _jsx("span", { className: "hidden sm:inline", children: option.label }), _jsx("span", { className: "sm:hidden", children: option.label.charAt(0) })] }, option.id))) }));
export default AccentSelect;
