import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: "border-white/10 bg-white/[0.06] text-zinc-200",
  success: "border-emerald-500/20 bg-emerald-500/12 text-emerald-200",
  warning: "border-amber-500/20 bg-amber-500/12 text-amber-200",
  danger: "border-red-500/20 bg-red-500/12 text-red-200",
  info: "border-sky-500/20 bg-sky-500/12 text-sky-200",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        badgeStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
