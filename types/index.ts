import type {
  EmployeeStatus,
  PaymentStatus,
  Role,
  WorkPlanStatus,
} from "@prisma/client";

export type AppSectionKey =
  | "dashboard"
  | "work-plans"
  | "calendar"
  | "employee-finance"
  | "employees"
  | "reports"
  | "settings";

export type NavItem = {
  href: string;
  label: string;
  key: AppSectionKey;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  employeeId: string | null;
  employeeName: string | null;
  position: string | null;
};

export type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  description: string;
  actorName: string;
  createdAt: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  status: WorkPlanStatus;
  location: string | null;
  note: string | null;
  assignedEmployees: {
    id: string;
    name: string;
  }[];
};

export type DashboardData = {
  summary: {
    totalPlansToday: number;
    pendingPlans: number;
    completedPlans: number;
    activeWorkers: number;
  };
  todayTasks: CalendarEvent[];
  upcomingTasks: CalendarEvent[];
  calendarEvents: CalendarEvent[];
  recentActivity: ActivityItem[];
};

export type EmployeeOption = {
  id: string;
  fullName: string;
  nickname: string | null;
  position: string;
  role: Role;
  status: EmployeeStatus;
};

export type WorkPlanListItem = CalendarEvent & {
  createdAt: string;
};

export type WorkPlansPageData = {
  filters: {
    date: string;
    employeeId: string;
    status: string;
  };
  employees: EmployeeOption[];
  items: WorkPlanListItem[];
};

export type FinanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  dateKey: string;
  workReference: string;
  dailyWage: number;
  bonus: number;
  deduction: number;
  advancePayment: number;
  totalPayable: number;
  paymentStatus: PaymentStatus;
  note: string | null;
  workPlanId: string | null;
  createdAt: string;
};

export type FinancePageData = {
  filters: {
    employeeId: string;
    from: string;
    to: string;
    search: string;
  };
  employees: EmployeeOption[];
  records: FinanceRecord[];
  summary: {
    totalWages: number;
    totalBonus: number;
    totalDeductions: number;
    netPayable: number;
  };
};

export type EmployeeRecord = {
  id: string;
  fullName: string;
  nickname: string | null;
  phone: string | null;
  position: string;
  dailyRate: number;
  role: Role;
  status: EmployeeStatus;
  note: string | null;
  linkedUserName: string | null;
  activeAssignments: number;
  lastFinanceDate: string | null;
};

export type EmployeesPageData = {
  filters: {
    status: string;
    search: string;
  };
  employees: EmployeeRecord[];
};
