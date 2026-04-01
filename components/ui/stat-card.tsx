import { Card } from "@/components/ui/card";

export function StatCard({
  eyebrow,
  label,
  value,
  detail,
}: {
  eyebrow: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
            {eyebrow}
          </p>
          <p className="text-sm text-zinc-400">{label}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/90">
          {eyebrow.slice(0, 2)}
        </div>
      </div>
      <div className="mt-8 space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        <p className="text-sm text-zinc-500">{detail}</p>
      </div>
    </Card>
  );
}
