"use client";

import { useState } from "react";
import type { MeetingWithStatus } from "@/types/zoom";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  ExternalLink,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { formatTime, formatDuration, formatDateTime } from "@/lib/utils";

interface CalendarViewProps {
  meetings: MeetingWithStatus[];
}

export function CalendarView({ meetings }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  function prevPeriod() {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  }

  function nextPeriod() {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  }

  // Days in current month grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  function getMeetingsForDay(day: number) {
    return meetings.filter((m) => {
      const d = new Date(m.start_time);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl glass p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
          >
            Hari Ini
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevPeriod}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-base font-bold text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            {(["month", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all ${
                  viewMode === mode
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mode === "month" ? "Bulan" : "Daftar"}
              </button>
            ))}
          </div>

          <Link
            href="/meetings/new"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            + Jadwal Rapat
          </Link>
        </div>
      </div>

      {/* Month Grid View */}
      {viewMode === "month" && (
        <div className="rounded-2xl glass p-4 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-zinc-500">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Padding empty slots */}
              {paddingDays.map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="min-h-[100px] rounded-xl bg-white/[0.01] border border-white/[0.03] p-1.5 opacity-30"
                />
              ))}

              {/* Month days */}
              {daysArray.map((day) => {
                const dayMeetings = getMeetingsForDay(day);
                const isToday = isCurrentMonth && today.getDate() === day;

                return (
                  <div
                    key={day}
                    className={`min-h-[100px] rounded-xl border p-2 flex flex-col justify-between transition-all ${
                      isToday
                        ? "bg-blue-600/10 border-blue-500/40 shadow-sm shadow-blue-500/10"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? "flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"
                            : "text-zinc-400"
                        }`}
                      >
                        {day}
                      </span>
                      {dayMeetings.length > 0 && (
                        <span className="text-[10px] text-blue-400 font-medium">
                          {dayMeetings.length} rapat
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                      {dayMeetings.map((m) => (
                        <Link
                          key={m.id}
                          href={`/meetings/${m.id}`}
                          className="block rounded-lg bg-blue-500/15 border border-blue-500/20 px-2 py-1 text-[11px] text-blue-300 hover:bg-blue-500/25 transition-colors truncate"
                          title={`${m.topic} (${formatTime(m.start_time)})`}
                        >
                          <span className="font-semibold">{formatTime(m.start_time)}</span>{" "}
                          {m.topic}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="rounded-2xl glass p-6 space-y-3">
          {meetings.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              <CalendarIcon className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
              Tidak ada jadwal rapat untuk periode ini.
            </div>
          ) : (
            meetings.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <Link
                      href={`/meetings/${m.id}`}
                      className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {m.topic}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(m.start_time)} ({formatDuration(m.duration)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${m.id}`}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Detail
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
