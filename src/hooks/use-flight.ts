"use client";

import { useQuery } from "@tanstack/react-query";
import { flightsApi, type FlightDetailParams } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Flight } from "@/types";

/**
 * Fetch a single flight by id for a given date/direction. An optional
 * `initialData` (e.g. the flight already in the booking-flow store) lets the
 * review page render instantly while staying refetchable on direct navigation.
 */
export function useFlight(
  id: string | null,
  params: FlightDetailParams | null,
  initialData?: Flight,
) {
  const enabled = id !== null && params !== null;
  return useQuery({
    queryKey: enabled
      ? queryKeys.flights.detail(
          id,
          params.date,
          params.origin ?? "JFK",
          params.destination ?? "LHR",
        )
      : [...queryKeys.flights.all, "detail", "idle"],
    queryFn: ({ signal }) => flightsApi.getById(id as string, params as FlightDetailParams, signal),
    enabled,
    initialData,
    staleTime: 60_000,
  });
}
