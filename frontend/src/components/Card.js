import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../lib/utils";
export const Card = ({ className, ...props }) => (_jsx("div", { className: cn("rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-[var(--shadow-soft)] backdrop-blur-md", className), ...props }));
export const CardHeader = ({ className, ...props }) => (_jsx("div", { className: cn("px-6 pt-6", className), ...props }));
export const CardTitle = ({ className, ...props }) => (_jsx("h3", { className: cn("text-lg font-semibold tracking-tight", className), ...props }));
export const CardDescription = ({ className, ...props }) => (_jsx("p", { className: cn("text-sm text-muted-foreground", className), ...props }));
export const CardContent = ({ className, ...props }) => (_jsx("div", { className: cn("px-6 pb-6", className), ...props }));
export const CardFooter = ({ className, ...props }) => (_jsx("div", { className: cn("px-6 pb-6 pt-2", className), ...props }));
