"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { verifyPassword } from "@/lib/password";
import { destroySession, getCurrentUser, persistSession } from "@/lib/auth/session";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    identifier?: string;
    password?: string;
  };
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
};

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const identifier = `${formData.get("identifier") ?? ""}`.trim();
  const password = `${formData.get("password") ?? ""}`;
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!identifier) {
    fieldErrors.identifier = "Enter your email or username.";
  }

  if (!password) {
    fieldErrors.password = "Enter your password.";
  }

  if (fieldErrors.identifier || fieldErrors.password) {
    return {
      status: "error",
      fieldErrors,
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: {
            equals: identifier,
            mode: "insensitive",
          },
        },
        {
          username: {
            equals: identifier,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return {
      status: "error",
      message: "Invalid credentials. Please check your login details and try again.",
    };
  }

  await persistSession({
    userId: user.id,
    role: user.role,
  });

  await logActivity({
    actorId: user.id,
    action: "LOGIN",
    entityType: "SESSION",
    entityId: user.id,
    description: `${user.name} signed in.`,
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  const user = await getCurrentUser();

  await destroySession();

  if (user) {
    await logActivity({
      actorId: user.id,
      action: "LOGOUT",
      entityType: "SESSION",
      entityId: user.id,
      description: `${user.name} signed out.`,
    });
  }

  redirect("/login");
}
