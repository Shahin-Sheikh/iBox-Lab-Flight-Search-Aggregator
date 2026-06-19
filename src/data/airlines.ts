import type { Airline } from "@/types";

export const AIRLINES: Record<string, Airline> = {
  BA: { code: "BA", name: "British Airways" },
  VS: { code: "VS", name: "Virgin Atlantic" },
  AA: { code: "AA", name: "American Airlines" },
  DL: { code: "DL", name: "Delta Air Lines" },
  UA: { code: "UA", name: "United Airlines" },
  B6: { code: "B6", name: "JetBlue" },
  AF: { code: "AF", name: "Air France" },
  KL: { code: "KL", name: "KLM" },
  LH: { code: "LH", name: "Lufthansa" },
  IB: { code: "IB", name: "Iberia" },
  EI: { code: "EI", name: "Aer Lingus" },
  FI: { code: "FI", name: "Icelandair" },
  AC: { code: "AC", name: "Air Canada" },
};

export function getAirline(code: string): Airline | undefined {
  return AIRLINES[code];
}
