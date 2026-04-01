import "server-only";

import { cache } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/token";
import {
  canManageEmployees,
  canManageFinances,
  canManageWorkPlans,
  hasSectionAccess,
} from "@/lib/auth/permissions";
import type { AppSectionKey, SessionUser } from "@/types";

export async function persistSession({
  userId,
  role,
}: {
  userId: string;
  role: SessionUser["role"];
}) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken({ userId, role }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
});

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      employeeId: true,
      employee: {
        select: {
          fullName: true,
          position: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    employeeId: user.employeeId,
    employeeName: user.employee?.fullName ?? null,
    position: user.employee?.position ?? null,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireSectionAccess(section: AppSectionKey) {
  const user = await requireUser();

  if (!hasSectionAccess(user.role, section)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireWorkPlanAccess() {
  const user = await requireUser();

  if (!canManageWorkPlans(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireFinanceAccess() {
  const user = await requireUser();

  if (!canManageFinances(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireEmployeeManagementAccess() {
  const user = await requireUser();

  if (!canManageEmployees(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
