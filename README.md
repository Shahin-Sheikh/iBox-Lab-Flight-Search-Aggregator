# iBox Flights — Flight Search Aggregator

A flight search and booking experience built for the iBox Lab Senior Frontend
take-home exercise. A user searches for flights, filters and sorts the results,
selects a flight, reviews it, completes a booking form, and receives a
confirmation.

> **Scope note:** This is a focused, production-shaped implementation rather than
> an exhaustive one. Decisions were made to demonstrate architecture and
> fundamentals over breadth. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the
> reasoning behind every significant choice, and
> [_What I'd do next_](#what-id-do-next) below for deliberate omissions.

## Tech stack

| Concern              | Choice                                   | Why |
| -------------------- | ---------------------------------------- | --- |
| Framework            | **Next.js 15** (App Router)              | File-based routing, RSC, route handlers for the mock API |
| Language             | **TypeScript** (strict + `noUncheckedIndexedAccess`) | Type-safety as a first-class design tool |
| Server state         | **TanStack Query**                       | Caching, dedupe, and first-class loading/error/empty states |
| URL state            | **URLSearchParams**                      | Search/filter/sort are shareable and back-button friendly |
| Flow state           | **Zustand**                              | Lightweight cross-route booking hand-off |
| Forms & validation   | **React Hook Form + Zod**                | Performant forms; one schema shared by client and server |
| Styling              | **Tailwind CSS**                         | Token-driven, consistent, fast to iterate |
| Testing              | **Vitest + Testing Library**             | Fast unit/integration tests close to user behavior |

## Getting started

```bash
npm install

npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build

npm test           # run the test suite (Vitest)
npm run test:watch # watch mode
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

Requires Node 18.18+ (developed on Node 22).

> **⚠️ Windows note:** `next build` can fail during _"Collecting page data"_ with
> `PageNotFoundError` when the **project path contains spaces** — a known
> Next.js/Windows issue, not a code problem. `npm run dev` and `npm test` are
> unaffected. To produce a production build on Windows, clone into a path
> without spaces (e.g. `C:\dev\flight-search-aggregator`). The build, lint,
> typecheck and 65 tests all pass from a clean path.

## Features

### Flight search
- Search by **origin, destination, date, and passenger count** with inline
  validation (e.g. origin ≠ destination, no past dates, 1–9 passengers).
- The search criteria live in the **URL**, so any result page is shareable and
  survives a refresh.

### Results
- **Sort** by Best, Cheapest, Fastest, Earliest, or Latest departure.
- **Filter** by stops, price, airline, departure time-of-day, and cabin class.
  Filter options (and counts) are **derived from the actual result set**.
- Explicit **loading** (skeletons), **empty** (no route / no matches after
  filtering), and **error** (with retry) states.

### Booking
- Select a flight → **review** the full itinerary → complete a validated
  **passenger + contact form** (one fieldset per passenger).
- The server **re-prices and re-validates** the booking (authoritative seat
  availability) before confirming.
- **Confirmation** screen with a booking reference; refetchable by reference so
  it survives a refresh.

## Mock API

There is no real backend. A small dataset lives in
[`src/data/flights.json`](./src/data/flights.json) (36 flights, 13 airlines on
the JFK ⇄ LHR route) and is served through Next.js **Route Handlers** that
behave like a real, imperfect network.

| Endpoint | Description |
| --- | --- |
| `GET /api/flights?from=&to=&date=&pax=` | Search flights for a route/date |
| `GET /api/flights/:id?date=&from=&to=` | Resolve a single flight |
| `POST /api/bookings` | Create a booking (validated + repriced server-side) |
| `GET /api/bookings/:reference` | Fetch a booking by reference |

**Simulating real conditions** (so loading/error states are demonstrable):

- Every request has artificial latency (default 350–800 ms).
- Append **`?simulateError=true`** to any request to force a `503` — try
  `http://localhost:3000/search?from=JFK&to=LHR&date=2099-01-01&pax=1&simulateError=true`
  to see the error state with retry.
- Set **`MOCK_FLAKY=1`** to randomly fail ~12% of requests.
- Tune latency with `MOCK_MIN_LATENCY_MS` / `MOCK_MAX_LATENCY_MS`.

> The dataset covers the **JFK ⇄ LHR** route (pre-selected in the form). Other
> routes intentionally return an empty result set to exercise the empty state.

## Project structure

```
src/
├─ app/                      # App Router: pages, layout, route handlers
│  ├─ api/                   # Mock API (flights, bookings)
│  ├─ search/                # Results page
│  ├─ book/[id]/             # Review + booking form
│  └─ booking/[reference]/   # Confirmation
├─ features/                 # Feature modules (search, flights, booking)
├─ components/ui/            # Reusable design-system primitives
├─ hooks/                    # TanStack Query hooks + URL-state hook
├─ lib/                      # Pure logic: sorting, filtering, validation, dates…
├─ data/                     # Mock dataset + repository (hydration)
├─ server/                   # Server-only mock infrastructure
├─ store/                    # Zustand booking-flow store
└─ types/                    # Domain types
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for responsibilities and data flow.

## Testing

65 tests across 12 files (Vitest + Testing Library):

- **Pure logic** — sorting, filtering/faceting, date math, validation schemas,
  URL serialization round-trips, and the flight repository (incl. arrival-time
  derivation).
- **Components / integration** — the search form (valid submit, origin=destination
  guard, swap), flight card, filter panel interactions, and the booking form's
  validation wiring.

```bash
npm test
npm run test:coverage
```

## What I'd do next

Deliberately out of scope for the time-box, with the reasoning:

- **Server-side filtering/sorting + pagination** — currently client-side because
  the dataset is tiny; the seam is already isolated in `lib/` so moving it is a
  swap, not a rewrite. (See ARCHITECTURE.md → _Scalability_.)
- **List virtualization** — unnecessary at 36 rows; would add at ~hundreds.
- **Round-trip search, multi-city, real timezones** — the data model uses
  airport-local wall-clock times to avoid a timezone library; a real build would
  store true instants + IANA zones.
- **E2E tests (Playwright)** — the full search→book→confirm happy path.
- **Persisted booking** — bookings are in-memory (per server process); a real
  backend would use a database.
- **i18n / currency** — formatting already goes through `Intl`, so locale/currency
  is a parameterization, not a refactor.
```
