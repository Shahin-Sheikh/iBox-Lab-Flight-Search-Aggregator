import { describe, expect, it } from "vitest";
import { deriveFacets, departureWindowOf, filterFlights, matchesFilters } from "@/lib/filtering";
import { EMPTY_FILTERS } from "@/types";
import { makeFlight } from "@/test/factories";

describe("departureWindowOf", () => {
  it("buckets departure times by time of day", () => {
    expect(departureWindowOf("2026-06-25T05:30:00")).toBe("early");
    expect(departureWindowOf("2026-06-25T09:00:00")).toBe("morning");
    expect(departureWindowOf("2026-06-25T14:00:00")).toBe("afternoon");
    expect(departureWindowOf("2026-06-25T21:00:00")).toBe("evening");
  });
});

describe("matchesFilters", () => {
  const flight = makeFlight({
    airline: { code: "BA", name: "British Airways" },
    stops: 1,
    price: 500,
    cabinClass: "economy",
    departureTime: "2026-06-25T09:00:00",
  });

  it("passes with no constraints", () => {
    expect(matchesFilters(flight, EMPTY_FILTERS)).toBe(true);
  });

  it("filters by max stops", () => {
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, maxStops: 0 })).toBe(false);
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, maxStops: 1 })).toBe(true);
  });

  it("filters by airline, price, cabin and departure window", () => {
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, airlines: ["VS"] })).toBe(false);
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, airlines: ["BA"] })).toBe(true);
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, maxPrice: 400 })).toBe(false);
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, maxPrice: 500 })).toBe(true);
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, cabinClasses: ["business"] })).toBe(false);
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, departureWindows: ["evening"] })).toBe(false);
    expect(matchesFilters(flight, { ...EMPTY_FILTERS, departureWindows: ["morning"] })).toBe(true);
  });
});

describe("filterFlights", () => {
  it("returns only flights matching all constraints", () => {
    const flights = [
      makeFlight({ id: "A", airline: { code: "BA", name: "British Airways" }, price: 400 }),
      makeFlight({ id: "B", airline: { code: "VS", name: "Virgin Atlantic" }, price: 800 }),
    ];
    const result = filterFlights(flights, { ...EMPTY_FILTERS, maxPrice: 500 });
    expect(result.map((f) => f.id)).toEqual(["A"]);
  });
});

describe("deriveFacets", () => {
  it("derives airline counts, price range, stops and windows", () => {
    const flights = [
      makeFlight({ id: "A", airline: { code: "BA", name: "British Airways" }, price: 400, stops: 0, departureTime: "2026-06-25T09:00:00" }),
      makeFlight({ id: "B", airline: { code: "BA", name: "British Airways" }, price: 600, stops: 1, departureTime: "2026-06-25T21:00:00" }),
      makeFlight({ id: "C", airline: { code: "VS", name: "Virgin Atlantic" }, price: 500, stops: 0, departureTime: "2026-06-25T09:00:00" }),
    ];
    const facets = deriveFacets(flights);

    expect(facets.priceRange).toEqual([400, 600]);
    expect(facets.stopOptions).toEqual([0, 1]);
    expect(facets.departureWindows).toEqual(["morning", "evening"]);

    const ba = facets.airlines.find((a) => a.airline.code === "BA");
    expect(ba?.count).toBe(2);
    expect(ba?.fromPrice).toBe(400);
    // airlines are sorted alphabetically by name
    expect(facets.airlines.map((a) => a.airline.code)).toEqual(["BA", "VS"]);
  });

  it("returns an empty shape for no flights", () => {
    const facets = deriveFacets([]);
    expect(facets.airlines).toEqual([]);
    expect(facets.priceRange).toEqual([0, 0]);
  });
});
