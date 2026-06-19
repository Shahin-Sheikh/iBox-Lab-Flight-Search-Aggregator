"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Booking } from "@/types";

/**
 * Fetch a booking by reference. Used by the confirmation page so it works on a
 * fresh load / refresh even when the in-memory store is empty.
 */
export function useBooking(reference: string | null, initialData?: Booking) {
  return useQuery({
    queryKey: reference
      ? queryKeys.bookings.detail(reference)
      : ["bookings", "idle"],
    queryFn: ({ signal }) => bookingsApi.getByReference(reference as string, signal),
    enabled: reference !== null,
    initialData,
    staleTime: Infinity,
  });
}
