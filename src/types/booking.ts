import type { AirportCode, Flight } from "./flight";

export type Gender = "male" | "female" | "other" | "unspecified";

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  /** `yyyy-MM-dd` */
  dateOfBirth: string;
  gender: Gender;
  /** Optional travel document number. */
  passportNumber?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

/**
 * Payload sent to the mock booking endpoint. The flight is identified by id +
 * search context so the server can re-resolve authoritative price/seat data
 * rather than trusting client-supplied values.
 */
export interface BookingRequest {
  flightId: string;
  /** Departure date of the selected flight (`yyyy-MM-dd`). */
  date: string;
  origin: AirportCode;
  destination: AirportCode;
  passengers: PassengerInfo[];
  contact: ContactInfo;
}

export type BookingStatus = "confirmed";

/** A confirmed booking returned by the mock API. */
export interface Booking {
  /** Human-friendly confirmation code, e.g. "IB7K2QA". */
  reference: string;
  flight: Flight;
  passengers: PassengerInfo[];
  contact: ContactInfo;
  /** Total charged across all passengers. */
  totalPrice: number;
  currency: string;
  /** ISO timestamp of when the booking was created. */
  createdAt: string;
  status: BookingStatus;
}
