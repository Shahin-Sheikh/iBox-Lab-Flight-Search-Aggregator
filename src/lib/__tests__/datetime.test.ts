import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  dayOffsetBetween,
  formatDayDate,
  formatDuration,
  formatTime,
  minutesToTime,
  timeToMinutes,
} from "@/lib/datetime";

describe("timeToMinutes / minutesToTime", () => {
  it("converts HH:mm to minutes-from-midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("08:30")).toBe(510);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("formats minutes back to zero-padded HH:mm and wraps over a day", () => {
    expect(minutesToTime(510)).toBe("08:30");
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(1500)).toBe("01:00"); // 1500 - 1440
    expect(minutesToTime(-60)).toBe("23:00");
  });

  it("throws on malformed time", () => {
    expect(() => timeToMinutes("8:30")).toThrow();
  });
});

describe("addDaysToDateString", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDaysToDateString("2026-06-25", 1)).toBe("2026-06-26");
    expect(addDaysToDateString("2026-06-30", 1)).toBe("2026-07-01");
    expect(addDaysToDateString("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToDateString("2026-06-25", 0)).toBe("2026-06-25");
    expect(addDaysToDateString("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("formatTime / formatDayDate", () => {
  it("formats airport-local wall-clock independent of host timezone", () => {
    expect(formatTime("2026-06-25T08:05:00")).toBe("8:05 AM");
    expect(formatTime("2026-06-25T20:45:00")).toBe("8:45 PM");
    expect(formatTime("2026-06-25T00:00:00")).toBe("12:00 AM");
  });

  it("formats a short weekday date", () => {
    expect(formatDayDate("2026-06-25T08:00:00")).toBe("Thu, Jun 25");
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(435)).toBe("7h 15m");
    expect(formatDuration(420)).toBe("7h");
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(90)).toBe("1h 30m");
  });
});

describe("dayOffsetBetween", () => {
  it("counts whole calendar days between departure and arrival", () => {
    expect(dayOffsetBetween("2026-06-25T22:00:00", "2026-06-26T06:00:00")).toBe(1);
    expect(dayOffsetBetween("2026-06-25T08:00:00", "2026-06-25T20:00:00")).toBe(0);
    expect(dayOffsetBetween("2026-06-25T23:00:00", "2026-06-27T01:00:00")).toBe(2);
  });
});
