import type { Booking, ContactInfo, Flight, PassengerInfo } from "@/types";

/**
 * In-memory booking store for the mock API. Persists for the lifetime of the
 * server process so a confirmation page survives a refresh. A real backend
 * would use a database; see ARCHITECTURE.md.
 *
 * The Map is pinned to `globalThis` so it is shared across separate route-
 * handler module instances (Next.js can load them in isolated module graphs in
 * dev) and survives HMR reloads — the same pattern used for a dev Prisma client.
 */
const globalForBookings = globalThis as unknown as {
  __flightBookings?: Map<string, Booking>;
};

const bookings: Map<string, Booking> =
  globalForBookings.__flightBookings ?? new Map<string, Booking>();

if (!globalForBookings.__flightBookings) {
  globalForBookings.__flightBookings = bookings;
}

// Excludes visually ambiguous characters (0/O, 1/I) for human-readable codes.
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERENCE_LENGTH = 5;

function randomReference(): string {
  let suffix = "";
  for (let i = 0; i < REFERENCE_LENGTH; i += 1) {
    suffix += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `IB${suffix}`;
}

function uniqueReference(): string {
  let reference = randomReference();
  while (bookings.has(reference)) {
    reference = randomReference();
  }
  return reference;
}

export function createBooking(
  flight: Flight,
  passengers: PassengerInfo[],
  contact: ContactInfo,
): Booking {
  const reference = uniqueReference();
  const booking: Booking = {
    reference,
    flight,
    passengers,
    contact,
    totalPrice: flight.price * passengers.length,
    currency: flight.currency,
    createdAt: new Date().toISOString(),
    status: "confirmed",
  };
  bookings.set(reference, booking);
  return booking;
}

export function getBooking(reference: string): Booking | undefined {
  return bookings.get(reference);
}
