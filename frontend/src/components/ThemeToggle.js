import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";
const ThemeToggle = ({ mode, onChange }) => {
    const next = mode === "dark" ? "light" : "dark";
    return (_jsxs("button", { type: "button", "aria-pressed": mode === "dark", "aria-label": `Switch to ${next} theme`, className: "inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground", onClick: () => onChange(next), children: [_jsx(Sun, { className: cn("h-4 w-4", mode === "light" ? "text-primary" : "text-muted-foreground/70") }), _jsx(Moon, { className: cn("h-4 w-4", mode === "dark" ? "text-primary" : "text-muted-foreground/70") }), _jsx("span", { className: "hidden lg:inline", children: mode === "dark" ? "Dark" : "Light" })] }));
};
export default ThemeToggle;
