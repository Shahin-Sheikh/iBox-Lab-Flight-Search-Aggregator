import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** A shimmering placeholder block used while content loads. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
}
