import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getNavItems } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

export default async function InternalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <AppShell navItems={getNavItems(user.role)} user={user}>
      {children}
    </AppShell>
  );
}
