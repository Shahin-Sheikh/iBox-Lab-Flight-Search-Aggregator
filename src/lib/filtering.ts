import type {
  Airline,
  CabinClass,
  DepartureWindow,
  Flight,
  FlightFilters,
} from "@/types";
import { parseWallClock } from "./datetime";

/** Map a departure time to its time-of-day bucket. */
export function departureWindowOf(iso: string): DepartureWindow {
  const hour = parseWallClock(iso).getUTCHours();
  if (hour < 6) return "early";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** Does a flight satisfy every active filter constraint? */
export function matchesFilters(flight: Flight, filters: FlightFilters): boolean {
  if (filters.maxStops !== undefined && flight.stops > filters.maxStops) {
    return false;
  }
  if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline.code)) {
    return false;
  }
  if (filters.cabinClasses.length > 0 && !filters.cabinClasses.includes(flight.cabinClass)) {
    return false;
  }
  if (filters.maxPrice !== undefined && flight.price > filters.maxPrice) {
    return false;
  }
  if (
    filters.departureWindows.length > 0 &&
    !filters.departureWindows.includes(departureWindowOf(flight.departureTime))
  ) {
    return false;
  }
  return true;
}

export function filterFlights(flights: Flight[], filters: FlightFilters): Flight[] {
  return flights.filter((flight) => matchesFilters(flight, filters));
}

export interface AirlineFacet {
  airline: Airline;
  count: number;
  /** Lowest available price for this airline in the result set. */
  fromPrice: number;
}

/**
 * Derive the set of filter options available for a result set, with counts and
 * price bounds, so the filter UI reflects what's actually searchable rather
 * than a hard-coded list.
 */
export interface FlightFacets {
  airlines: AirlineFacet[];
  cabinClasses: CabinClass[];
  stopOptions: number[];
  priceRange: [number, number];
  departureWindows: DepartureWindow[];
}

const CABIN_ORDER: CabinClass[] = ["economy", "premium_economy", "business", "first"];
const WINDOW_ORDER: DepartureWindow[] = ["early", "morning", "afternoon", "evening"];

export function deriveFacets(flights: Flight[]): FlightFacets {
  if (flights.length === 0) {
    return {
      airlines: [],
      cabinClasses: [],
      stopOptions: [],
      priceRange: [0, 0],
      departureWindows: [],
    };
  }

  const airlineMap = new Map<string, AirlineFacet>();
  const cabins = new Set<CabinClass>();
  const stops = new Set<number>();
  const windows = new Set<DepartureWindow>();
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const flight of flights) {
    const existing = airlineMap.get(flight.airline.code);
    if (existing) {
      existing.count += 1;
      existing.fromPrice = Math.min(existing.fromPrice, flight.price);
    } else {
      airlineMap.set(flight.airline.code, {
        airline: flight.airline,
        count: 1,
        fromPrice: flight.price,
      });
    }
    cabins.add(flight.cabinClass);
    stops.add(flight.stops);
    windows.add(departureWindowOf(flight.departureTime));
    minPrice = Math.min(minPrice, flight.price);
    maxPrice = Math.max(maxPrice, flight.price);
  }

  return {
    airlines: [...airlineMap.values()].sort((a, b) =>
      a.airline.name.localeCompare(b.airline.name),
    ),
    cabinClasses: CABIN_ORDER.filter((cabin) => cabins.has(cabin)),
    stopOptions: [...stops].sort((a, b) => a - b),
    priceRange: [minPrice, maxPrice],
    departureWindows: WINDOW_ORDER.filter((window) => windows.has(window)),
  };
}
