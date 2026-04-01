"use client";

import { deleteWorkPlanAction } from "@/app/_actions/work-plans";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import { WorkPlanFormDialog } from "@/components/work-plans/work-plan-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-controls";
import { formatEnumLabel, formatShortDate } from "@/lib/utils";
import type { WorkPlansPageData } from "@/types";

function getStatusVariant(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "IN_PROGRESS") return "info" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "warning" as const;
}

export function WorkPlansClient({
  canManage,
  data,
}: {
  canManage: boolean;
  data: WorkPlansPageData;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Work planning</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Daily and scheduled work plan management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Manage work plans across teams, track assignment status, and keep the schedule
            operationally clean.
          </p>
        </div>
        {canManage ? <WorkPlanFormDialog employees={data.employees} /> : null}
      </div>

      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Date
            </label>
            <Input defaultValue={data.filters.date} name="date" type="date" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Employee
            </label>
            <Select defaultValue={data.filters.employeeId} name="employeeId">
              <option value="">All employees</option>
              {data.employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nickname || employee.fullName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Status
            </label>
            <Select defaultValue={data.filters.status} name="status">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" type="submit" variant="secondary">
              Apply filters
            </Button>
          </div>
        </form>
      </Card>

      {data.items.length === 0 ? (
        <EmptyState
          action={
            canManage ? <WorkPlanFormDialog buttonVariant="secondary" employees={data.employees} /> : null
          }
          description="No work plans match the current filters. Adjust the date, employee, or status to widen the result set."
          title="No work plans found"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.25em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4">Assigned</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-5 py-5">
                      <div className="space-y-2">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="max-w-md text-sm leading-6 text-zinc-400">
                          {item.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-sm text-zinc-300">
                      <p>{formatShortDate(item.dateKey)}</p>
                      <p className="mt-1 text-zinc-500">
                        {item.startTime} - {item.endTime}
                      </p>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex max-w-sm flex-wrap gap-2">
                        {item.assignedEmployees.map((employee) => (
                          <Badge key={employee.id}>{employee.name}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <Badge variant={getStatusVariant(item.status)}>
                        {formatEnumLabel(item.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-5 text-sm text-zinc-400">
                      {item.location || "Not specified"}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        {canManage ? (
                          <>
                            <WorkPlanFormDialog
                              buttonVariant="secondary"
                              employees={data.employees}
                              item={item}
                            />
                            <DeleteConfirmDialog
                              action={deleteWorkPlanAction}
                              description="Removing this plan also removes its assignments from the shared schedule."
                              title="Delete work plan"
                              value={item.id}
                            />
                          </>
                        ) : (
                          <Badge variant="neutral">Assigned view</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
