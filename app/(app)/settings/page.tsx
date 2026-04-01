import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireSectionAccess } from "@/lib/auth/session";
import { formatEnumLabel } from "@/lib/utils";

export default async function SettingsPage() {
  const user = await requireSectionAccess("settings");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Profile, access, and system configuration
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          A starter settings area for profile updates, password flows, and system details.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Profile</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Signed-in account</h2>
            </div>
            <Badge>{formatEnumLabel(user.role)}</Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Name</p>
              <p className="mt-2 text-sm text-white">{user.name}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Email</p>
              <p className="mt-2 text-sm text-white">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Username</p>
              <p className="mt-2 text-sm text-white">{user.username}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Linked employee</p>
              <p className="mt-2 text-sm text-white">{user.employeeName || "Not linked"}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Security</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Password and session</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-400">
              <p>Password change and recovery flows can be added here next.</p>
              <p>Session auth is cookie-based and enforced at both the route and action level.</p>
              <p>Admin-only controls can expand into company-wide settings when needed.</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">System</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Deployment notes</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-400">
              <p>Target deployment is Vercel with PostgreSQL via Prisma.</p>
              <p>Configure `DATABASE_URL` and `SESSION_SECRET` before production rollout.</p>
              <p>Seed credentials are for local development only and should be replaced.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
