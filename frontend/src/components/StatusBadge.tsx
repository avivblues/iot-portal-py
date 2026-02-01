import { cn } from "../lib/utils";

type Variant = "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  label: string;
  variant?: Variant;
};

const variantStyles: Record<Variant, string> = {
  success: "text-success bg-success/15 border-success/40",
  warning: "text-warning bg-warning/15 border-warning/40",
  danger: "text-danger bg-danger/15 border-danger/40",
  info: "text-accent-soft bg-accent-soft/10 border-accent-soft/40"
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
