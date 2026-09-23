"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ZoomMeeting } from "@/types/zoom";
import { getMeetingStatus, formatDateTime, formatDuration, truncate } from "@/lib/utils";
import { MeetingStatusBadge } from "./MeetingStatusBadge";
import {
  Search,
  ChevronRight,
  Copy,
  ExternalLink,
  Calendar,
  ChevronLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingTableProps {
  meetings: ZoomMeeting[];
}

type FilterStatus = "all" | "upcoming" | "live" | "finished";

const PAGE_SIZE = 10;

export function MeetingTable({ meetings }: MeetingTableProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      const status = getMeetingStatus(m.start_time, m.duration);
      const matchesStatus =
        filterStatus === "all" || status === filterStatus;
      const matchesSearch =
        !search ||
        m.topic.toLowerCase().includes(search.toLowerCase()) ||
        String(m.id).includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [meetings, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function copyToClipboard(text: string, id: number) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari topik atau Meeting ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-72 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5">
          {(["all", "upcoming", "live", "finished"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                filterStatus === s
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              {s === "all" ? "Semua" : s === "upcoming" ? "Upcoming" : s === "live" ? "Live" : "Selesai"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Topik</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Waktu</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Meeting ID</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Passcode</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Calendar className="mx-auto h-10 w-10 text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-500">Tidak ada rapat ditemukan</p>
                  </td>
                </tr>
              ) : (
                paginated.map((meeting) => {
                  const status = getMeetingStatus(meeting.start_time, meeting.duration);
                  return (
                    <tr
                      key={meeting.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                          {truncate(meeting.topic, 40)}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">
                          {formatDuration(meeting.duration)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-400 whitespace-nowrap">
                        {formatDateTime(meeting.start_time)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => copyToClipboard(String(meeting.id), meeting.id)}
                          className="flex items-center gap-1.5 font-mono text-sm text-zinc-300 hover:text-white transition-colors"
                        >
                          {meeting.id}
                          {copiedId === meeting.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-zinc-400">
                        {meeting.password ?? <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <MeetingStatusBadge status={status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/meetings/${meeting.id}`}
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
                          >
                            Detail
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                          <a
                            href={meeting.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
            <p className="text-xs text-zinc-500">
              {filtered.length} rapat · Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
