import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PlanningCalendar } from "@/components/calendar/planning-calendar";
import { canManageFinances, canManageWorkPlans, hasSectionAccess } from "@/lib/auth/permissions";
import { requireSectionAccess } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data";
import { formatDateTime, formatShortDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireSectionAccess("dashboard");
  const data = await getDashboardData(user);
  const quickActions = [
    canManageWorkPlans(user.role) && {
      href: "/work-plans",
      label: "Add plan",
    },
    canManageFinances(user.role) && {
      href: "/employee-finance",
      label: "Add employee finance",
    },
    hasSectionAccess(user.role, "reports") && {
      href: "/reports",
      label: "View reports",
    },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Work planning and business status at a glance
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Monitor live plan health, inspect near-term workload, and keep recent activity
            visible for the operations team.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} className={buttonStyles("secondary")} href={action.href}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="Plans scheduled for the current day."
          eyebrow="TP"
          label="Total plans today"
          value={String(data.summary.totalPlansToday)}
        />
        <StatCard
          detail="Pending and in-progress work items."
          eyebrow="PD"
          label="Pending plans"
          value={String(data.summary.pendingPlans)}
        />
        <StatCard
          detail="Closed out for the current day."
          eyebrow="CP"
          label="Completed plans"
          value={String(data.summary.completedPlans)}
        />
        <StatCard
          detail="Active employees visible to this role."
          eyebrow="AW"
          label="Active workers"
          value={String(data.summary.activeWorkers)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <PlanningCalendar compact events={data.calendarEvents} />

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Today</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Upcoming tasks</h2>
              </div>
              <Badge variant="info">{data.upcomingTasks.length} visible</Badge>
            </div>
            <div className="mt-5 space-y-4">
              {data.upcomingTasks.length === 0 ? (
                <p className="text-sm text-zinc-500">No tasks scheduled.</p>
              ) : (
                data.upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {formatShortDate(task.dateKey)} • {task.startTime} - {task.endTime}
                        </p>
                      </div>
                      <Badge variant={task.status === "COMPLETED" ? "success" : "warning"}>
                        {task.status === "COMPLETED" ? "Closed" : "Open"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{task.description}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Activity</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Recent activity</h2>
            </div>
            <div className="mt-5 space-y-4">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-zinc-500">No recent activity captured.</p>
              ) : (
                data.recentActivity.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 p-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-300" />
                    <div>
                      <p className="text-sm text-white">{item.description}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {item.actorName} • {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
