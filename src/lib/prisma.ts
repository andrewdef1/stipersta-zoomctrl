import { db } from "./db";

export interface MeetingTemplate {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  duration: number;
  timezone: string;
  passcode: string | null;
  waitingRoom: boolean;
  requireAuth: boolean;
  hostVideo: boolean;
  participantVideo: boolean;
  muteUponEntry: boolean;
  autoRecording: string;
  agenda: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

class CustomPrismaClient {
  user = {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => null,
    findMany: async () => [],
    create: async ({ data }: { data: any }) => ({ id: "user-1", ...data }),
    update: async ({ where, data }: { where: { id: string }; data: any }) => ({ id: where.id, ...data }),
    delete: async ({ where }: { where: { id: string } }) => ({ id: where.id }),
  };

  meetingTemplate = {
    findMany: async (args?: any) => db.getTemplates(),
    findUnique: async ({ where }: { where: { id: string } }) => db.getTemplateById(where.id),
    create: async ({ data }: { data: any }) => db.createTemplate(data),
    update: async ({ where, data }: { where: { id: string }; data: any }) => db.updateTemplate(where.id, data),
    delete: async ({ where }: { where: { id: string } }) => db.deleteTemplate(where.id),
    count: async () => db.countTemplates(),
    createMany: async ({ data }: { data: any[] }) => {
      for (const item of data) {
        await db.createTemplate(item);
      }
      return { count: data.length };
    },
  };

  activityLog = {
    create: async ({ data }: { data: any }) => db.logActivity(data),
    findMany: async ({ take }: { take?: number }) => db.getActivityLogs(take),
  };

  async $connect() {}
  async $disconnect() {}
}

const globalForPrisma = globalThis as unknown as {
  prisma: CustomPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new CustomPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export type PrismaClient = CustomPrismaClient;
