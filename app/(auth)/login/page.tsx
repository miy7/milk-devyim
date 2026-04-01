import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%)]" />
      <div className="relative grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="hidden overflow-hidden lg:block">
          <div className="relative h-full min-h-[680px] p-10">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_40%)]" />
            <div className="relative max-w-xl space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
                milk-devyim
              </p>
              <h1 className="text-5xl font-semibold tracking-tight text-white">
                Internal operations, finance, and planning in one command center.
              </h1>
              <p className="text-base leading-8 text-zinc-400">
                This starter is structured for real business operations: protected routes,
                role-aware navigation, monthly planning visibility, and employee finance
                tracking on a scalable Prisma-backed foundation.
              </p>
            </div>

            <div className="relative mt-14 grid gap-4 md:grid-cols-2">
              {[
                {
                  label: "Work planning",
                  detail: "Monthly, weekly, and daily plan visibility with assignment depth.",
                },
                {
                  label: "Employee finance",
                  detail: "Daily wages, bonuses, deductions, advances, and payable totals.",
                },
                {
                  label: "Role access",
                  detail: "Admin, manager, and employee permissions with route protection.",
                },
                {
                  label: "Management reporting",
                  detail: "A premium scaffold ready for totals, summaries, and exports.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mx-auto w-full max-w-xl p-8 sm:p-10">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Secure access</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Sign in to continue
            </h2>
            <p className="text-sm leading-7 text-zinc-400">
              Use your email or username to access the internal management system.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400">
            <p className="font-medium text-white">Seeded demo credentials</p>
            <p className="mt-2">Use `admin`, `manager`, or `employee` with password `Milk@123`.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
