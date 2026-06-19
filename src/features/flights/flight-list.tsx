import type { Flight } from "@/types";
import { FlightCard } from "./flight-card";

interface FlightListProps {
  flights: Flight[];
  passengers: number;
  onSelect: (flight: Flight) => void;
}

export function FlightList({ flights, passengers, onSelect }: FlightListProps) {
  return (
    <ul className="space-y-3">
      {flights.map((flight) => (
        <li key={flight.id} className="animate-fade-in">
          <FlightCard flight={flight} passengers={passengers} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
