import { getFlightById } from "@/data/flight-repository";
import { isRealCalendarDate } from "@/lib/validation";
import { jsonError, serviceUnavailable, shouldFail, simulateLatency } from "@/server/mock-network";

/**
 * GET /api/flights/:id?date=2026-06-25&from=JFK&to=LHR
 * Resolves a single flight for the given date/direction.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const search = new URL(request.url).searchParams;

  await simulateLatency();

  if (shouldFail(search)) {
    return serviceUnavailable();
  }

  const date = search.get("date");
  if (!date || !isRealCalendarDate(date)) {
    return jsonError(400, "invalid_date", "A valid `date` query parameter is required.");
  }

  const origin = search.get("from") ?? "JFK";
  const destination = search.get("to") ?? "LHR";
  const flight = getFlightById(id, date, origin, destination);

  if (!flight) {
    return jsonError(
      404,
      "flight_not_found",
      "We couldn't find that flight. It may no longer be available.",
    );
  }

  return Response.json(flight);
}
