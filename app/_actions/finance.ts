"use server";

import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/activity";
import { requireFinanceAccess } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { fromDateKey, startOfDay } from "@/lib/utils";
import type { FormActionState } from "@/app/_actions/form-state";

function revalidateFinanceSurfaces() {
  revalidatePath("/dashboard");
  revalidatePath("/employee-finance");
  revalidatePath("/reports");
}

export async function upsertFinanceAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireFinanceAccess();
  const id = `${formData.get("id") ?? ""}`.trim();
  const employeeId = `${formData.get("employeeId") ?? ""}`.trim();
  const date = `${formData.get("date") ?? ""}`.trim();
  const workReference = `${formData.get("workReference") ?? ""}`.trim();
  const note = `${formData.get("note") ?? ""}`.trim();
  const paymentStatusValue = `${formData.get("paymentStatus") ?? PaymentStatus.PENDING}`.trim();
  const dailyWage = Number(`${formData.get("dailyWage") ?? "0"}`);
  const bonus = Number(`${formData.get("bonus") ?? "0"}`);
  const deduction = Number(`${formData.get("deduction") ?? "0"}`);
  const advancePayment = Number(`${formData.get("advancePayment") ?? "0"}`);
  const fieldErrors: Record<string, string> = {};

  if (!employeeId) {
    fieldErrors.employeeId = "Employee is required.";
  }

  if (!date) {
    fieldErrors.date = "Date is required.";
  }

  if (!workReference) {
    fieldErrors.workReference = "Work or job reference is required.";
  }

  if (Number.isNaN(dailyWage) || dailyWage < 0) {
    fieldErrors.dailyWage = "Daily wage must be zero or greater.";
  }

  if (Number.isNaN(bonus) || bonus < 0) {
    fieldErrors.bonus = "Bonus must be zero or greater.";
  }

  if (Number.isNaN(deduction) || deduction < 0) {
    fieldErrors.deduction = "Deduction must be zero or greater.";
  }

  if (Number.isNaN(advancePayment) || advancePayment < 0) {
    fieldErrors.advancePayment = "Advance payment must be zero or greater.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      fieldErrors,
    };
  }

  const totalPayable = Math.max(0, dailyWage + bonus - deduction - advancePayment);
  const paymentStatus =
    paymentStatusValue in PaymentStatus
      ? (paymentStatusValue as PaymentStatus)
      : PaymentStatus.PENDING;
  const payload = {
    employeeId,
    date: startOfDay(fromDateKey(date)),
    workReference,
    dailyWage,
    bonus,
    deduction,
    advancePayment,
    totalPayable,
    paymentStatus,
    note: note || null,
    createdById: user.id,
  };

  if (id) {
    const existing = await prisma.employeeFinance.findUnique({
      where: { id },
      select: { id: true, workReference: true },
    });

    if (!existing) {
      return {
        status: "error",
        message: "That finance record no longer exists.",
      };
    }

    await prisma.employeeFinance.update({
      where: { id },
      data: payload,
    });

    await logActivity({
      actorId: user.id,
      action: "FINANCE_UPDATED",
      entityType: "EMPLOYEE_FINANCE",
      entityId: id,
      description: `Updated finance record "${workReference}".`,
    });
  } else {
    const created = await prisma.employeeFinance.create({
      data: payload,
      select: { id: true },
    });

    await logActivity({
      actorId: user.id,
      action: "FINANCE_CREATED",
      entityType: "EMPLOYEE_FINANCE",
      entityId: created.id,
      description: `Created finance record "${workReference}".`,
    });
  }

  revalidateFinanceSurfaces();

  return {
    status: "success",
  };
}

export async function deleteFinanceAction(formData: FormData) {
  const user = await requireFinanceAccess();
  const id = `${formData.get("id") ?? ""}`.trim();

  if (!id) {
    return;
  }

  const existing = await prisma.employeeFinance.findUnique({
    where: { id },
    select: { id: true, workReference: true },
  });

  if (!existing) {
    return;
  }

  await prisma.employeeFinance.delete({
    where: { id },
  });

  await logActivity({
    actorId: user.id,
    action: "FINANCE_DELETED",
    entityType: "EMPLOYEE_FINANCE",
    entityId: id,
    description: `Deleted finance record "${existing.workReference}".`,
  });

  revalidateFinanceSurfaces();
}
