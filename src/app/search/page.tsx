import { Suspense } from "react";
import { SearchForm } from "@/features/search/search-form";
import { FlightResults } from "@/features/flights/flight-results";
import { FlightResultsSkeleton } from "@/features/flights/flight-results-skeleton";
import { parseSearchCriteria } from "@/lib/search-params";
import { todayDateString } from "@/lib/datetime";
import { toURLSearchParams, type RawSearchParams } from "@/lib/next-params";
import type { SearchFormValues } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = toURLSearchParams(await searchParams);
  const criteria = parseSearchCriteria(params);
  const today = todayDateString();

  const defaults: SearchFormValues = criteria
    ? {
        origin: criteria.origin,
        destination: criteria.destination,
        date: criteria.date,
        passengers: criteria.passengers,
      }
    : { origin: "JFK", destination: "LHR", date: today, passengers: 1 };

  // Keep an already-searched (possibly past) date selectable rather than forcing today.
  const minDate = criteria && criteria.date < today ? criteria.date : today;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <SearchForm defaultValues={defaults} minDate={minDate} variant="compact" />
      </div>

      <div className="mt-6">
        <Suspense fallback={<FlightResultsSkeleton />}>
          <FlightResults />
        </Suspense>
      </div>
    </div>
  );
}
