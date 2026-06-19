# Architecture

This document explains how the app is structured and **why** — the trade-offs
behind each significant decision. It is meant to be defensible in a technical
discussion.

## Guiding principles

1. **Separation of concerns.** Pure business logic (sorting, filtering, date
   math, validation) lives in framework-agnostic modules under `lib/` and is
   unit-tested in isolation. React components stay thin and presentational.
2. **One source of truth per kind of state.** Each category of state has exactly
   one owner (see [State management](#state-management)). No category is mirrored
   in two places where it could drift.
3. **The right altitude.** Reach for a library when it earns its keep (TanStack
   Query, RHF), hand-roll when it doesn't (a `cn()` helper instead of a styling
   lib; inline SVGs instead of an icon package).
4. **Make impossible states unrepresentable.** Strict TypeScript (including
   `noUncheckedIndexedAccess`) and Zod schemas push errors to compile/parse time.

## High-level flow

```
  Home ( / )
    └─ SearchForm ──(push /search?from&to&date&pax)──►
  Results ( /search )
    ├─ reads criteria/filters/sort from the URL
    ├─ TanStack Query → GET /api/flights
    └─ Select ──(push /book/:id?from&to&date&pax)──►
  Review + Booking ( /book/[id] )
    ├─ TanStack Query → GET /api/flights/:id  (seeded from store)
    └─ Submit ──(POST /api/bookings)──►
  Confirmation ( /booking/[reference] )
    └─ TanStack Query → GET /api/bookings/:reference  (seeded from store)
```

Each page is **reconstructable from the URL + API alone** — the in-memory store
is an optimization for instant hand-offs, never a requirement for correctness.
This makes every screen refresh-safe and shareable.

## State management

The single most important design decision. Rather than one global store, state
is split by **nature and lifetime** into three layers, each with one owner:

| Layer | Owns | Mechanism | Why here |
| --- | --- | --- | --- |
| **URL** | Search criteria, filters, sort | `URLSearchParams` via `lib/search-params.ts` + `hooks/use-search-url-state.ts` | This state _is_ navigational. Putting it in the URL makes results **shareable, bookmarkable, and back/forward-correct** for free. |
| **Server cache** | Flights, a single flight, bookings | **TanStack Query** | Server data needs caching, request dedupe, retries, and built-in `isLoading/isError/data` — exactly the loading/empty/error states the brief asks for. |
| **Client flow** | Selected flight, last booking | **Zustand** (`store/booking-flow-store.ts`) | Ephemeral hand-off across routes for instant UX. Deliberately **not persisted** so it can't become a second source of truth. |
| **Form** | In-progress form fields | **React Hook Form** | Local, high-frequency state; RHF keeps re-renders minimal. |

**Why not Redux / one global store?** The categories above have different
lifecycles, serialization needs, and consumers. Forcing them into one store
would mean re-implementing caching/invalidation (Query gives it for free) and
losing URL-shareability. Three small, purpose-built layers are simpler to reason
about than one large one.

**Why the URL for filters?** A user who filters to "non-stop, British Airways,
under \$700, morning" can copy the link and a colleague sees the same results.
Filter changes use `router.replace` (not `push`) so they don't spam history.

## Data modelling & the mock API

### Normalized data, hydrated on read
`flights.json` stores **normalized** records (airline/airport **codes**, an
origin-local departure time, and a duration). The repository
(`data/flight-repository.ts`) **hydrates** these into rich `Flight` objects —
resolving airline/airport reference data and **deriving** the arrival time:

```
arrival_local = departure_local + duration + (destOffset − originOffset)
```

This keeps the dataset compact and, crucially, gives a **single source of truth**
for each value (arrival is computed, never hand-authored and never able to drift
from the duration).

### Date/time trade-off (called out deliberately)
Flight times are modelled as **airport-local wall-clock** ISO strings with no
timezone offset (e.g. `2026-06-25T08:30:00`). Formatting re-anchors the
components onto a UTC `Date` and formats with `timeZone: "UTC"`, so a time
renders **identically regardless of the viewer's timezone** and tests are
deterministic. `durationMinutes` is authoritative.

A production system spanning real timezones would instead store true UTC
instants plus IANA zone ids and format per-airport. That correctness wasn't worth
a timezone dependency for mock data — but the formatting is centralized in
`lib/datetime.ts`, so swapping the strategy touches one module.

### Date rebasing
The API rebases the dataset onto the **searched date**, so a search for any
future date returns results (rather than the data going stale). Passenger count
filters out fares with insufficient `seatsAvailable`, making it meaningful.

### A realistic, imperfect network
Route handlers add artificial latency and support deterministic failure
(`?simulateError=true`) plus optional random flakiness (`MOCK_FLAKY=1`). This
makes the loading and error states **real**, not decorative.

### Server is authoritative
`POST /api/bookings` doesn't trust the client. It re-resolves the flight by
id/date server-side, re-checks seat availability, and re-computes the total
before confirming — mirroring how a real booking service guards against stale or
tampered client state. Validation uses the **same Zod schema** on both sides.

## Folder structure & responsibilities

```
app/          Routing, layout, providers, and the mock API route handlers.
features/     Self-contained feature modules. Each owns its components and the
              orchestration of its slice (search, flights/results, booking).
components/ui Design-system primitives (Button, Input, Field, Card, Alert …):
              presentational, reusable, accessible, no business logic.
hooks/        React bindings: TanStack Query hooks and the URL-state hook.
lib/          Pure, framework-agnostic logic — the most heavily unit-tested layer
              (sorting, filtering/faceting, validation, datetime, search-params).
data/         The dataset and the repository that hydrates it.
server/       Server-only mock infrastructure (latency/failure, booking store).
store/        The Zustand booking-flow store.
types/        Domain types — the shared contract every layer depends on.
```

Dependencies point **inward**: `features` → `hooks`/`lib`/`components` → `types`.
`lib` never imports from `features`, which keeps it pure and testable.

## Reusability

- **Design system** (`components/ui`): every control is a small, composable
  primitive. `Field` injects `id`/`aria-invalid`/`aria-describedby` into its
  child automatically, so every form gets correct label/error wiring "for free."
- **`FlightItinerary`** is shared between the booking review and the
  confirmation screens.
- **Faceting** (`deriveFacets`) drives the filter UI generically from data, so
  the panel adapts to whatever the result set contains.

## States: loading / empty / error

| Situation | Handling |
| --- | --- |
| Loading results | Skeleton cards (`FlightResultsSkeleton`) |
| No valid search in URL | Empty state → back to search |
| Route has no flights | Empty state explaining the seeded route |
| Filters exclude everything | Distinct empty state → "clear filters" |
| Request failed | `Alert` with a **Retry** button (`query.refetch()`) |
| Booking not found / expired | Dedicated 404 empty state |

Query retries are tuned (`app/providers.tsx`): retry transient `5xx`/network
errors a couple of times, **never** retry `4xx`, and never retry mutations.

## Accessibility

- Labels are programmatically associated with inputs; errors use `role="alert"`
  and `aria-describedby`; invalid fields set `aria-invalid`.
- Result counts and live regions use `aria-live="polite"`.
- Focus-visible rings on all interactive elements; the booking `Stepper` exposes
  `aria-current="step"`.
- Buttons expose `aria-busy` while loading; the spinner has an `sr-only` label.

## Performance

- `staleTime` (60 s) avoids refetching on quick navigations; the selected flight
  is seeded into the detail query via `initialData` for an instant review screen.
- Derived data (facets, filtered+sorted list) is memoized.
- The price slider commits to the URL on release, not on every drag tick.
- Server pages that depend on "today" are `force-dynamic`; everything else is
  statically analyzable.

## Testing strategy

- **Logic-first:** the pure `lib/` and `data/` modules carry the bulk of the
  coverage because that's where correctness lives (sorting orders, filter
  predicates, faceting, date derivation, validation rules, URL round-trips).
