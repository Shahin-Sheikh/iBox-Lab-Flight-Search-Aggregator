import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithClient } from "@/test/render";
import { makeFlight } from "@/test/factories";
import type { SearchCriteria } from "@/types";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { BookingForm } from "@/features/booking/booking-form";

const criteria: SearchCriteria = { origin: "JFK", destination: "LHR", date: "2026-06-25", passengers: 1 };

describe("BookingForm", () => {
  beforeEach(() => push.mockClear());

  it("surfaces validation errors and does not submit when empty", async () => {
    renderWithClient(<BookingForm flight={makeFlight()} criteria={criteria} />);

    await userEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(screen.getByText("Last name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("renders one passenger fieldset per passenger in the party", () => {
    renderWithClient(
      <BookingForm flight={makeFlight()} criteria={{ ...criteria, passengers: 2 }} />,
    );

    expect(screen.getByText("Passenger 1")).toBeInTheDocument();
    expect(screen.getByText("Passenger 2")).toBeInTheDocument();
  });
});
