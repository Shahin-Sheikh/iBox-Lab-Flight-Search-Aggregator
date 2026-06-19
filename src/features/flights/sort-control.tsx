"use client";

import { Select } from "@/components/ui";
import { SORT_OPTIONS, type SortOption } from "@/types";
import { sortOptionLabel } from "@/lib/format";

interface SortControlProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="whitespace-nowrap font-medium">Sort by</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="h-9 w-auto min-w-[11rem]"
        aria-label="Sort flights"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {sortOptionLabel(option)}
          </option>
        ))}
      </Select>
    </label>
  );
}
