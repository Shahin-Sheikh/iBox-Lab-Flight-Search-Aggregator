import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { SearchForm } from "@/features/search/search-form";

const defaults = { origin: "JFK", destination: "LHR", date: "2999-01-01", passengers: 1 };

describe("SearchForm", () => {
  beforeEach(() => push.mockClear());

  it("navigates to /search with the criteria query on a valid submit", async () => {
    render(<SearchForm defaultValues={defaults} minDate="2026-01-01" />);

    await userEvent.click(screen.getByRole("button", { name: /search flights/i }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/search?from=JFK&to=LHR&date=2999-01-01&pax=1"),
    );
  });

  it("blocks submission when origin and destination are identical", async () => {
    render(<SearchForm defaultValues={defaults} minDate="2026-01-01" />);

    await userEvent.selectOptions(screen.getByLabelText("To"), "JFK");
    await userEvent.click(screen.getByRole("button", { name: /search flights/i }));

    expect(await screen.findByText(/must be different/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("swaps origin and destination", async () => {
    render(<SearchForm defaultValues={defaults} minDate="2026-01-01" />);

    await userEvent.click(screen.getByRole("button", { name: /swap origin and destination/i }));

    expect((screen.getByLabelText("From") as HTMLSelectElement).value).toBe("LHR");
    expect((screen.getByLabelText("To") as HTMLSelectElement).value).toBe("JFK");
  });
});
