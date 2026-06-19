import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "error" | "info" | "warning";

const TONES: Record<Tone, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
  /** Optional action area (e.g. a Retry button). */
  action?: ReactNode;
}

export function Alert({ tone = "info", title, children, className, action }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between", TONES[tone], className)}
    >
      <div className="space-y-0.5">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children ? <div className="text-sm">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
