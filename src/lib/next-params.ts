/** Next's `searchParams` prop shape (values may be arrays for repeated keys). */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Convert Next's `searchParams` object into a standard URLSearchParams. */
export function toURLSearchParams(raw: RawSearchParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value) && value[0] !== undefined) {
      params.set(key, value[0]);
    }
  }
  return params;
}
