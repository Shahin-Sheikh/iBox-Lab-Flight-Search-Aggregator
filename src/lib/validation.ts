import { z } from "zod";
import { todayDateString } from "./datetime";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** True when a `yyyy-MM-dd` string is a real calendar date (round-trips). */
export function isRealCalendarDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

const calendarDate = z
  .string()
  .regex(DATE_RE, "Enter a valid date")
  .refine(isRealCalendarDate, "That date doesn't exist");

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export const searchFormSchema = z
  .object({
    origin: z.string().length(3, "Select an origin"),
    destination: z.string().length(3, "Select a destination"),
    date: calendarDate.refine(
      (value) => value >= todayDateString(),
      "Departure date can't be in the past",
    ),
    passengers: z
      .number({ message: "Select passengers" })
      .int()
      .min(1, "At least 1 passenger")
      .max(9, "Up to 9 passengers"),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
  });

export type SearchFormValues = z.infer<typeof searchFormSchema>;

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

export const passengerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  dateOfBirth: calendarDate.refine(
    (value) => value < todayDateString(),
    "Date of birth must be in the past",
  ),
  gender: z.enum(["male", "female", "other", "unspecified"], {
    message: "Select an option",
  }),
  passportNumber: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{5,15}$/, "Enter a valid passport number")
    .optional()
    .or(z.literal("")),
});

export type PassengerFormValues = z.infer<typeof passengerSchema>;

export const contactSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .regex(/^[+]?[\d\s().-]{7,20}$/, "Enter a valid phone number"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const bookingFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1).max(9),
  contact: contactSchema,
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

/** Server-side schema for the full booking request payload. */
export const bookingRequestSchema = z.object({
  flightId: z.string().min(1),
  date: calendarDate,
  origin: z.string().length(3),
  destination: z.string().length(3),
  passengers: z.array(passengerSchema).min(1).max(9),
  contact: contactSchema,
});

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>;
