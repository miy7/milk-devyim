import { Role } from "@prisma/client";

import type { AppSectionKey, NavItem } from "@/types";

const SECTION_ACCESS: Record<AppSectionKey, Role[]> = {
  dashboard: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "work-plans": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  calendar: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "employee-finance": [Role.ADMIN, Role.MANAGER],
  employees: [Role.ADMIN, Role.MANAGER],
  reports: [Role.ADMIN, Role.MANAGER],
  settings: [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/work-plans", label: "Work Plans", key: "work-plans" },
  { href: "/calendar", label: "Calendar", key: "calendar" },
  {
    href: "/employee-finance",
    label: "Employee Finance",
    key: "employee-finance",
  },
  { href: "/employees", label: "Employees", key: "employees" },
  { href: "/reports", label: "Reports", key: "reports" },
  { href: "/settings", label: "Settings", key: "settings" },
];

export function hasSectionAccess(role: Role, section: AppSectionKey) {
  return SECTION_ACCESS[section].includes(role);
}

export function canManageWorkPlans(role: Role) {
  return role === Role.ADMIN || role === Role.MANAGER;
}

export function canManageFinances(role: Role) {
  return role === Role.ADMIN || role === Role.MANAGER;
}

export function canManageEmployees(role: Role) {
  return role === Role.ADMIN;
}

export function getNavItems(role: Role) {
  return NAV_ITEMS.filter((item) => hasSectionAccess(role, item.key));
}
