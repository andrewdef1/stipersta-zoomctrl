"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MeetingForm } from "./MeetingForm";

export function NewMeetingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus className="h-4 w-4" />
        Buat Jadwal Baru
      </button>

      {open && (
        <MeetingForm
          mode="create"
          asModal
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
