import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../lib/utils";
const Skeleton = ({ className }) => (_jsx("div", { className: cn("animate-pulse rounded-[var(--radius-lg)] bg-card/60", className) }));
export default Skeleton;
