"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  buildSearchQuery,
  EMPTY_FILTERS,
  parseSearchState,
  type SearchState,
} from "@/lib/search-params";
import type { FlightFilters, SortOption } from "@/types";

/**
 * Binds the results page's search/filter/sort state to the URL. Reading parses
 * the query string into typed objects; writing serializes back and replaces the
 * history entry (so filter tweaks don't pollute the back button).
 */
export function useSearchUrlState() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo(() => parseSearchState(params), [params]);

  const replaceState = useCallback(
    (next: SearchState) => {
      router.replace(`${pathname}?${buildSearchQuery(next)}`, { scroll: false });
    },
    [router, pathname],
  );

  const setFilters = useCallback(
    (filters: FlightFilters) => {
      if (state) replaceState({ ...state, filters });
    },
    [state, replaceState],
  );

  const setSort = useCallback(
    (sort: SortOption) => {
      if (state) replaceState({ ...state, sort });
    },
    [state, replaceState],
  );

  const resetFilters = useCallback(() => {
    if (state) replaceState({ ...state, filters: EMPTY_FILTERS });
  }, [state, replaceState]);

  return { state, setFilters, setSort, resetFilters };
}
