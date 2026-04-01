import { FinanceClient } from "@/components/finance/finance-client";
import { requireSectionAccess } from "@/lib/auth/session";
import { getFinancePageData } from "@/lib/data";

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function EmployeeFinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSectionAccess("employee-finance");
  const filters = await searchParams;
  const data = await getFinancePageData({
    employeeId: firstValue(filters.employeeId),
    from: firstValue(filters.from),
    to: firstValue(filters.to),
    search: firstValue(filters.search),
  });

  return <FinanceClient data={data} />;
}
