"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/_actions/auth";
import { buttonStyles } from "@/components/ui/button";
import { cn, formatEnumLabel, getInitials } from "@/lib/utils";
import type { NavItem, SessionUser } from "@/types";

export function AppShell({
  children,
  navItems,
  user,
}: {
  children: ReactNode;
  navItems: NavItem[];
  user: SessionUser;
}) {
  const pathname = usePathname();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-[280px] shrink-0 rounded-[32px] border border-white/10 bg-black/45 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur lg:flex lg:flex-col">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">milk-devyim</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Internal Operations
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              A dark, executive-friendly control center for planning, workforce management,
              and employee finance oversight.
            </p>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                    active
                      ? "border border-white/10 bg-white text-black"
                      : "border border-transparent text-zinc-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] opacity-70">
                    {item.label.slice(0, 2)}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Signed in as</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-zinc-500">{formatEnumLabel(user.role)}</p>
              </div>
            </div>
            <form action={signOutAction} className="mt-5">
              <button className={buttonStyles("secondary")} type="submit">
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="rounded-[32px] border border-white/10 bg-black/35 px-6 py-5 shadow-[0_24px_72px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  Operations dashboard
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Executive workspace for planning, teams, and finance
                </h2>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/30 font-semibold text-white">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatEnumLabel(user.role)} • {today}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-2xl border px-4 py-2 text-sm transition",
                      active
                        ? "border-white/10 bg-white text-black"
                        : "border-white/10 bg-white/[0.04] text-zinc-300",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
