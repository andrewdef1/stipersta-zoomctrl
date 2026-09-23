import { cn } from "@/lib/utils";

type Status = "upcoming" | "live" | "finished";
type Size = "xs" | "sm" | "md";

interface MeetingStatusBadgeProps {
  status: Status;
  size?: Size;
  className?: string;
}

const statusConfig = {
  live: {
    label: "🔴 Live",
    className: "bg-red-500/15 text-red-400 border border-red-500/20",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/15",
  },
  finished: {
    label: "Selesai",
    className: "bg-zinc-800/80 text-zinc-500 border border-zinc-700/50",
  },
};

const sizeConfig = {
  xs: "text-[10px] px-1.5 py-0.5 rounded-md",
  sm: "text-xs px-2 py-0.5 rounded-lg",
  md: "text-sm px-2.5 py-1 rounded-lg",
};

export function MeetingStatusBadge({
  status,
  size = "sm",
  className,
}: MeetingStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
