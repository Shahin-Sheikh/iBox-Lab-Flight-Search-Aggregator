import { describe, expect, it } from "vitest";
import { getFlightById, isServedRoute, searchFlights } from "@/data/flight-repository";
import { formatTime } from "@/lib/datetime";

const DATE = "2026-06-25";

describe("isServedRoute", () => {
  it("serves JFK<->LHR in both directions only", () => {
    expect(isServedRoute("JFK", "LHR")).toBe(true);
    expect(isServedRoute("LHR", "JFK")).toBe(true);
    expect(isServedRoute("JFK", "CDG")).toBe(false);
    expect(isServedRoute("JFK", "JFK")).toBe(false);
  });
});

describe("searchFlights", () => {
  it("returns the full catalogue for a single passenger", () => {
    const flights = searchFlights({ origin: "JFK", destination: "LHR", date: DATE, passengers: 1 });
    expect(flights.length).toBe(36);
    expect(flights.every((f) => f.origin.code === "JFK" && f.destination.code === "LHR")).toBe(true);
  });

  it("excludes fares without enough seats for the party", () => {
    const all = searchFlights({ origin: "JFK", destination: "LHR", date: DATE, passengers: 1 });
    const forFour = searchFlights({ origin: "JFK", destination: "LHR", date: DATE, passengers: 4 });
    expect(forFour.length).toBeLessThan(all.length);
    expect(forFour.every((f) => f.seatsAvailable >= 4)).toBe(true);
  });

  it("orients flights to the requested direction", () => {
    const reverse = searchFlights({ origin: "LHR", destination: "JFK", date: DATE, passengers: 1 });
    expect(reverse.length).toBeGreaterThan(0);
    expect(reverse.every((f) => f.origin.code === "LHR" && f.destination.code === "JFK")).toBe(true);
  });

  it("returns no flights for an unserved route", () => {
    expect(searchFlights({ origin: "JFK", destination: "CDG", date: DATE, passengers: 1 })).toEqual([]);
  });
});

describe("getFlightById", () => {
  it("derives arrival time from departure + duration + timezone offset", () => {
    // FL001: dep 08:30, duration 435m, JFK(-240) -> LHR(+60) => +300m offset.
    // arrival local = 510 + 435 + 300 = 1245 => 20:45, same calendar day.
    const flight = getFlightById("FL001", DATE)!;
    expect(flight).toBeDefined();
    expect(flight.departureTime).toBe("2026-06-25T08:30:00");
    expect(formatTime(flight.arrivalTime)).toBe("8:45 PM");
    expect(flight.arrivalTime.startsWith("2026-06-25")).toBe(true);
  });

  it("rolls arrival onto the next day for late departures", () => {
    // FL031: dep 23:40 (1420) + 1140 + 300 = 2860 => next day, 23:40.
    const flight = getFlightById("FL031", DATE)!;
    expect(flight.arrivalTime.startsWith("2026-06-26")).toBe(true);
  });

  it("returns undefined for unknown ids", () => {
    expect(getFlightById("NOPE", DATE)).toBeUndefined();
  });
});
