"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { useBookingFlowStore } from "@/store/booking-flow-store";
import type { Booking, BookingRequest } from "@/types";

/**
 * Create a booking. On success the result is seeded into the query cache and
 * the booking-flow store so the confirmation page renders instantly (and is
 * still refetchable by reference on refresh).
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const setLastBooking = useBookingFlowStore((state) => state.setLastBooking);

  return useMutation<Booking, Error, BookingRequest>({
    mutationFn: (payload) => bookingsApi.create(payload),
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.bookings.detail(booking.reference), booking);
      setLastBooking(booking);
    },
  });
}
