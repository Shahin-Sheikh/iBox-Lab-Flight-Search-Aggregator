"use client";

import { useQuery } from "@tanstack/react-query";
import { flightsApi } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { SearchCriteria } from "@/types";

/**
 * Fetch the flight result set for the given criteria. Disabled (idle) until a
 * valid criteria object is available, so the results page can render its empty
 * "start a search" state without firing a request.
 */
export function useFlightSearch(criteria: SearchCriteria | null) {
  return useQuery({
    queryKey: criteria
      ? queryKeys.flights.search(criteria)
      : [...queryKeys.flights.all, "idle"],
    queryFn: ({ signal }) => flightsApi.search(criteria as SearchCriteria, signal),
    enabled: criteria !== null,
    staleTime: 60_000,
  });
}
