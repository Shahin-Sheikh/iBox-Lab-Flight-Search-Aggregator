"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button, Checkbox } from "@/components/ui";
import type { CabinClass, DepartureWindow, FlightFilters } from "@/types";
import type { FlightFacets } from "@/lib/filtering";
import { hasActiveFilters } from "@/lib/search-params";
import { cabinClassLabel, departureWindowLabel, formatPrice, stopsLabel } from "@/lib/format";

interface FilterPanelProps {
  facets: FlightFacets;
  filters: FlightFilters;
  currency: string;
  onChange: (filters: FlightFilters) => void;
  onReset: () => void;
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

/** Toggle membership of a value within an array filter. */
function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export function FilterPanel({ facets, filters, currency, onChange, onReset }: FilterPanelProps) {
  const [minPrice, maxPrice] = facets.priceRange;
  // Price slider is committed on release to avoid spamming the URL while dragging.
  const [priceValue, setPriceValue] = useState(filters.maxPrice ?? maxPrice);

  useEffect(() => {
    setPriceValue(filters.maxPrice ?? maxPrice);
  }, [filters.maxPrice, maxPrice]);

  const commitPrice = () => {
    onChange({ ...filters, maxPrice: priceValue >= maxPrice ? undefined : priceValue });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Filters</h2>
        {hasActiveFilters(filters) ? (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-2">
        {/* Stops */}
        {facets.stopOptions.length > 1 ? (
          <FilterSection title="Stops">
            <div className="flex flex-col gap-0.5">
              <RadioRow
                name="stops"
                checked={filters.maxStops === undefined}
                onChange={() => onChange({ ...filters, maxStops: undefined })}
                label="Any number of stops"
              />
              {facets.stopOptions.map((stops) => (
                <RadioRow
                  key={stops}
                  name="stops"
                  checked={filters.maxStops === stops}
                  onChange={() => onChange({ ...filters, maxStops: stops })}
                  label={stops === 0 ? "Non-stop only" : `Up to ${stopsLabel(stops).toLowerCase()}`}
                />
              ))}
            </div>
          </FilterSection>
        ) : null}

        {/* Price */}
        {maxPrice > minPrice ? (
          <FilterSection title="Max price (per passenger)">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={10}
              value={priceValue}
              onChange={(event) => setPriceValue(Number(event.target.value))}
              onMouseUp={commitPrice}
              onTouchEnd={commitPrice}
              onKeyUp={commitPrice}
              aria-label="Maximum price"
              className="w-full accent-brand-600"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>{formatPrice(minPrice, currency)}</span>
              <span className="font-medium text-slate-700">
                Up to {formatPrice(priceValue, currency)}
              </span>
            </div>
          </FilterSection>
        ) : null}

        {/* Airlines */}
        {facets.airlines.length > 1 ? (
          <FilterSection title="Airlines">
            <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {facets.airlines.map((facet) => (
                <Checkbox
                  key={facet.airline.code}
                  checked={filters.airlines.includes(facet.airline.code)}
                  onChange={() =>
                    onChange({ ...filters, airlines: toggle(filters.airlines, facet.airline.code) })
                  }
                  label={facet.airline.name}
                  meta={`${facet.count} · ${formatPrice(facet.fromPrice, currency)}`}
                />
              ))}
            </div>
          </FilterSection>
        ) : null}

        {/* Departure window */}
        {facets.departureWindows.length > 1 ? (
          <FilterSection title="Departure time">
            <div className="flex flex-col gap-0.5">
              {facets.departureWindows.map((window: DepartureWindow) => (
                <Checkbox
                  key={window}
                  checked={filters.departureWindows.includes(window)}
                  onChange={() =>
                    onChange({
                      ...filters,
                      departureWindows: toggle(filters.departureWindows, window),
                    })
                  }
                  label={departureWindowLabel(window)}
                />
              ))}
            </div>
          </FilterSection>
        ) : null}

        {/* Cabin class */}
        {facets.cabinClasses.length > 1 ? (
          <FilterSection title="Cabin class">
            <div className="flex flex-col gap-0.5">
              {facets.cabinClasses.map((cabin: CabinClass) => (
                <Checkbox
                  key={cabin}
                  checked={filters.cabinClasses.includes(cabin)}
                  onChange={() =>
                    onChange({ ...filters, cabinClasses: toggle(filters.cabinClasses, cabin) })
                  }
                  label={cabinClassLabel(cabin)}
                />
              ))}
            </div>
          </FilterSection>
        ) : null}
      </div>

      {hasActiveFilters(filters) ? (
        <Button variant="secondary" fullWidth size="sm" className="mt-4" onClick={onReset}>
          Reset filters
        </Button>
      ) : null}
    </div>
  );
}

function RadioRow({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span>{label}</span>
    </label>
  );
}
