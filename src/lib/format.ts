import type { CabinClass } from "@/types";
import type { DepartureWindow, SortOption } from "@/types";
import { DEFAULT_LOCALE } from "./datetime";

/** Format a monetary amount, e.g. 1234 USD -> "$1,234". */
export function formatPrice(
  amount: number,
  currency: string,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // Fares in this dataset are whole dollars; hide noisy decimals.
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

export function cabinClassLabel(cabin: CabinClass): string {
  return CABIN_LABELS[cabin];
}

export function stopsLabel(stops: number): string {
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

const SORT_LABELS: Record<SortOption, string> = {
  best: "Best",
  cheapest: "Cheapest",
  fastest: "Fastest",
  earliest_departure: "Earliest departure",
  latest_departure: "Latest departure",
};

export function sortOptionLabel(option: SortOption): string {
  return SORT_LABELS[option];
}

const DEPARTURE_WINDOW_LABELS: Record<DepartureWindow, string> = {
  early: "Before 6 AM",
  morning: "6 AM – 12 PM",
  afternoon: "12 PM – 6 PM",
  evening: "After 6 PM",
};

export function departureWindowLabel(window: DepartureWindow): string {
  return DEPARTURE_WINDOW_LABELS[window];
}

/** "2 passengers" / "1 passenger" */
export function passengersLabel(count: number): string {
  return `${count} ${count === 1 ? "passenger" : "passengers"}`;
}
