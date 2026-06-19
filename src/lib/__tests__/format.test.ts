import { describe, expect, it } from "vitest";
import {
  cabinClassLabel,
  departureWindowLabel,
  formatPrice,
  passengersLabel,
  sortOptionLabel,
  stopsLabel,
} from "@/lib/format";

describe("formatPrice", () => {
  it("formats whole-dollar currency without decimals", () => {
    expect(formatPrice(1234, "USD")).toBe("$1,234");
    expect(formatPrice(0, "USD")).toBe("$0");
    expect(formatPrice(589, "USD")).toBe("$589");
  });
});

describe("labels", () => {
  it("describes stops", () => {
    expect(stopsLabel(0)).toBe("Non-stop");
    expect(stopsLabel(1)).toBe("1 stop");
    expect(stopsLabel(2)).toBe("2 stops");
  });

  it("describes cabin classes", () => {
    expect(cabinClassLabel("economy")).toBe("Economy");
    expect(cabinClassLabel("premium_economy")).toBe("Premium Economy");
    expect(cabinClassLabel("business")).toBe("Business");
  });

  it("pluralizes passengers", () => {
    expect(passengersLabel(1)).toBe("1 passenger");
    expect(passengersLabel(3)).toBe("3 passengers");
  });

  it("labels sort options and departure windows", () => {
    expect(sortOptionLabel("cheapest")).toBe("Cheapest");
    expect(sortOptionLabel("earliest_departure")).toBe("Earliest departure");
    expect(departureWindowLabel("morning")).toBe("6 AM – 12 PM");
  });
});
