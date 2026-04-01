import "server-only";

import { EmployeeStatus, Role, WorkPlanStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  addDays,
  endOfDay,
  fromDateKey,
  startOfDay,
  toDateKey,
} from "@/lib/utils";
import type {
  DashboardData,
  EmployeeOption,
  EmployeesPageData,
  FinancePageData,
  SessionUser,
  WorkPlansPageData,
} from "@/types";

const employeeOptionSelect = {
  id: true,
  fullName: true,
  nickname: true,
  position: true,
  role: true,
  status: true,
} satisfies Prisma.EmployeeSelect;

const workPlanSelect = {
  id: true,
  title: true,
  description: true,
  date: true,
  startTime: true,
  endTime: true,
  status: true,
  note: true,
  location: true,
  createdAt: true,
  assignments: {
    select: {
      employee: {
        select: {
          id: true,
          fullName: true,
          nickname: true,
        },
      },
    },
  },
} satisfies Prisma.WorkPlanSelect;

type WorkPlanRecord = Prisma.WorkPlanGetPayload<{
  select: typeof workPlanSelect;
}>;

function buildWorkPlanVisibility(user: SessionUser): Prisma.WorkPlanWhereInput {
  if (user.role !== Role.EMPLOYEE || !user.employeeId) {
    return {};
  }

  return {
    assignments: {
      some: {
        employeeId: user.employeeId,
      },
    },
  };
}

function mapPlan(plan: WorkPlanRecord) {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    dateKey: toDateKey(plan.date),
    startTime: plan.startTime,
    endTime: plan.endTime,
    status: plan.status,
    location: plan.location,
    note: plan.note,
    createdAt: plan.createdAt.toISOString(),
    assignedEmployees: plan.assignments.map(({ employee }) => ({
      id: employee.id,
      name: employee.nickname || employee.fullName,
    })),
  };
}

export async function getEmployeeOptions(user?: SessionUser): Promise<EmployeeOption[]> {
  const where =
    user?.role === Role.EMPLOYEE && user.employeeId
      ? { id: user.employeeId }
      : undefined;

  const employees = await prisma.employee.findMany({
    where,
    orderBy: [{ status: "asc" }, { fullName: "asc" }],
    select: employeeOptionSelect,
  });

  return employees;
}

export async function getDashboardData(user: SessionUser): Promise<DashboardData> {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const visibilityWhere = buildWorkPlanVisibility(user);

  const activityWhere =
    user.role === Role.EMPLOYEE
      ? {
          OR: [
            { actorId: user.id },
            {
              entityType: "WORK_PLAN",
            },
          ],
        }
      : {};

  const [todayPlans, upcomingPlans, calendarPlans, recentActivity, activeWorkers] =
    await Promise.all([
      prisma.workPlan.findMany({
        where: {
          ...visibilityWhere,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        select: workPlanSelect,
      }),
      prisma.workPlan.findMany({
        where: {
          ...visibilityWhere,
          date: {
            gte: todayStart,
          },
        },
        take: 6,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        select: workPlanSelect,
      }),
      prisma.workPlan.findMany({
        where: {
          ...visibilityWhere,
          date: {
            gte: addDays(todayStart, -15),
            lte: addDays(todayEnd, 45),
          },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        select: workPlanSelect,
      }),
      prisma.activityLog.findMany({
        where: activityWhere,
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          action: true,
          entityType: true,
          description: true,
          createdAt: true,
          actor: {
            select: {
              name: true,
            },
          },
        },
      }),
      user.role === Role.EMPLOYEE
        ? Promise.resolve(0)
        : prisma.employee.count({
            where: {
              status: EmployeeStatus.ACTIVE,
            },
          }),
    ]);

  const mappedTodayPlans = todayPlans.map(mapPlan);
  const mappedUpcomingPlans = upcomingPlans.map(mapPlan);
  const mappedCalendarPlans = calendarPlans.map(mapPlan);

  const employeeActiveWorkers =
    user.role === Role.EMPLOYEE
      ? new Set(
          mappedTodayPlans.flatMap((plan) => plan.assignedEmployees.map((employee) => employee.id)),
        ).size
      : activeWorkers;

  return {
    summary: {
      totalPlansToday: todayPlans.length,
      pendingPlans: todayPlans.filter(
        (plan) =>
          plan.status === WorkPlanStatus.PENDING ||
          plan.status === WorkPlanStatus.IN_PROGRESS,
      ).length,
      completedPlans: todayPlans.filter((plan) => plan.status === WorkPlanStatus.COMPLETED)
        .length,
      activeWorkers: employeeActiveWorkers,
    },
    todayTasks: mappedTodayPlans,
    upcomingTasks: mappedUpcomingPlans,
    calendarEvents: mappedCalendarPlans,
    recentActivity: recentActivity.map((activity) => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      description: activity.description,
      actorName: activity.actor?.name ?? "System",
      createdAt: activity.createdAt.toISOString(),
    })),
  };
}

