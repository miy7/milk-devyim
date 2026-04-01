import { createHmac, timingSafeEqual } from "node:crypto";

import type { Role } from "@prisma/client";

export const SESSION_COOKIE_NAME = "milk-devyim.session";
export const SESSION_MAX_AGE = 60 * 60 * 12;

export type SessionPayload = {
  userId: string;
  role: Role;
  exp: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET || "development-only-secret-change-me";
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  try {
    const expectedSignature = sign(encodedPayload);
    const incoming = Buffer.from(signature, "base64url");
    const expected = Buffer.from(expectedSignature, "base64url");

    if (incoming.length !== expected.length || !timingSafeEqual(incoming, expected)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload.userId || !payload.role || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
