import type {
  Booking,
  BookingRequest,
  Flight,
  SearchCriteria,
  SearchFlightsResponse,
} from "@/types";
import { ApiError } from "@/types";
import { buildCriteriaQuery } from "@/lib/search-params";

/**
 * Thin typed wrapper around `fetch`. All endpoints return either a typed body
 * or throw an {@link ApiError}, so callers (TanStack Query hooks) get a single
 * consistent error shape.
 */
async function request<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (cause) {
    // Network-level failure (offline, DNS, aborted-by-browser, etc.).
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause;
    }
    throw new ApiError(0, {
      code: "network_error",
      message: "Couldn't reach the server. Check your connection and try again.",
    });
  }

  if (!response.ok) {
    let body: { error?: { code: string; message: string; fields?: Record<string, string> } } | undefined;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new ApiError(response.status, body?.error ?? {
      code: "unknown_error",
      message: response.statusText || "Something went wrong. Please try again.",
    });
  }

  return (await response.json()) as T;
}

export interface FlightDetailParams {
  date: string;
  origin?: string;
  destination?: string;
}

export const flightsApi = {
  search(criteria: SearchCriteria, signal?: AbortSignal): Promise<SearchFlightsResponse> {
    return request<SearchFlightsResponse>(`/api/flights?${buildCriteriaQuery(criteria)}`, {
      signal,
    });
  },

  getById(id: string, params: FlightDetailParams, signal?: AbortSignal): Promise<Flight> {
    const query = new URLSearchParams({ date: params.date });
    if (params.origin) query.set("from", params.origin);
    if (params.destination) query.set("to", params.destination);
    return request<Flight>(`/api/flights/${encodeURIComponent(id)}?${query.toString()}`, {
      signal,
    });
  },
};

export const bookingsApi = {
  create(payload: BookingRequest, signal?: AbortSignal): Promise<Booking> {
    return request<Booking>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });
  },

  getByReference(reference: string, signal?: AbortSignal): Promise<Booking> {
    return request<Booking>(`/api/bookings/${encodeURIComponent(reference)}`, { signal });
  },
};
