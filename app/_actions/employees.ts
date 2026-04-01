"use server";

import { EmployeeStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { requireEmployeeManagementAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { FormActionState } from "@/app/_actions/form-state";

function revalidateEmployeeSurfaces() {
  revalidatePath("/dashboard");
  revalidatePath("/employees");
  revalidatePath("/reports");
}

export async function upsertEmployeeAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireEmployeeManagementAccess();
  const id = `${formData.get("id") ?? ""}`.trim();
  const fullName = `${formData.get("fullName") ?? ""}`.trim();
  const nickname = `${formData.get("nickname") ?? ""}`.trim();
  const phone = `${formData.get("phone") ?? ""}`.trim();
  const position = `${formData.get("position") ?? ""}`.trim();
  const note = `${formData.get("note") ?? ""}`.trim();
  const dailyRate = Number(`${formData.get("dailyRate") ?? "0"}`);
  const roleValue = `${formData.get("role") ?? Role.EMPLOYEE}`.trim();
  const statusValue = `${formData.get("status") ?? EmployeeStatus.ACTIVE}`.trim();
  const fieldErrors: Record<string, string> = {};

  if (!fullName) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (!position) {
    fieldErrors.position = "Position is required.";
  }

  if (Number.isNaN(dailyRate) || dailyRate < 0) {
    fieldErrors.dailyRate = "Daily rate must be zero or greater.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      fieldErrors,
    };
  }

  const role = roleValue in Role ? (roleValue as Role) : Role.EMPLOYEE;
  const status =
    statusValue in EmployeeStatus
      ? (statusValue as EmployeeStatus)
      : EmployeeStatus.ACTIVE;
  const payload = {
    fullName,
    nickname: nickname || null,
    phone: phone || null,
    position,
    dailyRate,
    role,
    status,
    note: note || null,
  };

  if (id) {
    const existing = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, fullName: true },
    });

    if (!existing) {
      return {
        status: "error",
        message: "That employee record no longer exists.",
      };
    }

    await prisma.employee.update({
      where: { id },
      data: payload,
    });

    await logActivity({
      actorId: user.id,
      action: "EMPLOYEE_UPDATED",
      entityType: "EMPLOYEE",
      entityId: id,
      description: `Updated employee profile "${fullName}".`,
    });
  } else {
    const created = await prisma.employee.create({
      data: payload,
      select: { id: true },
    });

    await logActivity({
      actorId: user.id,
      action: "EMPLOYEE_CREATED",
      entityType: "EMPLOYEE",
      entityId: created.id,
      description: `Created employee profile "${fullName}".`,
    });
  }

  revalidateEmployeeSurfaces();

  return {
    status: "success",
  };
}
