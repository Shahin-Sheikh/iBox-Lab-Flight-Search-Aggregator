/**
 * Helpers that make the mock API behave like a real, imperfect network:
 * artificial latency (so loading states are visible) and opt-in / optional
 * failures (so the error state is demonstrable).
 *
 * This module is only ever imported by route handlers, so it stays server-side.
 */
import type { ApiErrorBody } from "@/types";

const MIN_LATENCY_MS = Number(process.env.MOCK_MIN_LATENCY_MS ?? 350);
const MAX_LATENCY_MS = Number(process.env.MOCK_MAX_LATENCY_MS ?? 800);

/** Set MOCK_FLAKY=1 to randomly fail ~12% of requests (off by default). */
const FLAKY = process.env.MOCK_FLAKY === "1";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateLatency(): Promise<void> {
  const span = Math.max(0, MAX_LATENCY_MS - MIN_LATENCY_MS);
  await sleep(MIN_LATENCY_MS + Math.random() * span);
}

/**
 * Whether this request should fail. Deterministic via `?simulateError=true`
 * (great for demos/tests) plus an optional random failure when MOCK_FLAKY=1.
 */
export function shouldFail(params: URLSearchParams): boolean {
  if (params.get("simulateError") === "true") return true;
  return FLAKY && Math.random() < 0.12;
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): Response {
  const body: ApiErrorBody = { error: { code, message, fields } };
  return Response.json(body, { status });
}

export function serviceUnavailable(): Response {
  return jsonError(
    503,
    "upstream_unavailable",
    "The flight provider is temporarily unavailable. Please try again.",
  );
}
