import { BookingConfirmationView } from "@/features/booking/booking-confirmation-view";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  return <BookingConfirmationView reference={reference} />;
}
