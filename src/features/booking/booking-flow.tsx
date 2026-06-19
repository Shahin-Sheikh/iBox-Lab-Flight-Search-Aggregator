"use client";

import Link from "next/link";
import type { SearchCriteria } from "@/types";
import { ApiError } from "@/types";
import { useFlight } from "@/hooks/use-flight";
import { useBookingFlowStore } from "@/store/booking-flow-store";
import { Alert, Button, Card, EmptyState, Skeleton, Stepper } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import { buildCriteriaQuery } from "@/lib/search-params";
import { FlightItinerary } from "@/features/flights/flight-itinerary";
import { BookingForm } from "./booking-form";
import { PriceSummary } from "./price-summary";

const STEPS = ["Review & details", "Confirmation"];

interface BookingFlowProps {
  flightId: string;
  criteria: SearchCriteria | null;
}

export function BookingFlow({ flightId, criteria }: BookingFlowProps) {
  const selectedFlight = useBookingFlowStore((store) => store.selectedFlight);
  const initialData =
    selectedFlight && selectedFlight.id === flightId ? selectedFlight : undefined;

  const params = criteria
    ? { date: criteria.date, origin: criteria.origin, destination: criteria.destination }
    : null;
  const query = useFlight(criteria ? flightId : null, params, initialData);

  if (!criteria) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Missing flight details"
          description="We couldn't determine which flight you were booking. Please start a new search."
          action={
            <Link href="/">
              <Button>Back to search</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const backHref = `/search?${buildCriteriaQuery(criteria)}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Stepper steps={STEPS} current={0} className="mb-6 max-w-md" />

      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
        Back to results
      </Link>

      {query.isLoading ? (
        <BookingFlowSkeleton />
      ) : query.isError ? (
        <Alert
          tone="error"
          title="We couldn't load this flight"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
                Try again
              </Button>
              <Link href={backHref}>
                <Button size="sm">Back to results</Button>
              </Link>
            </div>
          }
        >
          {query.error instanceof ApiError
            ? query.error.message
            : "Something went wrong loading this flight."}
        </Alert>
      ) : query.data ? (
        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <FlightItinerary flight={query.data} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="p-4 sm:p-6">
              <BookingForm flight={query.data} criteria={criteria} />
            </Card>
            <div className="lg:sticky lg:top-20 lg:self-start">
              <PriceSummary flight={query.data} passengers={criteria.passengers} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BookingFlowSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Skeleton className="h-24 w-full" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-4 p-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    </div>
  );
}
