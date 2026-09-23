"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/zoom";
import type { MeetingTemplate } from "@prisma/client";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function getTemplatesAction(): Promise<
  ActionResult<MeetingTemplate[]>
> {
  try {
    await requireAuth();
    const templates = await prisma.meetingTemplate.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    return { success: true, data: templates };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getTemplateAction(
  id: string
): Promise<ActionResult<MeetingTemplate>> {
  try {
    await requireAuth();
    const template = await prisma.meetingTemplate.findUnique({ where: { id } });
    if (!template) return { success: false, error: "Template tidak ditemukan" };
    return { success: true, data: template };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export type TemplateFormData = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  duration?: number;
  timezone?: string;
  passcode?: string;
  waitingRoom?: boolean;
  requireAuth?: boolean;
  hostVideo?: boolean;
  participantVideo?: boolean;
  muteUponEntry?: boolean;
  autoRecording?: string;
  agenda?: string;
  isDefault?: boolean;
};

export async function createTemplateAction(
  data: TemplateFormData
): Promise<ActionResult<MeetingTemplate>> {
  try {
    await requireAuth();
    const template = await prisma.meetingTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon ?? "video",
        color: data.color ?? "blue",
        duration: data.duration ?? 60,
        timezone: data.timezone ?? "Asia/Jayapura",
        passcode: data.passcode,
        waitingRoom: data.waitingRoom ?? true,
        requireAuth: data.requireAuth ?? false,
        hostVideo: data.hostVideo ?? true,
        participantVideo: data.participantVideo ?? false,
        muteUponEntry: data.muteUponEntry ?? true,
        autoRecording: data.autoRecording ?? "none",
        agenda: data.agenda,
        isDefault: data.isDefault ?? false,
      },
    });
    revalidatePath("/templates");
    return { success: true, data: template };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateTemplateAction(
  id: string,
  data: Partial<TemplateFormData>
): Promise<ActionResult<MeetingTemplate>> {
  try {
    await requireAuth();
    const template = await prisma.meetingTemplate.update({
      where: { id },
      data,
    });
    revalidatePath("/templates");
    return { success: true, data: template };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteTemplateAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    await requireAuth();
    await prisma.meetingTemplate.delete({ where: { id } });
    revalidatePath("/templates");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function seedDefaultTemplatesAction(): Promise<ActionResult<void>> {
  try {
    await requireAuth();
    const count = await prisma.meetingTemplate.count();
    if (count > 0) return { success: true, data: undefined };

    await prisma.meetingTemplate.createMany({
      data: [
        {
          name: "Kuliah Umum",
          description: "Template untuk sesi kuliah umum dan perkuliahan",
          icon: "graduation-cap",
          color: "blue",
          duration: 120,
          waitingRoom: true,
          hostVideo: true,
          participantVideo: false,
          muteUponEntry: true,
          autoRecording: "cloud",
          isDefault: true,
        },
        {
          name: "Rapat Akademik",
          description: "Rapat internal staf dan dosen",
          icon: "users",
          color: "green",
          duration: 60,
          waitingRoom: false,
          hostVideo: true,
          participantVideo: true,
          muteUponEntry: false,
          autoRecording: "none",
          isDefault: true,
        },
        {
          name: "Sidang Skripsi",
          description: "Sidang tugas akhir mahasiswa",
          icon: "scroll",
          color: "purple",
          duration: 90,
          waitingRoom: true,
          requireAuth: true,
          hostVideo: true,
          participantVideo: true,
          muteUponEntry: true,
          autoRecording: "cloud",
          isDefault: true,
        },
        {
          name: "Seminar Online",
          description: "Webinar dan seminar publik",
          icon: "presentation",
          color: "orange",
          duration: 150,
          waitingRoom: true,
          hostVideo: true,
          participantVideo: false,
          muteUponEntry: true,
          autoRecording: "cloud",
          isDefault: true,
        },
      ],
    });
    revalidatePath("/templates");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
