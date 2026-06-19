"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Flight } from "@/types";
import { ApiError } from "@/types";
import { useFlightSearch } from "@/hooks/use-flight-search";
import { useSearchUrlState } from "@/hooks/use-search-url-state";
import { useBookingFlowStore } from "@/store/booking-flow-store";
import { deriveFacets, filterFlights } from "@/lib/filtering";
import { sortFlights } from "@/lib/sorting";
import { buildCriteriaQuery, hasActiveFilters } from "@/lib/search-params";
import { Alert, Button, EmptyState } from "@/components/ui";
import { AlertTriangleIcon, FilterIcon, SearchIcon } from "@/components/icons";
import { ResultsSummary } from "./results-summary";
import { SortControl } from "./sort-control";
import { FilterPanel } from "./filter-panel";
import { FlightList } from "./flight-list";
import { FlightResultsSkeleton } from "./flight-results-skeleton";

export function FlightResults() {
  const router = useRouter();
  const { state, setFilters, setSort, resetFilters } = useSearchUrlState();
  const selectFlight = useBookingFlowStore((store) => store.selectFlight);
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);

  const criteria = state?.criteria ?? null;
  const query = useFlightSearch(criteria);

  const allFlights = useMemo(() => query.data?.results ?? [], [query.data]);
  const facets = useMemo(() => deriveFacets(allFlights), [allFlights]);
  const visibleFlights = useMemo(
    () => (state ? sortFlights(filterFlights(allFlights, state.filters), state.sort) : []),
    [allFlights, state],
  );

  // No valid search in the URL — prompt the user back to search.
  if (!state) {
    return (
      <EmptyState
        icon={<SearchIcon className="h-8 w-8" />}
        title="Start a search"
        description="Enter an origin, destination, date and passengers to see available flights."
        action={
          <Link href="/">
            <Button>Go to search</Button>
          </Link>
        }
      />
    );
  }

  // `state` is non-null past the guard above; capture it so nested closures
  // (renderResults / handleSelect) keep the narrowed type.
  const { criteria: searchCriteria, filters, sort } = state;
  const currency = allFlights[0]?.currency ?? "USD";

  function handleSelect(flight: Flight) {
    selectFlight(flight, searchCriteria);
    router.push(`/book/${flight.id}?${buildCriteriaQuery(searchCriteria)}`);
  }

  function renderResults() {
    if (query.isLoading) {
      return <FlightResultsSkeleton />;
    }

    if (query.isError) {
      const message =
        query.error instanceof ApiError
          ? query.error.message
          : "Something went wrong while loading flights.";
      return (
        <Alert
          tone="error"
          title="We couldn't load flights"
          action={
            <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
              Try again
            </Button>
          }
        >
          {message}
        </Alert>
      );
    }

    if (allFlights.length === 0) {
      return (
        <EmptyState
          icon={<AlertTriangleIcon className="h-8 w-8" />}
          title="No flights on this route"
          description="The mock dataset covers New York (JFK) ⇄ London (LHR). Try that route, or a different date/passenger count."
          action={
            <Link href="/">
              <Button variant="secondary">Edit search</Button>
            </Link>
          }
        />
      );
    }

    if (visibleFlights.length === 0) {
      return (
        <EmptyState
          icon={<FilterIcon className="h-8 w-8" />}
          title="No flights match your filters"
          description="Try relaxing or clearing your filters to see more options."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      );
    }

    return (
      <FlightList
        flights={visibleFlights}
        passengers={searchCriteria.passengers}
        onSelect={handleSelect}
      />
    );
  }

  const showFilters = allFlights.length > 0 && !query.isError;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        {showFilters ? (
          <>
            <Button
              variant="secondary"
              fullWidth
              className="mb-3 lg:hidden"
              onClick={() => setFiltersOpenMobile((open) => !open)}
            >
              <FilterIcon className="h-4 w-4" />
              {filtersOpenMobile ? "Hide filters" : "Show filters"}
              {hasActiveFilters(filters) ? (
                <span className="ml-1 h-2 w-2 rounded-full bg-brand-600" />
              ) : null}
            </Button>
            <div className={filtersOpenMobile ? "block" : "hidden lg:block"}>
              <FilterPanel
                facets={facets}
                filters={filters}
                currency={currency}
                onChange={setFilters}
                onReset={resetFilters}
              />
            </div>
          </>
        ) : null}
      </aside>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ResultsSummary
            criteria={searchCriteria}
            shownCount={visibleFlights.length}
            totalCount={allFlights.length}
          />
          {showFilters ? <SortControl value={sort} onChange={setSort} /> : null}
        </div>
        {renderResults()}
      </section>
    </div>
  );
}
