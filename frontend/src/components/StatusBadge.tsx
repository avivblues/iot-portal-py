import { cn } from "../lib/utils";

type Variant = "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  label: string;
  variant?: Variant;
};

const variantStyles: Record<Variant, string> = {
  success: "border-success/50 bg-success/15 text-success-foreground",
  warning: "border-warning/50 bg-warning/15 text-warning-foreground",
  danger: "border-danger/50 bg-danger/15 text-danger-foreground",
  info: "border-primary/40 bg-primary/10 text-primary"
};

const StatusBadge = ({ label, variant = "info" }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
      variantStyles[variant]
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {label}
  </span>
);

export default StatusBadge;
