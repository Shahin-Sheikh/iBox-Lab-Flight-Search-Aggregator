import { getBooking } from "@/server/booking-store";
import { jsonError, serviceUnavailable, shouldFail, simulateLatency } from "@/server/mock-network";

/**
 * GET /api/bookings/:reference
 * Returns a previously created booking (so the confirmation page survives a
 * refresh during the server's lifetime).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
): Promise<Response> {
  const { reference } = await params;
  const search = new URL(request.url).searchParams;

  await simulateLatency();

  if (shouldFail(search)) {
    return serviceUnavailable();
  }

  const booking = getBooking(reference);
  if (!booking) {
    return jsonError(404, "booking_not_found", "We couldn't find a booking with that reference.");
  }

  return Response.json(booking);
}
