"use client";

import { deleteFinanceAction } from "@/app/_actions/finance";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import { FinanceFormDialog } from "@/components/finance/finance-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-controls";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatEnumLabel, formatShortDate } from "@/lib/utils";
import type { FinancePageData } from "@/types";

function getPaymentVariant(status: string) {
  if (status === "PAID") return "success" as const;
  if (status === "PARTIAL") return "warning" as const;
  return "info" as const;
}

export function FinanceClient({ data }: { data: FinancePageData }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Employee finance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Daily wage, bonus, and payout tracking
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Capture payroll-adjacent data per day so managers can verify payable totals and
            close out records cleanly.
          </p>
        </div>
        <FinanceFormDialog employees={data.employees} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="Base wages within the current filter set."
          eyebrow="WG"
          label="Total wages"
          value={formatCurrency(data.summary.totalWages)}
        />
        <StatCard
          detail="All bonus adjustments in the selected range."
          eyebrow="BN"
          label="Total bonus"
          value={formatCurrency(data.summary.totalBonus)}
        />
        <StatCard
          detail="Deductions plus advance payments."
          eyebrow="DD"
          label="Total deductions"
          value={formatCurrency(data.summary.totalDeductions)}
        />
        <StatCard
          detail="Calculated net payable after adjustments."
          eyebrow="NP"
          label="Net payable"
          value={formatCurrency(data.summary.netPayable)}
        />
      </div>

      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-5">
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
              From
            </label>
            <Input defaultValue={data.filters.from} name="from" type="date" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              To
            </label>
            <Input defaultValue={data.filters.to} name="to" type="date" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
              Search
            </label>
            <Input
              defaultValue={data.filters.search}
              name="search"
              placeholder="Reference or employee"
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" type="submit" variant="secondary">
              Apply filters
            </Button>
          </div>
        </form>
      </Card>

      {data.records.length === 0 ? (
        <EmptyState
          action={<FinanceFormDialog buttonVariant="secondary" employees={data.employees} />}
          description="No finance entries match the current filters. Adjust the range or add a new record."
          title="No finance records found"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.25em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Amounts</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.records.map((record) => (
                  <tr key={record.id} className="align-top">
                    <td className="px-5 py-5">
                      <p className="font-semibold text-white">{record.employeeName}</p>
                    </td>
                    <td className="px-5 py-5">
                      <p className="font-medium text-white">{record.workReference}</p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                        {record.note || "No note attached"}
                      </p>
                    </td>
                    <td className="px-5 py-5 text-sm text-zinc-300">
                      {formatShortDate(record.dateKey)}
                    </td>
                    <td className="px-5 py-5 text-sm text-zinc-300">
                      <p>Wage {formatCurrency(record.dailyWage)}</p>
                      <p className="mt-1 text-zinc-500">
                        Bonus {formatCurrency(record.bonus)} • Deduction{" "}
                        {formatCurrency(record.deduction + record.advancePayment)}
                      </p>
                      <p className="mt-3 font-medium text-white">
                        Net {formatCurrency(record.totalPayable)}
                      </p>
                    </td>
                    <td className="px-5 py-5">
                      <Badge variant={getPaymentVariant(record.paymentStatus)}>
                        {formatEnumLabel(record.paymentStatus)}
                      </Badge>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        <FinanceFormDialog
                          buttonVariant="secondary"
                          employees={data.employees}
                          item={record}
                        />
                        <DeleteConfirmDialog
                          action={deleteFinanceAction}
                          description="This removes the selected finance entry from summaries and reports."
                          title="Delete finance record"
                          value={record.id}
                        />
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
