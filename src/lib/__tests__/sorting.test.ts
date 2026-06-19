import { describe, expect, it } from "vitest";
import { sortFlights } from "@/lib/sorting";
import { makeFlight } from "@/test/factories";

const cheapSlow = makeFlight({ id: "A", price: 300, durationMinutes: 900, departureTime: "2026-06-25T12:00:00" });
const midMid = makeFlight({ id: "B", price: 500, durationMinutes: 600, departureTime: "2026-06-25T06:00:00" });
const pricyFast = makeFlight({ id: "C", price: 900, durationMinutes: 400, departureTime: "2026-06-25T20:00:00" });

const flights = [midMid, pricyFast, cheapSlow];

describe("sortFlights", () => {
  it("does not mutate the input array", () => {
    const input = [...flights];
    sortFlights(input, "cheapest");
    expect(input).toEqual([midMid, pricyFast, cheapSlow]);
  });

  it("sorts by cheapest price", () => {
    expect(sortFlights(flights, "cheapest").map((f) => f.id)).toEqual(["A", "B", "C"]);
  });

  it("sorts by fastest duration", () => {
    expect(sortFlights(flights, "fastest").map((f) => f.id)).toEqual(["C", "B", "A"]);
  });

  it("sorts by earliest departure", () => {
    expect(sortFlights(flights, "earliest_departure").map((f) => f.id)).toEqual(["B", "A", "C"]);
  });

  it("sorts by latest departure", () => {
    expect(sortFlights(flights, "latest_departure").map((f) => f.id)).toEqual(["C", "A", "B"]);
  });

  it("ranks a balanced option well for 'best'", () => {
    // The mid option is never the worst on either axis, so it should not be last.
    const order = sortFlights(flights, "best").map((f) => f.id);
    expect(order).toHaveLength(3);
    expect(order[order.length - 1]).not.toBe("B");
  });

  it("returns an empty array unchanged", () => {
    expect(sortFlights([], "best")).toEqual([]);
  });
});
