"use server";

import { WorkPlanStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { requireWorkPlanAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { fromDateKey, startOfDay } from "@/lib/utils";
import type { FormActionState } from "@/app/_actions/form-state";

function revalidateWorkPlanSurfaces() {
  revalidatePath("/dashboard");
  revalidatePath("/work-plans");
  revalidatePath("/calendar");
  revalidatePath("/reports");
}

export async function upsertWorkPlanAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireWorkPlanAccess();
  const id = `${formData.get("id") ?? ""}`.trim();
  const title = `${formData.get("title") ?? ""}`.trim();
  const description = `${formData.get("description") ?? ""}`.trim();
  const date = `${formData.get("date") ?? ""}`.trim();
  const startTime = `${formData.get("startTime") ?? ""}`.trim();
  const endTime = `${formData.get("endTime") ?? ""}`.trim();
  const location = `${formData.get("location") ?? ""}`.trim();
  const note = `${formData.get("note") ?? ""}`.trim();
  const statusValue = `${formData.get("status") ?? WorkPlanStatus.PENDING}`.trim();
  const employeeIds = formData
    .getAll("employeeIds")
    .map((value) => `${value}`.trim())
    .filter(Boolean);
  const fieldErrors: Record<string, string> = {};

  if (!title) {
    fieldErrors.title = "Title is required.";
  }

  if (!description) {
    fieldErrors.description = "Description is required.";
  }

  if (!date) {
    fieldErrors.date = "Date is required.";
  }

  if (!startTime) {
    fieldErrors.startTime = "Start time is required.";
  }

  if (!endTime) {
    fieldErrors.endTime = "End time is required.";
  }

  if (startTime && endTime && endTime <= startTime) {
    fieldErrors.endTime = "End time must be after the start time.";
  }

  if (employeeIds.length === 0) {
    fieldErrors.employeeIds = "Assign at least one employee.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      fieldErrors,
    };
  }

  const normalizedStatus =
    statusValue in WorkPlanStatus ? (statusValue as WorkPlanStatus) : WorkPlanStatus.PENDING;
  const payload = {
    title,
    description,
    date: startOfDay(fromDateKey(date)),
    startTime,
    endTime,
    status: normalizedStatus,
    location: location || null,
    note: note || null,
  };

  if (id) {
    const existing = await prisma.workPlan.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      return {
        status: "error",
        message: "That work plan no longer exists.",
      };
    }

    await prisma.workPlan.update({
      where: { id },
      data: {
        ...payload,
        assignments: {
          deleteMany: {},
          create: employeeIds.map((employeeId) => ({ employeeId })),
        },
      },
    });

    await logActivity({
      actorId: user.id,
      action: "PLAN_UPDATED",
      entityType: "WORK_PLAN",
      entityId: id,
      description: `Updated work plan "${title}".`,
    });
  } else {
    const created = await prisma.workPlan.create({
      data: {
        ...payload,
        createdById: user.id,
        assignments: {
          create: employeeIds.map((employeeId) => ({ employeeId })),
        },
      },
      select: {
        id: true,
      },
    });

    await logActivity({
      actorId: user.id,
      action: "PLAN_CREATED",
      entityType: "WORK_PLAN",
      entityId: created.id,
      description: `Created work plan "${title}".`,
    });
  }

  revalidateWorkPlanSurfaces();

  return {
    status: "success",
  };
}

export async function deleteWorkPlanAction(formData: FormData) {
  const user = await requireWorkPlanAccess();
  const id = `${formData.get("id") ?? ""}`.trim();

  if (!id) {
    return;
  }

  const existing = await prisma.workPlan.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!existing) {
    return;
  }

  await prisma.workPlan.delete({
    where: { id },
  });

  await logActivity({
    actorId: user.id,
    action: "PLAN_DELETED",
    entityType: "WORK_PLAN",
    entityId: id,
    description: `Deleted work plan "${existing.title}".`,
  });

  revalidateWorkPlanSurfaces();
}
