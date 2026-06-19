import type { SearchCriteria } from "@/types";

/**
 * Centralized TanStack Query keys. Keeping them in one place avoids subtle
 * cache-collision bugs and makes invalidation predictable.
 */
export const queryKeys = {
  flights: {
    all: ["flights"] as const,
    search: (criteria: SearchCriteria) => ["flights", "search", criteria] as const,
    detail: (id: string, date: string, origin: string, destination: string) =>
      ["flights", "detail", id, date, origin, destination] as const,
  },
  bookings: {
    detail: (reference: string) => ["bookings", reference] as const,
  },
} as const;
