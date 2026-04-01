"use client";

import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-controls";
import { formatCurrency, formatEnumLabel, formatShortDate } from "@/lib/utils";
import type { EmployeesPageData } from "@/types";

function getStatusVariant(status: string) {
  return status === "ACTIVE" ? ("success" as const) : ("neutral" as const);
}

export function EmployeesClient({
  canManage,
  data,
}: {
  canManage: boolean;
  data: EmployeesPageData;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Employees</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Workforce roster and profile management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Keep position, rate, access role, and employment status aligned across the
            system.
          </p>
        </div>
        {canManage ? <EmployeeFormDialog /> : null}
      </div>

      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Status
            </label>
            <Select defaultValue={data.filters.status} name="status">
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Search
            </label>
            <Input defaultValue={data.filters.search} name="search" placeholder="Name or phone" />
          </div>
          <div className="flex items-end">
            <Button className="w-full" type="submit" variant="secondary">
              Apply filters
            </Button>
          </div>
        </form>
      </Card>

      {data.employees.length === 0 ? (
        <EmptyState
          action={canManage ? <EmployeeFormDialog buttonVariant="secondary" /> : null}
          description="No employee records match the current filter settings."
          title="No employees found"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.25em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Role / status</th>
                  <th className="px-5 py-4">Rate</th>
                  <th className="px-5 py-4">Ops detail</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.employees.map((employee) => (
                  <tr key={employee.id} className="align-top">
                    <td className="px-5 py-5">
                      <p className="font-semibold text-white">{employee.fullName}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {employee.nickname ? `${employee.nickname} • ` : ""}
                        {employee.position}
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">{employee.phone || "No phone"}</p>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{formatEnumLabel(employee.role)}</Badge>
                        <Badge variant={getStatusVariant(employee.status)}>
                          {formatEnumLabel(employee.status)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-sm text-zinc-300">
                      {formatCurrency(employee.dailyRate)}
                    </td>
                    <td className="px-5 py-5 text-sm text-zinc-400">
                      <p>{employee.activeAssignments} active assignments tracked</p>
                      <p className="mt-2">
                        Last finance entry:{" "}
                        {employee.lastFinanceDate ? formatShortDate(employee.lastFinanceDate) : "No records"}
                      </p>
                      <p className="mt-2">{employee.linkedUserName || "No linked user account"}</p>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        {canManage ? (
                          <EmployeeFormDialog buttonVariant="secondary" item={employee} />
                        ) : (
                          <Badge variant="neutral">Read only</Badge>
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
