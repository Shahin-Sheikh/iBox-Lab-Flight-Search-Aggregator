import type { Flight } from "@/types";

/** Build a Flight with sensible defaults, overridable per-test. */
export function makeFlight(overrides: Partial<Flight> = {}): Flight {
  return {
    id: "FLTEST",
    airline: { code: "BA", name: "British Airways" },
    flightNumber: "BA100",
    origin: {
      code: "JFK",
      name: "John F. Kennedy International",
      city: "New York",
      country: "United States",
      utcOffsetMinutes: -240,
    },
    destination: {
      code: "LHR",
      name: "Heathrow",
      city: "London",
      country: "United Kingdom",
      utcOffsetMinutes: 60,
    },
    departureTime: "2026-06-25T08:00:00",
    arrivalTime: "2026-06-25T20:00:00",
    durationMinutes: 420,
    stops: 0,
    layovers: [],
    cabinClass: "economy",
    price: 500,
    currency: "USD",
    seatsAvailable: 9,
    ...overrides,
  };
}
