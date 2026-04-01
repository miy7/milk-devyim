import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type LogActivityInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Prisma.InputJsonValue | null;
};

export async function logActivity(input: LogActivityInput) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: input.actorId ?? undefined,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? undefined,
        description: input.description,
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
}
