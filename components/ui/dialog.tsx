"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

export function Dialog({
  children,
  description,
  onClose,
  open,
  title,
  width = "xl",
}: {
  children: ReactNode;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
  width?: "lg" | "xl" | "2xl";
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "relative max-h-[90vh] w-full overflow-y-auto rounded-[32px] border border-white/10 bg-[#08080b] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:p-8",
          width === "lg" && "max-w-2xl",
          width === "xl" && "max-w-4xl",
          width === "2xl" && "max-w-6xl",
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
            {description ? <p className="mt-2 text-sm text-zinc-400">{description}</p> : null}
          </div>
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 transition hover:bg-white/[0.08]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
