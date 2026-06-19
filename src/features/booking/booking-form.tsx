"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Alert, Button, Field, Input } from "@/components/ui";
import { PassengerFields } from "./passenger-fields";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validation";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { ApiError } from "@/types";
import type { BookingRequest, Flight, Gender, SearchCriteria } from "@/types";

function emptyPassenger(): BookingFormValues["passengers"][number] {
  return {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "unspecified",
    passportNumber: "",
  };
}

export function createBookingDefaults(passengerCount: number): BookingFormValues {
  return {
    passengers: Array.from({ length: passengerCount }, emptyPassenger),
    contact: { email: "", phone: "" },
  };
}

interface BookingFormProps {
  flight: Flight;
  criteria: SearchCriteria;
}

export function BookingForm({ flight, criteria }: BookingFormProps) {
  const router = useRouter();
  const mutation = useCreateBooking();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: createBookingDefaults(criteria.passengers),
    mode: "onTouched",
  });

  const { fields } = useFieldArray({ control, name: "passengers" });

  function onSubmit(values: BookingFormValues) {
    const request: BookingRequest = {
      flightId: flight.id,
      date: criteria.date,
      origin: criteria.origin,
      destination: criteria.destination,
      passengers: values.passengers.map((passenger) => ({
        firstName: passenger.firstName.trim(),
        lastName: passenger.lastName.trim(),
        dateOfBirth: passenger.dateOfBirth,
        gender: passenger.gender as Gender,
        passportNumber: passenger.passportNumber ? passenger.passportNumber : undefined,
      })),
      contact: {
        email: values.contact.email.trim(),
        phone: values.contact.phone.trim(),
      },
    };

    mutation.mutate(request, {
      onSuccess: (booking) => router.push(`/booking/${booking.reference}`),
    });
  }

  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : "We couldn't complete your booking. Please try again."
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Passenger details</h2>
        {fields.map((field, index) => (
          <PassengerFields key={field.id} index={index} register={register} errors={errors} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Contact details</h2>
        <p className="text-sm text-slate-500">We will email your booking confirmation.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" required error={errors.contact?.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              {...register("contact.email")}
            />
          </Field>
          <Field label="Phone" required error={errors.contact?.phone?.message}>
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 123 4567"
              {...register("contact.phone")}
            />
          </Field>
        </div>
      </section>

      {errorMessage ? (
        <Alert tone="error" title="Booking failed">
          {errorMessage}
        </Alert>
      ) : null}

      <div className="flex items-center justify-end">
        <Button type="submit" size="lg" isLoading={mutation.isPending}>
          Confirm booking
        </Button>
      </div>
    </form>
  );
}
