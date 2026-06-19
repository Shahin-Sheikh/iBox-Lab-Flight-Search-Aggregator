import type { Flight } from "@/types";
import { Card } from "@/components/ui";
import { formatPrice, passengersLabel } from "@/lib/format";

interface PriceSummaryProps {
  flight: Flight;
  passengers: number;
}

/** Fare breakdown shown alongside the booking form. */
export function PriceSummary({ flight, passengers }: PriceSummaryProps) {
  const total = flight.price * passengers;

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">Price summary</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>
            {formatPrice(flight.price, flight.currency)} × {passengersLabel(passengers)}
          </dt>
          <dd>{formatPrice(total, flight.currency)}</dd>
        </div>
        <div className="flex justify-between text-slate-400">
          <dt>Taxes &amp; fees</dt>
          <dd>Included</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-900">Total</span>
        <span className="text-xl font-bold text-slate-900">{formatPrice(total, flight.currency)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{flight.seatsAvailable} seats remaining at this fare</p>
    </Card>
  );
}
