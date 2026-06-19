import { z } from "zod";
import type {
  CabinClass,
  DepartureWindow,
  FlightFilters,
  SearchCriteria,
  SortOption,
} from "@/types";
import { DEPARTURE_WINDOWS, EMPTY_FILTERS, SORT_OPTIONS } from "@/types";
import { isRealCalendarDate } from "./validation";

/**
 * The URL is the single source of truth for search criteria, filters and sort.
 * This module is the only place that knows the wire format of those params, so
 * the rest of the app deals in typed objects.
 */

export const PARAM_KEYS = {
  origin: "from",
  destination: "to",
  date: "date",
  passengers: "pax",
  sort: "sort",
  stops: "stops",
  airlines: "airlines",
  cabin: "cabin",
  maxPrice: "maxPrice",
  departure: "depart",
} as const;

const CABIN_VALUES: CabinClass[] = ["economy", "premium_economy", "business", "first"];

/** Minimal interface satisfied by both URLSearchParams and Next's ReadonlyURLSearchParams. */
export interface ReadableParams {
  get(name: string): string | null;
}

const criteriaSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  date: z.string().refine(isRealCalendarDate),
  passengers: z.coerce.number().int().min(1).max(9),
});

/** Parse search criteria from URL params; returns null when incomplete/invalid. */
export function parseSearchCriteria(params: ReadableParams): SearchCriteria | null {
  const parsed = criteriaSchema.safeParse({
    origin: params.get(PARAM_KEYS.origin),
    destination: params.get(PARAM_KEYS.destination),
    date: params.get(PARAM_KEYS.date),
    passengers: params.get(PARAM_KEYS.passengers),
  });
  if (!parsed.success || parsed.data.origin === parsed.data.destination) {
    return null;
  }
  return parsed.data;
}

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseFilters(params: ReadableParams): FlightFilters {
  const stopsRaw = params.get(PARAM_KEYS.stops);
  const maxStops = stopsRaw !== null && /^\d+$/.test(stopsRaw) ? Number(stopsRaw) : undefined;

  const maxPriceRaw = params.get(PARAM_KEYS.maxPrice);
  const maxPrice =
    maxPriceRaw !== null && /^\d+$/.test(maxPriceRaw) ? Number(maxPriceRaw) : undefined;

  const cabinClasses = parseCsv(params.get(PARAM_KEYS.cabin)).filter((value): value is CabinClass =>
    (CABIN_VALUES as string[]).includes(value),
  );

  const departureWindows = parseCsv(params.get(PARAM_KEYS.departure)).filter(
    (value): value is DepartureWindow => (DEPARTURE_WINDOWS as readonly string[]).includes(value),
  );

  return {
    maxStops,
    airlines: parseCsv(params.get(PARAM_KEYS.airlines)),
    cabinClasses,
    maxPrice,
    departureWindows,
  };
}

export function parseSort(params: ReadableParams): SortOption {
  const value = params.get(PARAM_KEYS.sort);
  return (SORT_OPTIONS as readonly string[]).includes(value ?? "")
    ? (value as SortOption)
    : "best";
}

export interface SearchState {
  criteria: SearchCriteria;
  filters: FlightFilters;
  sort: SortOption;
}

export function parseSearchState(params: ReadableParams): SearchState | null {
  const criteria = parseSearchCriteria(params);
  if (!criteria) return null;
  return {
    criteria,
    filters: parseFilters(params),
    sort: parseSort(params),
  };
}

/** Serialize just the criteria — used when navigating from the search form. */
export function buildCriteriaQuery(criteria: SearchCriteria): string {
  const params = new URLSearchParams();
  params.set(PARAM_KEYS.origin, criteria.origin);
  params.set(PARAM_KEYS.destination, criteria.destination);
  params.set(PARAM_KEYS.date, criteria.date);
  params.set(PARAM_KEYS.passengers, String(criteria.passengers));
  return params.toString();
}

/** Serialize the full search state (criteria + filters + sort). */
export function buildSearchQuery(state: SearchState): string {
  const params = new URLSearchParams(buildCriteriaQuery(state.criteria));
  const { filters, sort } = state;

  if (sort !== "best") params.set(PARAM_KEYS.sort, sort);
  if (filters.maxStops !== undefined) params.set(PARAM_KEYS.stops, String(filters.maxStops));
  if (filters.maxPrice !== undefined) params.set(PARAM_KEYS.maxPrice, String(filters.maxPrice));
  if (filters.airlines.length > 0) params.set(PARAM_KEYS.airlines, filters.airlines.join(","));
  if (filters.cabinClasses.length > 0) params.set(PARAM_KEYS.cabin, filters.cabinClasses.join(","));
  if (filters.departureWindows.length > 0) {
    params.set(PARAM_KEYS.departure, filters.departureWindows.join(","));
  }

  return params.toString();
}

export function hasActiveFilters(filters: FlightFilters): boolean {
  return (
    filters.maxStops !== undefined ||
    filters.maxPrice !== undefined ||
    filters.airlines.length > 0 ||
    filters.cabinClasses.length > 0 ||
    filters.departureWindows.length > 0
  );
}

export { EMPTY_FILTERS };
