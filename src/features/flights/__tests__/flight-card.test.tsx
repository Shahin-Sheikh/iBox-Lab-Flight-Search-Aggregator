import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlightCard } from "@/features/flights/flight-card";
import { makeFlight } from "@/test/factories";

describe("FlightCard", () => {
  it("renders the key flight details", () => {
    const flight = makeFlight({
      price: 612,
      durationMinutes: 435,
      departureTime: "2026-06-25T08:30:00",
      arrivalTime: "2026-06-25T20:45:00",
    });
    render(<FlightCard flight={flight} passengers={1} onSelect={() => {}} />);

    expect(screen.getByText("British Airways")).toBeInTheDocument();
    expect(screen.getByText("BA100")).toBeInTheDocument();
    expect(screen.getByText("$612")).toBeInTheDocument();
    expect(screen.getByText("8:30 AM")).toBeInTheDocument();
    expect(screen.getByText("Non-stop")).toBeInTheDocument();
  });

  it("calls onSelect with the flight when Select is clicked", async () => {
    const onSelect = vi.fn();
    const flight = makeFlight();
    render(<FlightCard flight={flight} passengers={2} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /select/i }));
    expect(onSelect).toHaveBeenCalledWith(flight);
  });

  it("shows a low-seats warning and the per-passenger total", () => {
    render(<FlightCard flight={makeFlight({ seatsAvailable: 2, price: 500 })} passengers={2} onSelect={() => {}} />);
    expect(screen.getByText("2 left")).toBeInTheDocument();
    // 500 x 2 passengers
    expect(screen.getByText(/\$1,000/)).toBeInTheDocument();
  });
});
