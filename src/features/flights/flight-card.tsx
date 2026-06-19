import type { Flight } from "@/types";
import { Badge, Button, Card } from "@/components/ui";
import { PlaneIcon } from "@/components/icons";
import { dayOffsetBetween, formatDuration, formatTime } from "@/lib/datetime";
import { cabinClassLabel, formatPrice, passengersLabel, stopsLabel } from "@/lib/format";

interface FlightCardProps {
  flight: Flight;
  passengers: number;
  onSelect: (flight: Flight) => void;
}

export function FlightCard({ flight, passengers, onSelect }: FlightCardProps) {
  const dayOffset = dayOffsetBetween(flight.departureTime, flight.arrivalTime);
  const layoverCodes = flight.layovers.map((layover) => layover.airport.code).join(", ");
  const lowSeats = flight.seatsAvailable <= 3;
  const total = flight.price * passengers;

  return (
    <Card className="flex flex-col gap-4 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <article
        aria-label={`${flight.airline.name} flight ${flight.flightNumber}`}
        className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
      >
        {/* Airline */}
        <div className="flex items-center gap-3 sm:w-40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <span className="text-xs font-bold">{flight.airline.code}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{flight.airline.name}</p>
            <p className="text-xs text-slate-400">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Itinerary */}
        <div className="flex flex-1 items-center gap-3">
          <div className="text-right">
            <p className="text-xl font-semibold leading-none text-slate-900">
              {formatTime(flight.departureTime)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{flight.origin.code}</p>
          </div>

          <div className="flex flex-1 flex-col items-center">
            <span className="text-xs text-slate-500">{formatDuration(flight.durationMinutes)}</span>
            <div className="my-1 flex w-full items-center gap-1 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-px flex-1 bg-slate-300" />
              <PlaneIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="h-px flex-1 bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
            <span className="text-xs text-slate-500">
              {stopsLabel(flight.stops)}
              {layoverCodes ? ` · ${layoverCodes}` : ""}
            </span>
          </div>

          <div className="text-left">
            <p className="text-xl font-semibold leading-none text-slate-900">
              {formatTime(flight.arrivalTime)}
              {dayOffset > 0 ? (
                <sup className="ml-0.5 text-xs font-medium text-brand-600">+{dayOffset}</sup>
              ) : null}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{flight.destination.code}</p>
          </div>
        </div>
      </article>

      {/* Price + action */}
      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:w-48 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">{formatPrice(flight.price, flight.currency)}</p>
          <p className="text-xs text-slate-400">per passenger</p>
          {passengers > 1 ? (
            <p className="mt-0.5 text-xs text-slate-500">
              {formatPrice(total, flight.currency)} · {passengersLabel(passengers)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Button size="sm" onClick={() => onSelect(flight)}>
            Select
          </Button>
          <div className="flex items-center gap-1">
            <Badge tone="neutral">{cabinClassLabel(flight.cabinClass)}</Badge>
            {lowSeats ? <Badge tone="warning">{flight.seatsAvailable} left</Badge> : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
