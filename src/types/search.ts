import type { AirportCode, CabinClass } from "./flight";

/** The four primary inputs a user provides to search for flights. */
export interface SearchCriteria {
  origin: AirportCode;
  destination: AirportCode;
  /** Departure date as `yyyy-MM-dd`. */
  date: string;
  /** Passenger count (1–9). */
  passengers: number;
}

export const SORT_OPTIONS = [
  "best",
  "cheapest",
  "fastest",
  "earliest_departure",
  "latest_departure",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

/** Time-of-day buckets used by the departure-time filter. */
export const DEPARTURE_WINDOWS = ["early", "morning", "afternoon", "evening"] as const;
export type DepartureWindow = (typeof DEPARTURE_WINDOWS)[number];

/**
 * Client-side filters applied to the result set. All fields are optional;
 * an empty/undefined field means "no constraint on this attribute".
 */
export interface FlightFilters {
  /** Selected stop counts. Empty set = any. We bucket 2+ stops under `2`. */
  maxStops?: number;
  /** Airline codes to include. Empty = all airlines. */
  airlines: string[];
  /** Cabin classes to include. Empty = all. */
  cabinClasses: CabinClass[];
  /** Inclusive upper bound on per-passenger price. */
  maxPrice?: number;
  /** Departure-time-of-day buckets to include. Empty = all. */
  departureWindows: DepartureWindow[];
}

export const EMPTY_FILTERS: FlightFilters = {
  airlines: [],
  cabinClasses: [],
  departureWindows: [],
};