- **Integration over snapshots:** component tests assert **behavior** via
  accessible roles/text (does the form block an invalid submit? does selecting a
  filter emit the right state?) rather than brittle DOM snapshots.
- **Deterministic:** factories build domain objects; far-future/past dates keep
  date-sensitive assertions stable over time.

## Scalability — how this grows

The architecture anticipates real-world growth without a rewrite:

- **Server-side search:** filtering/sorting/pagination currently run client-side
  (fine for 36 rows). The logic is isolated in `lib/`, and the API already takes
  query params — moving filters server-side and adding cursor pagination is a
  contained change. `useFlightSearch` would become `useInfiniteQuery`.
- **Virtualization:** drop in `@tanstack/react-virtual` at the `FlightList`
  boundary when result counts reach the hundreds.
- **Real backend:** swap `data/flight-repository.ts` + `server/booking-store.ts`
  for real services; the typed API client and route-handler contracts stay put.
- **Design system:** primitives are ready to be promoted to a shared package.
- **i18n/currency:** all formatting flows through `Intl` with a `locale`
  parameter already threaded through `lib/format.ts` and `lib/datetime.ts`.

## Key decisions at a glance

| Decision | Alternative considered | Why this |
| --- | --- | --- |
| URL as source of truth for search/filter/sort | Local component state | Shareable, refresh-safe, back-button correct |
| TanStack Query for server state | `useEffect` + `useState` | Free caching, dedupe, retry, loading/error states |
| Zustand (unpersisted) for flow | Persisted store / Context | Instant hand-off without a drift-prone second source of truth |
| One Zod schema shared client/server | Separate validators | No duplication; the server stays authoritative |
| Wall-clock times, no TZ lib | Full timezone modelling | Right altitude for mock data; isolated for later change |
| Client-side filter/sort | Server-side from day one | Simplest correct thing for the dataset; seam is ready to move |
| Feature-based folders | Layer-based (all components together) | Co-locates a feature's concerns; scales with the app |
