import { beforeEach, describe, expect, it } from "vitest";
import { useBookingFlowStore } from "@/store/booking-flow-store";
import { makeFlight } from "@/test/factories";
import type { Booking, SearchCriteria } from "@/types";

const criteria: SearchCriteria = { origin: "JFK", destination: "LHR", date: "2026-06-25", passengers: 1 };
const flight = makeFlight();
const booking: Booking = {
  reference: "IBABC12",
  flight,
  passengers: [],
  contact: { email: "a@b.com", phone: "+1 555 000 0000" },
  totalPrice: 500,
  currency: "USD",
  createdAt: "2026-06-19T00:00:00.000Z",
  status: "confirmed",
};

describe("booking flow store", () => {
  beforeEach(() => {
    useBookingFlowStore.getState().reset();
  });

  it("stores and clears a selected flight", () => {
    useBookingFlowStore.getState().selectFlight(flight, criteria);
    expect(useBookingFlowStore.getState().selectedFlight).toEqual(flight);
    expect(useBookingFlowStore.getState().selectedCriteria).toEqual(criteria);

    useBookingFlowStore.getState().clearSelection();
    expect(useBookingFlowStore.getState().selectedFlight).toBeNull();
  });

  it("records the last booking and resets everything", () => {
    useBookingFlowStore.getState().selectFlight(flight, criteria);
    useBookingFlowStore.getState().setLastBooking(booking);
    expect(useBookingFlowStore.getState().lastBooking).toEqual(booking);

    useBookingFlowStore.getState().reset();
    expect(useBookingFlowStore.getState().lastBooking).toBeNull();
    expect(useBookingFlowStore.getState().selectedFlight).toBeNull();
  });
});