export async function getWorkPlansPageData(
  user: SessionUser,
  filters: {
    date?: string;
    employeeId?: string;
    status?: string;
  },
): Promise<WorkPlansPageData> {
  const visibilityWhere = buildWorkPlanVisibility(user);
  const employeeId =
    user.role === Role.EMPLOYEE && user.employeeId ? user.employeeId : filters.employeeId || "";
  const date = filters.date || "";
  const status = filters.status || "";
  const where: Prisma.WorkPlanWhereInput = {
    ...visibilityWhere,
  };

  if (date) {
    const selectedDate = fromDateKey(date);
    where.date = {
      gte: startOfDay(selectedDate),
      lte: endOfDay(selectedDate),
    };
  }

  if (employeeId) {
    where.assignments = {
      some: {
        employeeId,
      },
    };
  }

  if (status && status in WorkPlanStatus) {
    where.status = status as WorkPlanStatus;
  }

  const [employees, items] = await Promise.all([
    getEmployeeOptions(user),
    prisma.workPlan.findMany({
      where,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: workPlanSelect,
    }),
  ]);

  return {
    filters: {
      date,
      employeeId,
      status,
    },
    employees,
    items: items.map(mapPlan),
  };
}

export async function getCalendarEvents(user: SessionUser, anchorDate?: string) {
  const baseDate = anchorDate ? fromDateKey(anchorDate) : new Date();
  const visibilityWhere = buildWorkPlanVisibility(user);

  const plans = await prisma.workPlan.findMany({
    where: {
      ...visibilityWhere,
      date: {
        gte: addDays(startOfDay(baseDate), -120),
        lte: addDays(endOfDay(baseDate), 240),
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    select: workPlanSelect,
  });

  return plans.map(mapPlan);
}

export async function getFinancePageData(
  filters: {
    employeeId?: string;
    from?: string;
    to?: string;
    search?: string;
  },
): Promise<FinancePageData> {
  const employeeId = filters.employeeId || "";
  const from = filters.from || "";
  const to = filters.to || "";
  const search = filters.search || "";
  const where: Prisma.EmployeeFinanceWhereInput = {};

  if (employeeId) {
    where.employeeId = employeeId;
  }

  if (from || to) {
    where.date = {};

    if (from) {
      where.date.gte = startOfDay(fromDateKey(from));
    }

    if (to) {
      where.date.lte = endOfDay(fromDateKey(to));
    }
  }

  if (search) {
    where.OR = [
      {
        workReference: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        note: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        employee: {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const [employees, records] = await Promise.all([
    getEmployeeOptions(),
    prisma.employeeFinance.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        employeeId: true,
        date: true,
        workReference: true,
        dailyWage: true,
        bonus: true,
        deduction: true,
        advancePayment: true,
        totalPayable: true,
        paymentStatus: true,
        note: true,
        workPlanId: true,
        createdAt: true,
        employee: {
          select: {
            fullName: true,
            nickname: true,
          },
        },
      },
    }),
  ]);

  const normalizedRecords = records.map((record) => ({
    id: record.id,
    employeeId: record.employeeId,
    employeeName: record.employee.nickname || record.employee.fullName,
    dateKey: toDateKey(record.date),
    workReference: record.workReference,
    dailyWage: Number(record.dailyWage),
    bonus: Number(record.bonus),
    deduction: Number(record.deduction),
    advancePayment: Number(record.advancePayment),
    totalPayable: Number(record.totalPayable),
    paymentStatus: record.paymentStatus,
    note: record.note,
    workPlanId: record.workPlanId,
    createdAt: record.createdAt.toISOString(),
  }));

  return {
    filters: {
      employeeId,
      from,
      to,
      search,
    },
    employees,
    records: normalizedRecords,
    summary: normalizedRecords.reduce(
      (totals, record) => ({
        totalWages: totals.totalWages + record.dailyWage,
        totalBonus: totals.totalBonus + record.bonus,
        totalDeductions: totals.totalDeductions + record.deduction + record.advancePayment,
        netPayable: totals.netPayable + record.totalPayable,
      }),
      {
        totalWages: 0,
        totalBonus: 0,
        totalDeductions: 0,
        netPayable: 0,
      },
    ),
  };
}

export async function getEmployeesPageData(filters: {
  status?: string;
  search?: string;
}): Promise<EmployeesPageData> {
  const status = filters.status || "";
  const search = filters.search || "";
  const where: Prisma.EmployeeWhereInput = {};

  if (status && status in EmployeeStatus) {
    where.status = status as EmployeeStatus;
  }

  if (search) {
    where.OR = [
      {
        fullName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        nickname: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        position: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: [{ status: "asc" }, { fullName: "asc" }],
    select: {
      id: true,
      fullName: true,
      nickname: true,
      phone: true,
      position: true,
      dailyRate: true,
      role: true,
      status: true,
      note: true,
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          assignments: true,
        },
      },
      finances: {
        select: {
          date: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 1,
      },
    },
  });

  return {
    filters: {
      status,
      search,
    },
    employees: employees.map((employee) => ({
      id: employee.id,
      fullName: employee.fullName,
      nickname: employee.nickname,
      phone: employee.phone,
      position: employee.position,
      dailyRate: Number(employee.dailyRate),
      role: employee.role,
      status: employee.status,
      note: employee.note,
      linkedUserName: employee.user?.username ?? null,
      activeAssignments: employee._count.assignments,
      lastFinanceDate: employee.finances[0]?.date.toISOString() ?? null,
    })),
  };
}

export async function getReportsData(filters: { from?: string; to?: string }) {
  const now = new Date();
  const periodStart = filters.from
    ? startOfDay(fromDateKey(filters.from))
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = filters.to
    ? endOfDay(fromDateKey(filters.to))
    : endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [plans, finances, employees] = await Promise.all([
    prisma.workPlan.findMany({
      where: {
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        id: true,
        date: true,
        status: true,
      },
    }),
    prisma.employeeFinance.findMany({
      where: {
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        id: true,
        date: true,
        totalPayable: true,
        bonus: true,
        deduction: true,
        advancePayment: true,
      },
    }),
    prisma.employee.count({
      where: {
        status: EmployeeStatus.ACTIVE,
      },
    }),
  ]);

  const financeTotals = finances.reduce(
    (totals, record) => {
      totals.netPayable += Number(record.totalPayable);
      totals.totalBonus += Number(record.bonus);
      totals.totalDeductions += Number(record.deduction) + Number(record.advancePayment);
      return totals;
    },
    {
      netPayable: 0,
      totalBonus: 0,
      totalDeductions: 0,
    },
  );

  const chartMap = new Map<string, number>();

  finances.forEach((record) => {
    const key = toDateKey(record.date);
    chartMap.set(key, (chartMap.get(key) ?? 0) + Number(record.totalPayable));
  });

  const financeSeries = Array.from(chartMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-10)
    .map(([dateKey, total]) => ({
      dateKey,
      total,
    }));

  const statusSummary = {
    pending: plans.filter((plan) => plan.status === WorkPlanStatus.PENDING).length,
    inProgress: plans.filter((plan) => plan.status === WorkPlanStatus.IN_PROGRESS).length,
    completed: plans.filter((plan) => plan.status === WorkPlanStatus.COMPLETED).length,
    cancelled: plans.filter((plan) => plan.status === WorkPlanStatus.CANCELLED).length,
  };
  const dailyKey = toDateKey(periodEnd);
  const weeklyStart = addDays(periodEnd, -6);
  const monthlyYear = periodEnd.getFullYear();
  const monthlyMonth = periodEnd.getMonth();
  const cadenceTotals = finances.reduce(
    (totals, record) => {
      const value = Number(record.totalPayable);

      if (toDateKey(record.date) === dailyKey) {
        totals.daily += value;
      }

      if (record.date >= weeklyStart) {
        totals.weekly += value;
      }

      if (
        record.date.getFullYear() === monthlyYear &&
        record.date.getMonth() === monthlyMonth
      ) {
        totals.monthly += value;
      }

      return totals;
    },
    {
      daily: 0,
      weekly: 0,
      monthly: 0,
    },
  );

  return {
    filters: {
      from: toDateKey(periodStart),
      to: toDateKey(periodEnd),
    },
    overview: {
      totalPlans: plans.length,
      activeEmployees: employees,
      netPayable: financeTotals.netPayable,
      totalBonus: financeTotals.totalBonus,
      totalDeductions: financeTotals.totalDeductions,
    },
    cadenceTotals,
    statusSummary,
    financeSeries,
  };
}
