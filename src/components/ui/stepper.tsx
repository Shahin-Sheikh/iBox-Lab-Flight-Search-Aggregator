import { cn } from "@/lib/cn";

interface StepperProps {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
}

/** Linear progress indicator for the booking flow. */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex items-center gap-2", className)} aria-label="Booking progress">
      {steps.map((step, index) => {
        const isComplete = index < current;
        const isCurrent = index === current;
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                isComplete && "bg-brand-600 text-white",
                isCurrent && "bg-brand-600 text-white ring-4 ring-brand-100",
                !isComplete && !isCurrent && "bg-slate-100 text-slate-500",
              )}
            >
              {isComplete ? "✓" : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                isCurrent ? "font-medium text-slate-900" : "text-slate-500",
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn("h-px flex-1", isComplete ? "bg-brand-300" : "bg-slate-200")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
