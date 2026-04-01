import { canManageWorkPlans } from "@/lib/auth/permissions";
import { requireSectionAccess } from "@/lib/auth/session";
import { getWorkPlansPageData } from "@/lib/data";
import { WorkPlansClient } from "@/components/work-plans/work-plans-client";

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function WorkPlansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSectionAccess("work-plans");
  const filters = await searchParams;
  const data = await getWorkPlansPageData(user, {
    date: firstValue(filters.date),
    employeeId: firstValue(filters.employeeId),
    status: firstValue(filters.status),
  });

  return <WorkPlansClient canManage={canManageWorkPlans(user.role)} data={data} />;
}
