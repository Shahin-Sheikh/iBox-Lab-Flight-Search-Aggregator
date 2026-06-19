import type { CabinClass, Flight, SearchCriteria } from "@/types";
import { AIRPORTS } from "./airports";
import { AIRLINES } from "./airlines";
import rawFlights from "./flights.json";
import {
  addDaysToDateString,
  minutesToTime,
  timeToMinutes,
} from "@/lib/datetime";

/**
 * Shape of a record in `flights.json`. Times are stored as an origin-local
 * departure clock time; arrival is derived from duration + airport offsets so
 * there is a single source of truth.
 */
interface RawFlight {
  id: string;
  airlineCode: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  departureTimeLocal: string;
  durationMinutes: number;
  stops: number;
  layovers: { airportCode: string; minutes: number }[];
  cabinClass: CabinClass;
  price: number;
  currency: string;
  seatsAvailable: number;
}

const RAW_FLIGHTS = rawFlights as unknown as RawFlight[];

/**
 * The single route covered by the mock dataset, stored unordered so either
 * direction (JFK→LHR or LHR→JFK) is considered "served".
 */
const SERVED_ROUTE = new Set(["JFK", "LHR"]);

function routeKey(a: string, b: string): string {
  return [a, b].sort().join("-");
}

function isRouteServed(origin: string, destination: string): boolean {
  return (
    origin !== destination &&
    SERVED_ROUTE.has(origin) &&
    SERVED_ROUTE.has(destination) &&
    routeKey(origin, destination) === routeKey("JFK", "LHR")
  );
}

/**
 * Hydrate a raw record into a full Flight for a given departure date and
 * travel direction. Arrival wall-clock time is derived as:
 *   arrival = departure + duration + (destOffset − originOffset)
 */
function hydrate(raw: RawFlight, date: string, origin: string, destination: string): Flight {
  const originAirport = AIRPORTS[origin];
  const destinationAirport = AIRPORTS[destination];
  const airline = AIRLINES[raw.airlineCode];
  if (!originAirport || !destinationAirport || !airline) {
    throw new Error(`Unable to hydrate flight ${raw.id}: missing reference data`);
  }

  const departureMinutes = timeToMinutes(raw.departureTimeLocal);
  const offsetDelta = destinationAirport.utcOffsetMinutes - originAirport.utcOffsetMinutes;
  const arrivalAbsoluteMinutes = departureMinutes + raw.durationMinutes + offsetDelta;
  const arrivalDayOffset = Math.floor(arrivalAbsoluteMinutes / 1440);
  const arrivalDate = addDaysToDateString(date, arrivalDayOffset);

  return {
    id: raw.id,
    airline,
    flightNumber: raw.flightNumber,
    origin: originAirport,
    destination: destinationAirport,
    departureTime: `${date}T${raw.departureTimeLocal}:00`,
    arrivalTime: `${arrivalDate}T${minutesToTime(arrivalAbsoluteMinutes)}:00`,
    durationMinutes: raw.durationMinutes,
    stops: raw.stops,
    layovers: raw.layovers.map((layover) => {
      const airport = AIRPORTS[layover.airportCode];
      if (!airport) {
        throw new Error(`Unknown layover airport ${layover.airportCode} on ${raw.id}`);
      }
      return { airport, minutes: layover.minutes };
    }),
    cabinClass: raw.cabinClass,
    price: raw.price,
    currency: raw.currency,
    seatsAvailable: raw.seatsAvailable,
  };
}

/**
 * Search the mock dataset. Returns flights oriented to the requested direction
 * and date, excluding fares without enough seats for the passenger count.
 * Returns an empty array for unserved routes (drives the empty state).
 */
export function searchFlights(criteria: SearchCriteria): Flight[] {
  if (!isRouteServed(criteria.origin, criteria.destination)) {
    return [];
  }
  return RAW_FLIGHTS.filter((raw) => raw.seatsAvailable >= criteria.passengers).map((raw) =>
    hydrate(raw, criteria.date, criteria.origin, criteria.destination),
  );
}

/**
 * Look up a single flight by id for a given date/direction. Direction defaults
 * to the dataset's canonical JFK→LHR so a flight can be resolved even without
 * explicit origin/destination.
 */
export function getFlightById(
  id: string,
  date: string,
  origin = "JFK",
  destination = "LHR",
): Flight | undefined {
  const raw = RAW_FLIGHTS.find((flight) => flight.id === id);
  if (!raw) return undefined;
  return hydrate(raw, date, origin, destination);
}

export function isServedRoute(origin: string, destination: string): boolean {
  return isRouteServed(origin, destination);
}
