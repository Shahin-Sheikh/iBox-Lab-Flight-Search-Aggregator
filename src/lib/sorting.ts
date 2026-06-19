import type { Flight, SortOption } from "@/types";
import { parseWallClock } from "./datetime";

function departureMs(flight: Flight): number {
  return parseWallClock(flight.departureTime).getTime();
}

/**
 * "Best" balances price, duration and stops. We min-max normalize price and
 * duration across the current result set (so the score is relative to what is
 * actually available) and add a small penalty per stop. Lower score = better.
 */
function scoreBest(flight: Flight, priceRange: [number, number], durationRange: [number, number]): number {
  const [minPrice, maxPrice] = priceRange;
  const [minDuration, maxDuration] = durationRange;
  const priceSpan = maxPrice - minPrice || 1;
  const durationSpan = maxDuration - minDuration || 1;
  const priceScore = (flight.price - minPrice) / priceSpan;
  const durationScore = (flight.durationMinutes - minDuration) / durationSpan;
  const stopsPenalty = flight.stops * 0.15;
  // Weight price and time roughly equally; stops nudge ties.
  return priceScore * 0.5 + durationScore * 0.5 + stopsPenalty;
}

function range(values: number[]): [number, number] {
  return [Math.min(...values), Math.max(...values)];
}

/**
 * Return a new, sorted array (never mutates the input). Ties fall back to
 * price then departure time so ordering is stable and deterministic.
 */
export function sortFlights(flights: Flight[], option: SortOption): Flight[] {
  if (flights.length === 0) return [];
  const sorted = [...flights];

  const tieBreak = (a: Flight, b: Flight): number =>
    a.price - b.price || departureMs(a) - departureMs(b) || a.id.localeCompare(b.id);

  switch (option) {
    case "cheapest":
      sorted.sort((a, b) => a.price - b.price || a.durationMinutes - b.durationMinutes || a.id.localeCompare(b.id));
      break;
    case "fastest":
      sorted.sort((a, b) => a.durationMinutes - b.durationMinutes || tieBreak(a, b));
      break;
    case "earliest_departure":
      sorted.sort((a, b) => departureMs(a) - departureMs(b) || tieBreak(a, b));
      break;
    case "latest_departure":
      sorted.sort((a, b) => departureMs(b) - departureMs(a) || tieBreak(a, b));
      break;
    case "best": {
      const priceRange = range(flights.map((f) => f.price));
      const durationRange = range(flights.map((f) => f.durationMinutes));
      sorted.sort(
        (a, b) =>
          scoreBest(a, priceRange, durationRange) - scoreBest(b, priceRange, durationRange) ||
          tieBreak(a, b),
      );
      break;
    }
  }

  return sorted;
}
