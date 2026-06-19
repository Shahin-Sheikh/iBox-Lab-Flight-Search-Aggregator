"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select } from "@/components/ui";
import { SwapIcon } from "@/components/icons";
import { SELECTABLE_AIRPORTS } from "@/data/airports";
import { buildCriteriaQuery } from "@/lib/search-params";
import { searchFormSchema, type SearchFormValues } from "@/lib/validation";

interface SearchFormProps {
  /** Fully specified initial values (date supplied by the server to avoid SSR drift). */
  defaultValues: SearchFormValues;
  /** Earliest selectable departure date (`yyyy-MM-dd`). */
  minDate: string;
  /** Compact layout for the results-page header vs. the hero on the home page. */
  variant?: "hero" | "compact";
}

const PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function SearchForm({ defaultValues, minDate, variant = "hero" }: SearchFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  function onSubmit(values: SearchFormValues) {
    router.push(`/search?${buildCriteriaQuery(values)}`);
  }

  function swapAirports() {
    const { origin, destination } = getValues();
    setValue("origin", destination, { shouldValidate: true });
    setValue("destination", origin, { shouldValidate: true });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Flight search"
      className={
        variant === "hero"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_0.8fr_auto] lg:items-end"
          : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_0.7fr_auto] lg:items-end"
      }
    >
      <Field label="From" error={errors.origin?.message}>
        <Select {...register("origin")}>
          {SELECTABLE_AIRPORTS.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.city} ({airport.code})
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-end justify-center pb-1 lg:pb-2.5">
        <button
          type="button"
          onClick={swapAirports}
          aria-label="Swap origin and destination"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <SwapIcon className="h-4 w-4" />
        </button>
      </div>

      <Field label="To" error={errors.destination?.message}>
        <Select {...register("destination")}>
          {SELECTABLE_AIRPORTS.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.city} ({airport.code})
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Departure" error={errors.date?.message}>
        <Input type="date" min={minDate} {...register("date")} />
      </Field>

      <Field label="Passengers" error={errors.passengers?.message}>
        <Select {...register("passengers", { valueAsNumber: true })}>
          {PASSENGER_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </Select>
      </Field>

      <Button type="submit" size="lg" className="lg:h-11">
        Search flights
      </Button>
    </form>
  );
}
