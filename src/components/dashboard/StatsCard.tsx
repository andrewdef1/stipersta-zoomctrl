import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: "blue" | "emerald" | "violet" | "amber";
  className?: string;
}

const colorMap = {
  blue: {
    iconBg: "from-blue-500 to-indigo-600",
    iconShadow: "shadow-blue-500/30",
    badge: "bg-blue-500/10 text-blue-400",
    glow: "from-blue-600/5",
  },
  emerald: {
    iconBg: "from-emerald-500 to-teal-600",
    iconShadow: "shadow-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-400",
    glow: "from-emerald-600/5",
  },
  violet: {
    iconBg: "from-violet-500 to-purple-600",
    iconShadow: "shadow-violet-500/30",
    badge: "bg-violet-500/10 text-violet-400",
    glow: "from-violet-600/5",
  },
  amber: {
    iconBg: "from-amber-500 to-orange-600",
    iconShadow: "shadow-amber-500/30",
    badge: "bg-amber-500/10 text-amber-400",
    glow: "from-amber-600/5",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
  className,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl glass p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {/* Subtle glow at top */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent via-white/10",
          colors.glow
        )}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                colors.badge
              )}
            >
              <span>{trend.value > 0 ? "↑" : "↓"}</span>
              <span>
                {Math.abs(trend.value)} {trend.label}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0",
            colors.iconBg,
            colors.iconShadow
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
