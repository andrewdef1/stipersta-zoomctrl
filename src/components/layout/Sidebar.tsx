"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  LayoutTemplate,
  History,
  Video,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/meetings",
    label: "Manajemen Rapat",
    icon: CalendarDays,
    exact: false,
  },
  {
    href: "/templates",
    label: "Template Rapat",
    icon: LayoutTemplate,
    exact: false,
  },
  {
    href: "/history",
    label: "Log & Histori",
    icon: History,
    exact: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-64 flex-col glass border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
          <Video className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white tracking-tight">
              Zoom-STA
            </span>
            <span className="flex items-center gap-0.5 rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
              <Sparkles className="h-2.5 w-2.5" />
              Pro
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight">
            STIPER STA Control
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && (
                <ChevronRight className="h-3.5 w-3.5 text-blue-500 opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/10 p-3">
          <p className="text-[11px] font-semibold text-blue-400 mb-0.5">
            Host Account
          </p>
          <p className="text-[11px] text-zinc-400 truncate">
            stipersta@gmail.com
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">
              Server Connected
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
