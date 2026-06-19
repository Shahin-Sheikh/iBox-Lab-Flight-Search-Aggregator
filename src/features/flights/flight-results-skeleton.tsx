import { Card, Skeleton } from "@/components/ui";

function CardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-6">
        <div className="flex items-center gap-3 sm:w-40">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between gap-4">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-2 w-24" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 sm:w-48">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </Card>
  );
}

export function FlightResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
