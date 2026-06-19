import type { Flight } from "./flight";
import type { SearchCriteria } from "./search";

/** Standard success envelope for list endpoints. */
export interface SearchFlightsResponse {
  criteria: SearchCriteria;
  results: Flight[];
  /** Server time the search ran, ISO string. */
  searchedAt: string;
}

/** Standard error envelope returned by all mock endpoints. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** Optional field-level validation details. */
    fields?: Record<string, string>;
  };
}

/** Error thrown by the typed API client when a request fails. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }
}
