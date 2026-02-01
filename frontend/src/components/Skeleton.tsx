import { cn } from "../lib/utils";

type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("animate-pulse rounded-[var(--radius-lg)] bg-card/60", className)} />
);

export default Skeleton;
