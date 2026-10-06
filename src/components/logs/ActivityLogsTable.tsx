"use client";

import { useState } from "react";
import { ScrollText, Search, Shield } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface LogItem {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Props {
  logs: LogItem[];
}

export function ActivityLogsTable({ logs }: Props) {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between gap-3 rounded-2xl glass p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aksi, entitas, email user..."
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <span className="text-xs text-zinc-500">{filtered.length} log tercatat</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-500 font-semibold">
                <th className="px-5 py-3.5">Waktu</th>
                <th className="px-5 py-3.5">Aksi</th>
                <th className="px-5 py-3.5">Entitas</th>
                <th className="px-5 py-3.5">Deskripsi</th>
                <th className="px-5 py-3.5">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    <ScrollText className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
                    Belum ada log aktivitas tercatat.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">{log.entity}</td>
                    <td className="px-5 py-3.5 text-zinc-200 max-w-xs truncate">
                      {log.description || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400 truncate">
                      {log.userEmail || "System"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
