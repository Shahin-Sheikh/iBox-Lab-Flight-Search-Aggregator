import { create } from "zustand";
import type { Booking, Flight, SearchCriteria } from "@/types";

/**
 * Ephemeral state for the booking flow that spans multiple routes (results →
 * review → form → confirmation).
 *
 * This is deliberately NOT persisted: every page is also reconstructable from
 * the URL + API (flight by id/date, booking by reference), so the store only
 * provides instant hand-offs within the SPA and never becomes a second source
 * of truth that can drift. See ARCHITECTURE.md.
 */
interface BookingFlowState {
  /** Flight chosen from the results list, with the criteria it was found under. */
  selectedFlight: Flight | null;
  selectedCriteria: SearchCriteria | null;
  /** Result of the most recent successful booking (handed to confirmation). */
  lastBooking: Booking | null;

  selectFlight: (flight: Flight, criteria: SearchCriteria) => void;
  clearSelection: () => void;
  setLastBooking: (booking: Booking) => void;
  reset: () => void;
}

export const useBookingFlowStore = create<BookingFlowState>((set) => ({
  selectedFlight: null,
  selectedCriteria: null,
  lastBooking: null,

  selectFlight: (flight, criteria) =>
    set({ selectedFlight: flight, selectedCriteria: criteria }),
  clearSelection: () => set({ selectedFlight: null, selectedCriteria: null }),
  setLastBooking: (booking) => set({ lastBooking: booking }),
  reset: () => set({ selectedFlight: null, selectedCriteria: null, lastBooking: null }),
}));
