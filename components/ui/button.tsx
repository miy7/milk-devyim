import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
) {
  return cn(
    "inline-flex items-center justify-center rounded-2xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-50",
    size === "md" ? "h-11 px-5" : "h-9 px-4 text-xs",
    variant === "primary" &&
      "border-white/10 bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.08)] hover:bg-zinc-200",
    variant === "secondary" &&
      "border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]",
    variant === "ghost" && "border-transparent bg-transparent text-zinc-300 hover:bg-white/[0.05]",
    variant === "danger" &&
      "border-red-500/20 bg-red-500/12 text-red-100 hover:bg-red-500/18",
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={cn(buttonStyles(variant, size), className)} {...props} />;
}
