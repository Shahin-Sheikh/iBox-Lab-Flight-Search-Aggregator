import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Field, Input, Select } from "@/components/ui";
import type { BookingFormValues } from "@/lib/validation";

interface PassengerFieldsProps {
  index: number;
  register: UseFormRegister<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "unspecified", label: "Prefer not to say" },
];

export function PassengerFields({ index, register, errors }: PassengerFieldsProps) {
  const passengerErrors = errors.passengers?.[index];

  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-700">
        Passenger {index + 1}
      </legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" required error={passengerErrors?.firstName?.message}>
          <Input
            autoComplete="given-name"
            placeholder="Jane"
            {...register(`passengers.${index}.firstName`)}
          />
        </Field>

        <Field label="Last name" required error={passengerErrors?.lastName?.message}>
          <Input
            autoComplete="family-name"
            placeholder="Doe"
            {...register(`passengers.${index}.lastName`)}
          />
        </Field>

        <Field label="Date of birth" required error={passengerErrors?.dateOfBirth?.message}>
          <Input type="date" {...register(`passengers.${index}.dateOfBirth`)} />
        </Field>

        <Field label="Gender" error={passengerErrors?.gender?.message}>
          <Select {...register(`passengers.${index}.gender`)}>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Passport number"
          hint="Optional · 5–15 letters or digits"
          error={passengerErrors?.passportNumber?.message}
          className="sm:col-span-2"
        >
          <Input
            autoComplete="off"
            placeholder="X1234567"
            {...register(`passengers.${index}.passportNumber`)}
          />
        </Field>
      </div>
    </fieldset>
  );
}
