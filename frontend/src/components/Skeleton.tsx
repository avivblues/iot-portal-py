import { cn } from "../lib/utils";

type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("animate-pulse rounded-[var(--radius-lg)] bg-surface-highlight/50", className)} />
);

export default Skeleton;
