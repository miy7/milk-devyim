import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/form-controls";
import { StatCard } from "@/components/ui/stat-card";
import { requireSectionAccess } from "@/lib/auth/session";
import { getReportsData } from "@/lib/data";
import { formatCurrency, formatShortDate } from "@/lib/utils";

function barHeight(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return 16;
  }

  return Math.max(16, Math.round((value / maxValue) * 220));
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSectionAccess("reports");
  const filters = await searchParams;
  const data = await getReportsData({
    from: firstValue(filters.from),
    to: firstValue(filters.to),
  });
  const maxBarValue = Math.max(...data.financeSeries.map((item) => item.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Management summaries and export-ready reporting
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          Review work plan throughput, employee finance totals, and reporting ranges ready
          for export or presentation.
        </p>
      </div>

      <Card className="p-5">
        <form className="grid gap-4 md:grid-cols-3">
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
          <div className="flex items-end">
            <Button className="w-full" type="submit" variant="secondary">
              Refresh report
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          detail="All work plans in the selected period."
          eyebrow="PL"
          label="Work plan summary"
          value={String(data.overview.totalPlans)}
        />
        <StatCard
          detail="Currently active employees on record."
          eyebrow="EM"
          label="Active employees"
          value={String(data.overview.activeEmployees)}
        />
        <StatCard
          detail="Net payable value in the selected range."
          eyebrow="NP"
          label="Finance summary"
          value={formatCurrency(data.overview.netPayable)}
        />
        <StatCard
          detail="Bonus adjustments captured in period."
          eyebrow="BN"
          label="Total bonus"
          value={formatCurrency(data.overview.totalBonus)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Finance trend</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Daily payable totals</h2>
            </div>
            <Badge variant="info">Export-ready scaffold</Badge>
          </div>
          <div className="mt-8 flex min-h-[280px] items-end gap-3">
            {data.financeSeries.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-8 text-sm text-zinc-500">
                No finance activity in the selected range.
              </div>
            ) : (
              data.financeSeries.map((item) => (
                <div key={item.dateKey} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(59,130,246,0.22))]"
                    style={{ height: `${barHeight(item.total, maxBarValue)}px` }}
                  />
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">{formatShortDate(item.dateKey)}</p>
                    <p className="mt-1 text-xs font-medium text-white">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Plan status</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Work plan breakdown</h2>
            <div className="mt-6 space-y-3">
              {[
                ["Pending", data.statusSummary.pending],
                ["In progress", data.statusSummary.inProgress],
                ["Completed", data.statusSummary.completed],
                ["Cancelled", data.statusSummary.cancelled],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-sm text-zinc-300">{label}</p>
                  <p className="text-lg font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Cadence totals</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Daily / weekly / monthly</h2>
            <div className="mt-6 space-y-3">
              {[
                ["Daily total", data.cadenceTotals.daily],
                ["Weekly total", data.cadenceTotals.weekly],
                ["Monthly total", data.cadenceTotals.monthly],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-sm text-zinc-300">{label}</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(Number(value))}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Report notes</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Management-ready structure</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-400">
              <p>Daily, weekly, and monthly totals can be exported from this page structure.</p>
              <p>Chart slots are intentionally lightweight so a BI layer or chart library can be added later.</p>
              <p>
                Deduction totals include advances to better reflect operational cash exposure.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
