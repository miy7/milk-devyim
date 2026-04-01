"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatEnumLabel, fromDateKey, getInitials, toDateKey } from "@/lib/utils";
import type { CalendarEvent } from "@/types";

type CalendarView = "month" | "week" | "day";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(12, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function formatDayHeading(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusVariant(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "IN_PROGRESS") return "info" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "warning" as const;
}

export function PlanningCalendar({
  compact = false,
  createHrefBase,
  events,
  initialDateKey,
  initialView = "month",
}: {
  compact?: boolean;
  createHrefBase?: string;
  events: CalendarEvent[];
  initialDateKey?: string;
  initialView?: CalendarView;
}) {
  const [view, setView] = useState<CalendarView>(initialView);
  const [selectedDateKey, setSelectedDateKey] = useState(
    initialDateKey || toDateKey(new Date()),
  );
  const selectedDate = fromDateKey(selectedDateKey);
  const todayKey = toDateKey(new Date());

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((accumulator, event) => {
    accumulator[event.dateKey] ??= [];
    accumulator[event.dateKey].push(event);
    return accumulator;
  }, {});

  const selectedEvents = eventsByDate[selectedDateKey] || [];
  const weekStart = startOfWeek(selectedDate);
  const monthStart = startOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  function moveCalendar(direction: "previous" | "next") {
    if (view === "month") {
      setSelectedDateKey(
        toDateKey(addMonths(selectedDate, direction === "next" ? 1 : -1)),
      );
      return;
    }

    setSelectedDateKey(
      toDateKey(
        addDays(selectedDate, direction === "next" ? (view === "week" ? 7 : 1) : view === "week" ? -7 : -1),
      ),
    );
  }

  return (
    <Card className={cn("p-5", compact ? "xl:p-6" : "p-6 xl:p-8")}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Planning calendar</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {formatMonthLabel(selectedDate)}
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Review plan distribution by date, then drill down into the selected day.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => moveCalendar("previous")} type="button" variant="secondary">
            Previous
          </Button>
          <Button onClick={() => setSelectedDateKey(todayKey)} type="button" variant="secondary">
            Today
          </Button>
          <Button onClick={() => moveCalendar("next")} type="button" variant="secondary">
            Next
          </Button>
          {(["month", "week", "day"] as const).map((item) => (
            <Button
              key={item}
              onClick={() => setView(item)}
              type="button"
              variant={view === item ? "primary" : "secondary"}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className={cn("mt-6 grid gap-6", compact ? "xl:grid-cols-[1.55fr_0.95fr]" : "xl:grid-cols-[1.7fr_0.9fr]")}>
        <div className="space-y-4">
          {view === "month" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-3 text-center text-xs uppercase tracking-[0.25em] text-zinc-500">
                {weekdayLabels.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                {monthDays.map((day) => {
                  const dateKey = toDateKey(day);
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const dayEvents = eventsByDate[dateKey] || [];

                  return (
                    <button
                      key={dateKey}
                      className={cn(
                        "min-h-36 rounded-[24px] border p-4 text-left transition",
                        dateKey === selectedDateKey
                          ? "border-white/25 bg-white/[0.07]"
                          : "border-white/10 bg-black/20 hover:bg-white/[0.04]",
                        !isCurrentMonth && "opacity-50",
                      )}
                      onClick={() => setSelectedDateKey(dateKey)}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            dateKey === todayKey ? "text-white" : "text-zinc-300",
                          )}
                        >
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 0 ? (
                          <Badge variant="neutral">{dayEvents.length} plans</Badge>
                        ) : null}
                      </div>
                      <div className="mt-4 space-y-2">
                        {dayEvents.slice(0, compact ? 2 : 3).map((event) => (
                          <div
                            key={event.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2"
                          >
                            <p className="text-sm font-medium text-white">{event.title}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {view === "week" ? (
            <div className="grid gap-3 lg:grid-cols-7">
              {weekDays.map((day) => {
                const dateKey = toDateKey(day);
                const dayEvents = eventsByDate[dateKey] || [];

                return (
                  <button
                    key={dateKey}
                    className={cn(
                      "min-h-72 rounded-[24px] border p-4 text-left transition",
                      dateKey === selectedDateKey
                        ? "border-white/25 bg-white/[0.07]"
                        : "border-white/10 bg-black/20 hover:bg-white/[0.04]",
                    )}
                    onClick={() => setSelectedDateKey(dateKey)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{formatDayHeading(day)}</p>
                      {dateKey === todayKey ? <Badge variant="info">Today</Badge> : null}
                    </div>
                    <div className="mt-4 space-y-3">
                      {dayEvents.length === 0 ? (
                        <p className="text-sm text-zinc-500">No plans scheduled.</p>
                      ) : (
                        dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
                          >
                            <p className="text-sm font-medium text-white">{event.title}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {event.startTime} - {event.endTime}
                            </p>
                            <p className="mt-2 text-xs text-zinc-400">
                              {event.assignedEmployees.length} assigned
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {view === "day" ? (
            <div className="space-y-3">
              {selectedEvents.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-sm text-zinc-500">
                  No plans scheduled for {formatDayHeading(selectedDate)}.
                </div>
              ) : (
                selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[24px] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{event.title}</p>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                          {event.description}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(event.status)}>
                        {formatEnumLabel(event.status)}
                      </Badge>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Time</p>
                        <p className="mt-2 text-sm text-white">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                          Location
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {event.location || "Not specified"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                          Assigned
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {event.assignedEmployees.length} team members
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Selected date</p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {formatDayHeading(selectedDate)}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {createHrefBase ? (
                <Link
                  className={buttonStyles("secondary", "sm")}
                  href={`${createHrefBase}?date=${selectedDateKey}`}
                >
                  Add from date
                </Link>
              ) : null}
              {selectedDateKey === todayKey ? <Badge variant="info">Today</Badge> : null}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {selectedEvents.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-zinc-500">
                No plans assigned for this day.
              </div>
            ) : (
              selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(event.status)}>
                      {formatEnumLabel(event.status)}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{event.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.assignedEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs text-zinc-300"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-semibold text-white">
                          {getInitials(employee.name)}
                        </span>
                        {employee.name}
                      </div>
                    ))}
                  </div>
                  {event.note ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                      {event.note}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
