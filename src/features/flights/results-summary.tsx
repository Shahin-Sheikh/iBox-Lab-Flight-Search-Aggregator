import type { SearchCriteria } from "@/types";
import { getAirport } from "@/data/airports";
import { ArrowRightIcon } from "@/components/icons";
import { formatFullDate } from "@/lib/datetime";
import { passengersLabel } from "@/lib/format";

interface ResultsSummaryProps {
  criteria: SearchCriteria;
  /** Flights shown after filtering. */
  shownCount: number;
  /** Total flights available before filtering. */
  totalCount: number;
}

export function ResultsSummary({ criteria, shownCount, totalCount }: ResultsSummaryProps) {
  const origin = getAirport(criteria.origin);
  const destination = getAirport(criteria.destination);

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span>{origin?.city ?? criteria.origin}</span>
          <ArrowRightIcon className="h-4 w-4 text-slate-400" />
          <span>{destination?.city ?? criteria.destination}</span>
        </h1>
        <p className="text-sm text-slate-500">
          {formatFullDate(criteria.date)} · {passengersLabel(criteria.passengers)}
        </p>
      </div>
      <p className="text-sm text-slate-500" aria-live="polite">
        Showing <span className="font-semibold text-slate-700">{shownCount}</span> of {totalCount}{" "}
        {totalCount === 1 ? "flight" : "flights"}
      </p>
    </div>
  );
}
