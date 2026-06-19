import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  /** Optional right-aligned secondary text (e.g. a count or price). */
  meta?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, meta, className, ...props },
  ref,
) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        {...props}
      />
      <span className="flex-1">{label}</span>
      {meta ? <span className="text-xs text-slate-400">{meta}</span> : null}
    </label>
  );
});
