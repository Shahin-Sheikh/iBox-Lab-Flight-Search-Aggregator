import { SearchForm } from "@/features/search/search-form";
import { todayDateString } from "@/lib/datetime";
import type { SearchFormValues } from "@/lib/validation";

// The default date depends on "today", so render per-request rather than
// freezing a date at build time.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const today = todayDateString();
  const defaults: SearchFormValues = {
    origin: "JFK",
    destination: "LHR",
    date: today,
    passengers: 1,
  };

  return (
    <div className="bg-gradient-to-b from-brand-700 to-brand-600">
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:pt-24">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Find your next flight
          </h1>
          <p className="mt-3 text-base text-brand-100">
            Compare fares across airlines, filter by what matters to you, and book in a
            few clicks. Try the seeded route{" "}
            <span className="font-semibold text-white">New York (JFK) → London (LHR)</span>.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-4 shadow-xl sm:p-6">
          <SearchForm defaultValues={defaults} minDate={today} />
        </div>

        <p className="mt-4 text-sm text-brand-100">
          36 flights · 13 airlines · non-stop and connecting options
        </p>
      </section>
    </div>
  );
}
