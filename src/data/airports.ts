import type { Airport, AirportCode } from "@/types";

/**
 * Airport reference data. `utcOffsetMinutes` is an approximate fixed offset
 * (DST ignored) used only by the mock API to derive arrival times.
 */
export const AIRPORTS: Record<AirportCode, Airport> = {
  JFK: { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "United States", utcOffsetMinutes: -240 },
  LHR: { code: "LHR", name: "Heathrow", city: "London", country: "United Kingdom", utcOffsetMinutes: 60 },
  BOS: { code: "BOS", name: "Logan International", city: "Boston", country: "United States", utcOffsetMinutes: -240 },
  ORD: { code: "ORD", name: "O'Hare International", city: "Chicago", country: "United States", utcOffsetMinutes: -300 },
  YYZ: { code: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "Canada", utcOffsetMinutes: -240 },
  KEF: { code: "KEF", name: "Keflavík International", city: "Reykjavík", country: "Iceland", utcOffsetMinutes: 0 },
  DUB: { code: "DUB", name: "Dublin", city: "Dublin", country: "Ireland", utcOffsetMinutes: 60 },
  CDG: { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", utcOffsetMinutes: 120 },
  AMS: { code: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands", utcOffsetMinutes: 120 },
  FRA: { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany", utcOffsetMinutes: 120 },
  MAD: { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "Spain", utcOffsetMinutes: 120 },
  LAX: { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "United States", utcOffsetMinutes: -420 },
};

/** Airports offered in the search form's origin/destination selectors. */
export const SELECTABLE_AIRPORT_CODES: AirportCode[] = [
  "JFK",
  "LHR",
  "BOS",
  "ORD",
  "YYZ",
  "CDG",
  "AMS",
  "FRA",
  "MAD",
  "LAX",
];

export const SELECTABLE_AIRPORTS: Airport[] = SELECTABLE_AIRPORT_CODES.map(
  (code) => AIRPORTS[code]!,
);

export function getAirport(code: AirportCode): Airport | undefined {
  return AIRPORTS[code];
}
