import { EmployeesClient } from "@/components/employees/employees-client";
import { canManageEmployees } from "@/lib/auth/permissions";
import { requireSectionAccess } from "@/lib/auth/session";
import { getEmployeesPageData } from "@/lib/data";

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSectionAccess("employees");
  const filters = await searchParams;
  const data = await getEmployeesPageData({
    status: firstValue(filters.status),
    search: firstValue(filters.search),
  });

  return <EmployeesClient canManage={canManageEmployees(user.role)} data={data} />;
}
