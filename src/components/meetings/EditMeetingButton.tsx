"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { MeetingForm } from "./MeetingForm";
import type { ZoomMeeting } from "@/types/zoom";

interface EditMeetingButtonProps {
  meeting: ZoomMeeting;
  size?: "sm" | "md";
}

export function EditMeetingButton({
  meeting,
  size = "md",
}: EditMeetingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          size === "sm"
            ? "flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
            : "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
        }
        title="Edit Rapat"
      >
        <Pencil className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        <span>{size === "sm" ? "Edit" : "Edit Rapat"}</span>
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
