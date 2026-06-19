"use client";

import Link from "next/link";
import { ApiError } from "@/types";
import { useBooking } from "@/hooks/use-booking";
import { useBookingFlowStore } from "@/store/booking-flow-store";
import { Alert, Button, EmptyState, Skeleton } from "@/components/ui";
import { BookingConfirmation } from "./booking-confirmation";

/**
 * Resolves a booking by reference. Renders instantly from the store when the
 * user just booked, and refetches from the API on a cold load / refresh.
 */
export function BookingConfirmationView({ reference }: { reference: string }) {
  const lastBooking = useBookingFlowStore((store) => store.lastBooking);
  const initialData =
    lastBooking && lastBooking.reference === reference ? lastBooking : undefined;

  const query = useBooking(reference, initialData);

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-6 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        {notFound ? (
          <EmptyState
            title="Booking not found"
            description="We couldn't find a booking with that reference. It may have expired in this demo (bookings are kept in memory only)."
            action={
              <Link href="/">
                <Button>Back to search</Button>
              </Link>
            }
          />
        ) : (
          <Alert
            tone="error"
            title="We couldn't load your booking"
            action={
              <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
                Try again
              </Button>
            }
          >
            {query.error instanceof ApiError
              ? query.error.message
              : "Something went wrong loading your booking."}
          </Alert>
        )}
      </div>
    );
  }

  if (!query.data) return null;

  return <BookingConfirmation booking={query.data} />;
}
