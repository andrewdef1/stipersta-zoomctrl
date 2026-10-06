"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Calendar,
  LayoutTemplate,
  Users,
  UserCheck,
  Video,
  Presentation,
  UserCog,
  BarChart3,
  ScrollText,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroup {
  label: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
  }>;
}

const navGroups: NavGroup[] = [
  {
    label: "UTAMA",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "MEETINGS",
    items: [
      {
        href: "/meetings",
        label: "Semua Rapat",
        icon: CalendarDays,
        exact: true,
      },
      {
        href: "/meetings/new",
        label: "Jadwalkan Rapat",
        icon: PlusCircle,
        exact: true,
      },
      {
        href: "/calendar",
        label: "Kalender",
        icon: Calendar,
        exact: true,
      },
      {
        href: "/templates",
        label: "Template Rapat",
        icon: LayoutTemplate,
        exact: false,
      },
    ],
  },
  {
    label: "MANAJEMEN",
    items: [
      {
        href: "/participants",
        label: "Peserta Rapat",
        icon: Users,
        exact: true,
      },
      {
        href: "/attendance",
        label: "Presensi / Kehadiran",
        icon: UserCheck,
        exact: true,
      },
      {
        href: "/recordings",
        label: "Rekaman Cloud",
        icon: Video,
        exact: true,
      },
      {
        href: "/webinars",
        label: "Webinar",
        icon: Presentation,
        exact: true,
      },
      {
        href: "/users",
        label: "Pengguna Zoom",
        icon: UserCog,
        exact: true,
      },
    ],
  },
  {
    label: "LAPORAN & LOG",
    items: [
      {
        href: "/reports",
        label: "Laporan & Statistik",
        icon: BarChart3,
        exact: true,
      },
      {
        href: "/activity-logs",
        label: "Activity Logs",
        icon: ScrollText,
        exact: true,
      },
    ],
  },
  {
    label: "SISTEM",
    items: [
      {
        href: "/settings",
        label: "Pengaturan & Akun",
        icon: Settings,
        exact: true,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-64 flex-col glass border-r border-white/5 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
          <Video className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white tracking-tight">
              ZOOM-STA
            </span>
            <span className="flex items-center gap-0.5 rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
              <Sparkles className="h-2.5 w-2.5" />
              STIPER
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight">
            Santo Thomas Aquinas Jayapura
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 p-3 pt-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
                    active
                      ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 shadow-sm border border-blue-500/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {active && (
                    <ChevronRight className="h-3 w-3 text-blue-500 opacity-70" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Account status */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <Link
          href="/settings"
          className="block rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/10 p-3 hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-blue-400">
              Host Zoom STIPER
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
            stipersta@gmail.com
          </p>
          <p className="text-[9px] text-zinc-500 mt-1">WIT (UTC+9) · Jayapura</p>
        </Link>
      </div>
    </aside>
  );
}
