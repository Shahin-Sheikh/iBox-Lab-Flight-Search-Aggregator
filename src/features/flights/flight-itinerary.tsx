import type { Flight } from "@/types";
import { Badge } from "@/components/ui";
import { PlaneIcon } from "@/components/icons";
import {
  dayOffsetBetween,
  formatDayDate,
  formatDuration,
  formatTime,
} from "@/lib/datetime";
import { cabinClassLabel, stopsLabel } from "@/lib/format";

/** Endpoint (departure or arrival) block. */
function Endpoint({
  time,
  date,
  airportName,
  airportCode,
  dayOffset,
  align,
}: {
  time: string;
  date: string;
  airportName: string;
  airportCode: string;
  dayOffset?: number;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="text-2xl font-bold leading-none text-slate-900">
        {time}
        {dayOffset && dayOffset > 0 ? (
          <sup className="ml-0.5 text-xs font-semibold text-brand-600">+{dayOffset}</sup>
        ) : null}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{airportCode}</p>
      <p className="text-xs text-slate-500">{airportName}</p>
      <p className="text-xs text-slate-400">{date}</p>
    </div>
  );
}

export function FlightItinerary({ flight }: { flight: Flight }) {
  const dayOffset = dayOffsetBetween(flight.departureTime, flight.arrivalTime);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
            {flight.airline.code}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{flight.airline.name}</p>
            <p className="text-xs text-slate-400">{flight.flightNumber}</p>
          </div>
        </div>
        <Badge tone="brand">{cabinClassLabel(flight.cabinClass)}</Badge>
      </div>

      <div className="flex items-start justify-between gap-4">
        <Endpoint
          time={formatTime(flight.departureTime)}
          date={formatDayDate(flight.departureTime)}
          airportName={flight.origin.name}
          airportCode={flight.origin.code}
          align="left"
        />

        <div className="flex flex-1 flex-col items-center pt-1">
          <span className="text-xs font-medium text-slate-500">
            {formatDuration(flight.durationMinutes)}
          </span>
          <div className="my-1 flex w-full items-center gap-1 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span className="h-px flex-1 bg-slate-300" />
            <PlaneIcon className="h-4 w-4 text-slate-400" />
            <span className="h-px flex-1 bg-slate-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          </div>
          <span className="text-xs text-slate-500">{stopsLabel(flight.stops)}</span>
        </div>

        <Endpoint
          time={formatTime(flight.arrivalTime)}
          date={formatDayDate(flight.arrivalTime)}
          airportName={flight.destination.name}
          airportCode={flight.destination.code}
          dayOffset={dayOffset}
          align="right"
        />
      </div>

      {flight.layovers.length > 0 ? (
        <ul className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm">
          {flight.layovers.map((layover) => (
            <li key={layover.airport.code} className="flex items-center gap-2 text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>
                Connection in {layover.airport.city} ({layover.airport.code}) ·{" "}
                <span className="font-medium">{formatDuration(layover.minutes)}</span> layover
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
