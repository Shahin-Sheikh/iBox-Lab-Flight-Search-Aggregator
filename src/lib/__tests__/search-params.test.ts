import { describe, expect, it } from "vitest";
import {
  buildSearchQuery,
  hasActiveFilters,
  parseFilters,
  parseSearchCriteria,
  parseSearchState,
  parseSort,
} from "@/lib/search-params";
import { EMPTY_FILTERS } from "@/types";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parseSearchCriteria", () => {
  it("parses a valid criteria", () => {
    const criteria = parseSearchCriteria(params("from=JFK&to=LHR&date=2026-06-25&pax=2"));
    expect(criteria).toEqual({ origin: "JFK", destination: "LHR", date: "2026-06-25", passengers: 2 });
  });

  it("returns null for missing/invalid params", () => {
    expect(parseSearchCriteria(params("from=JFK&to=LHR"))).toBeNull();
    expect(parseSearchCriteria(params("from=JFK&to=JFK&date=2026-06-25&pax=1"))).toBeNull();
    expect(parseSearchCriteria(params("from=JFK&to=LHR&date=nope&pax=1"))).toBeNull();
    expect(parseSearchCriteria(params("from=JFK&to=LHR&date=2026-06-25&pax=99"))).toBeNull();
  });
});

describe("parseFilters / parseSort", () => {
  it("parses filters from the query string", () => {
    const filters = parseFilters(
      params("stops=1&airlines=BA,VS&cabin=economy,business&maxPrice=700&depart=morning,evening"),
    );
    expect(filters.maxStops).toBe(1);
    expect(filters.airlines).toEqual(["BA", "VS"]);
    expect(filters.cabinClasses).toEqual(["economy", "business"]);
    expect(filters.maxPrice).toBe(700);
    expect(filters.departureWindows).toEqual(["morning", "evening"]);
  });

  it("ignores invalid cabin/window values", () => {
    const filters = parseFilters(params("cabin=economy,bogus&depart=midday"));
    expect(filters.cabinClasses).toEqual(["economy"]);
    expect(filters.departureWindows).toEqual([]);
  });

  it("defaults sort to 'best'", () => {
    expect(parseSort(params(""))).toBe("best");
    expect(parseSort(params("sort=cheapest"))).toBe("cheapest");
    expect(parseSort(params("sort=bogus"))).toBe("best");
  });
});

describe("buildSearchQuery round-trip", () => {
  it("serializes and re-parses to the same state", () => {
    const state = {
      criteria: { origin: "JFK", destination: "LHR", date: "2026-06-25", passengers: 3 },
      filters: {
        maxStops: 1,
        airlines: ["BA"],
        cabinClasses: ["economy" as const],
        maxPrice: 600,
        departureWindows: ["morning" as const],
      },
      sort: "fastest" as const,
    };
    const query = buildSearchQuery(state);
    expect(parseSearchState(params(query))).toEqual(state);
  });

  it("omits default sort and empty filters", () => {
    const query = buildSearchQuery({
      criteria: { origin: "JFK", destination: "LHR", date: "2026-06-25", passengers: 1 },
      filters: EMPTY_FILTERS,
      sort: "best",
    });
    expect(query).not.toContain("sort=");
    expect(query).not.toContain("airlines=");
  });
});

describe("hasActiveFilters", () => {
  it("detects active filters", () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, maxStops: 0 })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, airlines: ["BA"] })).toBe(true);
  });
});
