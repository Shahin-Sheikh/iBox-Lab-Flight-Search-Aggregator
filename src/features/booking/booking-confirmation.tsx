import Link from "next/link";
import type { Booking } from "@/types";
import { Button, Card, Stepper } from "@/components/ui";
import { CheckCircleIcon } from "@/components/icons";
import { FlightItinerary } from "@/features/flights/flight-itinerary";
import { formatPrice } from "@/lib/format";

const STEPS = ["Review & details", "Confirmation"];

export function BookingConfirmation({ booking }: { booking: Booking }) {
  const { flight, passengers, contact } = booking;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Stepper steps={STEPS} current={1} className="mb-8 max-w-md" />

      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircleIcon className="h-9 w-9" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Booking confirmed</h1>
        <p className="mt-1 text-sm text-slate-500">
          A confirmation has been sent to{" "}
          <span className="font-medium text-slate-700">{contact.email}</span>.
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-5 py-3">
          <p className="text-xs uppercase tracking-wide text-brand-700">Confirmation code</p>
          <p className="text-2xl font-bold tracking-widest text-brand-800">{booking.reference}</p>
        </div>
      </div>

      <Card className="mt-8 p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Your flight</h2>
        <FlightItinerary flight={flight} />
      </Card>

      <Card className="mt-4 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Passengers ({passengers.length})
        </h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {passengers.map((passenger, index) => (
            <li key={index} className="flex justify-between py-2 text-sm">
              <span className="font-medium text-slate-700">
                {passenger.firstName} {passenger.lastName}
              </span>
              <span className="text-slate-400">Passenger {index + 1}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-slate-400">Email</p>
            <p className="font-medium text-slate-700">{contact.email}</p>
          </div>
          <div>
            <p className="text-slate-400">Phone</p>
            <p className="font-medium text-slate-700">{contact.phone}</p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-4 sm:p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-slate-900">Total paid</span>
          <span className="text-xl font-bold text-slate-900">
            {formatPrice(booking.totalPrice, booking.currency)}
          </span>
        </div>
      </Card>

      <div className="mt-8 flex justify-center">
        <Link href="/">
          <Button size="lg">Book another flight</Button>
        </Link>
      </div>
    </div>
  );
}
