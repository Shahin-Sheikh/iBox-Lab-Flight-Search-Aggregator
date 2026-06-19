import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterPanel } from "@/features/flights/filter-panel";
import { deriveFacets } from "@/lib/filtering";
import { EMPTY_FILTERS } from "@/types";
import { makeFlight } from "@/test/factories";

const flights = [
  makeFlight({ id: "A", airline: { code: "BA", name: "British Airways" }, price: 400, stops: 0, departureTime: "2026-06-25T09:00:00" }),
  makeFlight({ id: "B", airline: { code: "VS", name: "Virgin Atlantic" }, price: 800, stops: 1, departureTime: "2026-06-25T21:00:00" }),
];
const facets = deriveFacets(flights);

describe("FilterPanel", () => {
  it("toggles an airline filter", async () => {
    const onChange = vi.fn();
    render(
      <FilterPanel facets={facets} filters={EMPTY_FILTERS} currency="USD" onChange={onChange} onReset={() => {}} />,
    );

    await userEvent.click(screen.getByRole("checkbox", { name: /British Airways/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ airlines: ["BA"] }));
  });

  it("selects a non-stop-only stops filter", async () => {
    const onChange = vi.fn();
    render(
      <FilterPanel facets={facets} filters={EMPTY_FILTERS} currency="USD" onChange={onChange} onReset={() => {}} />,
    );

    await userEvent.click(screen.getByRole("radio", { name: /non-stop only/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ maxStops: 0 }));
  });

  it("shows a clear-all control only when filters are active", () => {
    const { rerender } = render(
      <FilterPanel facets={facets} filters={EMPTY_FILTERS} currency="USD" onChange={() => {}} onReset={() => {}} />,
    );
    expect(screen.queryByRole("button", { name: /reset filters/i })).not.toBeInTheDocument();

    rerender(
      <FilterPanel
        facets={facets}
        filters={{ ...EMPTY_FILTERS, airlines: ["BA"] }}
        currency="USD"
        onChange={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /reset filters/i })).toBeInTheDocument();
  });
});
