import { describe, expect, it } from "vitest";
import {
  bookingFormSchema,
  isRealCalendarDate,
  searchFormSchema,
} from "@/lib/validation";

describe("isRealCalendarDate", () => {
  it("accepts real dates and rejects impossible ones", () => {
    expect(isRealCalendarDate("2026-06-25")).toBe(true);
    expect(isRealCalendarDate("2026-02-29")).toBe(false); // not a leap year
    expect(isRealCalendarDate("2024-02-29")).toBe(true); // leap year
    expect(isRealCalendarDate("2026-13-01")).toBe(false);
    expect(isRealCalendarDate("06-25-2026")).toBe(false);
  });
});

describe("searchFormSchema", () => {
  const base = { origin: "JFK", destination: "LHR", date: "2999-01-01", passengers: 2 };

  it("accepts a valid future search", () => {
    expect(searchFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects identical origin and destination", () => {
    const result = searchFormSchema.safeParse({ ...base, destination: "JFK" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("destination"))).toBe(true);
    }
  });

  it("rejects past dates", () => {
    expect(searchFormSchema.safeParse({ ...base, date: "2000-01-01" }).success).toBe(false);
  });

  it("rejects out-of-range passenger counts", () => {
    expect(searchFormSchema.safeParse({ ...base, passengers: 0 }).success).toBe(false);
    expect(searchFormSchema.safeParse({ ...base, passengers: 10 }).success).toBe(false);
  });
});

describe("bookingFormSchema", () => {
  const validPassenger = {
    firstName: "Jane",
    lastName: "Doe",
    dateOfBirth: "1990-05-10",
    gender: "female" as const,
    passportNumber: "",
  };
  const validContact = { email: "jane@example.com", phone: "+1 555 123 4567" };

  it("accepts a valid booking", () => {
    const result = bookingFormSchema.safeParse({
      passengers: [validPassenger],
      contact: validContact,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a future date of birth", () => {
    const result = bookingFormSchema.safeParse({
      passengers: [{ ...validPassenger, dateOfBirth: "2999-01-01" }],
      contact: validContact,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty names and invalid email", () => {
    const result = bookingFormSchema.safeParse({
      passengers: [{ ...validPassenger, firstName: "" }],
      contact: { ...validContact, email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid passport format but allows empty", () => {
    expect(
      bookingFormSchema.safeParse({
        passengers: [{ ...validPassenger, passportNumber: "??" }],
        contact: validContact,
      }).success,
    ).toBe(false);
    expect(
      bookingFormSchema.safeParse({
        passengers: [{ ...validPassenger, passportNumber: "X1234567" }],
        contact: validContact,
      }).success,
    ).toBe(true);
  });
});
