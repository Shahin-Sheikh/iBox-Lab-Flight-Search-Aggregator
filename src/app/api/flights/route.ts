import { searchFlights } from "@/data/flight-repository";
import { parseSearchCriteria } from "@/lib/search-params";
import type { SearchFlightsResponse } from "@/types";
import { jsonError, serviceUnavailable, shouldFail, simulateLatency } from "@/server/mock-network";

/**
 * GET /api/flights?from=JFK&to=LHR&date=2026-06-25&pax=2
 * Returns flights for the route/date, excluding fares without enough seats.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;

  await simulateLatency();

  if (shouldFail(params)) {
    return serviceUnavailable();
  }

  const criteria = parseSearchCriteria(params);
  if (!criteria) {
    return jsonError(
      400,
      "invalid_search",
      "Invalid search parameters. Provide origin, destination, a valid future date and passenger count.",
    );
  }

  const body: SearchFlightsResponse = {
    criteria,
    results: searchFlights(criteria),
    searchedAt: new Date().toISOString(),
  };

  return Response.json(body);
}
