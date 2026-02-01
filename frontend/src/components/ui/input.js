import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../lib/utils";
const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
    return (_jsx("input", { type: type, className: cn("flex h-11 w-full rounded-2xl border border-border bg-card/70 px-4 text-sm text-card-foreground transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", className), ref: ref, ...props }));
});
Input.displayName = "Input";
export { Input };
