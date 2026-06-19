import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, "aria-invalid": ariaInvalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm",
          "placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500",
          "disabled:cursor-not-allowed disabled:bg-slate-50",
          ariaInvalid ? "border-red-400 focus:ring-red-500/30 focus:border-red-500" : "border-slate-300",
          className,
        )}
        {...props}
      />
    );
  },
);
