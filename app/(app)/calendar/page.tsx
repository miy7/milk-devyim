import Link from "next/link";

import { PlanningCalendar } from "@/components/calendar/planning-calendar";
import { buttonStyles } from "@/components/ui/button";
import { canManageWorkPlans } from "@/lib/auth/permissions";
import { requireSectionAccess } from "@/lib/auth/session";
import { getCalendarEvents } from "@/lib/data";

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSectionAccess("calendar");
  const filters = await searchParams;
  const initialDate = firstValue(filters.date);
  const initialView = firstValue(filters.view) as "month" | "week" | "day" | "";
  const events = await getCalendarEvents(user, initialDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Dedicated schedule and planning calendar
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Use the month, week, and day views to inspect team workload and drill into a
            selected date.
          </p>
        </div>
        {canManageWorkPlans(user.role) ? (
          <Link className={buttonStyles("secondary")} href="/work-plans">
            Add plan from planner
          </Link>
        ) : null}
      </div>

      <PlanningCalendar
        createHrefBase={canManageWorkPlans(user.role) ? "/work-plans" : undefined}
        events={events}
        initialDateKey={initialDate || undefined}
        initialView={initialView === "week" || initialView === "day" ? initialView : "month"}
      />
    </div>
  );
}
