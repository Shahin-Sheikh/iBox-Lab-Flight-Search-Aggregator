/**
 * Core flight domain types.
 *
 * Times are intentionally modelled as airport-local "wall-clock" ISO strings
 * (e.g. `2026-06-25T08:30:00`, no timezone offset). The mock data layer does
 * not perform timezone conversion — `durationMinutes` is the authoritative
 * source of truth for how long a flight takes. See ARCHITECTURE.md for the
 * rationale behind this trade-off.
 */

export type AirportCode = string; // IATA 3-letter code, e.g. "JFK"

export interface Airport {
  /** IATA code, e.g. "JFK" */
  code: AirportCode;
  name: string;
  city: string;
  country: string;
  /**
   * Approximate fixed UTC offset in minutes (DST ignored). Used by the mock
   * API to derive arrival wall-clock times from departure + duration.
   */
  utcOffsetMinutes: number;
}

export interface Airline {
  /** IATA code, e.g. "BA" */
  code: string;
  name: string;
}

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface Layover {
  airport: Airport;
  /** Minutes spent on the ground at the layover airport. */
  minutes: number;
}

/**
 * A fully hydrated flight as consumed by the UI. The mock API resolves the
 * normalized raw records (airline/airport codes) into these rich objects.
 */
export interface Flight {
  id: string;
  airline: Airline;
  /** e.g. "BA178" */
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  /** Airport-local ISO datetime at origin. */
  departureTime: string;
  /** Airport-local ISO datetime at destination. */
  arrivalTime: string;
  /** Authoritative total travel time in minutes. */
  durationMinutes: number;
  /** Number of stops (0 = non-stop). `layovers.length === stops`. */
  stops: number;
  layovers: Layover[];
  cabinClass: CabinClass;
  /** Per-passenger price. */
  price: number;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string;
  /** Remaining seats at this fare; used to validate passenger counts. */
  seatsAvailable: number;
}
