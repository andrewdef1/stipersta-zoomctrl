"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import type { ActionResult } from "@/types/zoom";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getActivityLogsAction(): Promise<
  ActionResult<Array<{
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
  }>>
> {
  try {
    await requireAuth();
    const logs = await db.getActivityLogs(200);
    return { success: true, data: logs };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
