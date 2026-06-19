import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, "aria-invalid": ariaInvalid, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-slate-900 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            ariaInvalid ? "border-red-400 focus:ring-red-500/30" : "border-slate-300",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.853a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  },
);
