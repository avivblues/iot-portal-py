import { jsx as _jsx } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60", {
    variants: {
        variant: {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90",
            subtle: "bg-card/70 text-foreground hover:bg-card",
            outline: "border border-border bg-transparent text-foreground hover:bg-card/60",
            ghost: "text-muted-foreground hover:bg-muted/30"
        },
        size: {
            sm: "px-3 py-1.5",
            md: "px-5 py-2.5",
            lg: "px-6 py-3 text-base"
        }
    },
    defaultVariants: {
        variant: "primary",
        size: "md"
    }
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return _jsx(Comp, { className: cn(buttonVariants({ variant, size }), className), ref: ref, ...props });
});
Button.displayName = "Button";
export { Button, buttonVariants };
