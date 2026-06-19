import { BookingFlow } from "@/features/booking/booking-flow";
import { parseSearchCriteria } from "@/lib/search-params";
import { toURLSearchParams, type RawSearchParams } from "@/lib/next-params";

export const dynamic = "force-dynamic";

export default async function BookFlightPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { id } = await params;
  const criteria = parseSearchCriteria(toURLSearchParams(await searchParams));

  return <BookingFlow flightId={id} criteria={criteria} />;
}
