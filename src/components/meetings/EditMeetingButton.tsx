"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { MeetingForm } from "./MeetingForm";
import type { ZoomMeeting } from "@/types/zoom";

interface EditMeetingButtonProps {
  meeting: ZoomMeeting;
}

export function EditMeetingButton({ meeting }: EditMeetingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Edit Rapat
      </button>

      {open && (
        <MeetingForm
          mode="edit"
          existing={meeting}
          asModal
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
