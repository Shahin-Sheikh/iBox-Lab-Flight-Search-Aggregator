import { getFlightById } from "@/data/flight-repository";
import { bookingRequestSchema } from "@/lib/validation";
import { createBooking } from "@/server/booking-store";
import { jsonError, serviceUnavailable, shouldFail, simulateLatency } from "@/server/mock-network";

/**
 * POST /api/bookings
 * Validates the payload, re-resolves the flight server-side (authoritative
 * price + seat availability), then creates and returns a confirmed booking.
 */
export async function POST(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;

  await simulateLatency();

  if (shouldFail(params)) {
    return serviceUnavailable();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const parsed = bookingRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".")] = issue.message;
    }
    return jsonError(422, "validation_failed", "Some details are invalid.", fields);
  }

  const { flightId, date, origin, destination, passengers, contact } = parsed.data;
  const flight = getFlightById(flightId, date, origin, destination);

  if (!flight) {
    return jsonError(
      404,
      "flight_not_found",
      "The selected flight is no longer available. Please search again.",
    );
  }

  if (passengers.length > flight.seatsAvailable) {
    return jsonError(
      409,
      "insufficient_seats",
      `Only ${flight.seatsAvailable} seat(s) remain on this flight.`,
    );
  }

  const booking = createBooking(flight, passengers, contact);
  return Response.json(booking, { status: 201 });
}
