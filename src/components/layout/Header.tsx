"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Dashboard", subtitle }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between px-6 border-b border-white/5 glass shrink-0">
      {/* Title */}
      <div>
        <h1 className="text-base font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-white/5 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-zinc-300 font-medium text-sm hidden sm:block">
              Administrator
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-zinc-500 transition-transform",
                showDropdown && "rotate-180"
              )}
            />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl glass shadow-xl shadow-black/30 border border-white/8 z-20 overflow-hidden py-1">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-xs font-medium text-zinc-200">
                    Administrator
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    stipersta@gmail.com
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
