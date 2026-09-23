import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={`bg-card border rounded-xl p-5 ${className}`}>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

// Mirrors app/page.tsx's real row layout so nothing jumps when the real
// data swaps in.
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <CardSkeleton lines={2} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton className="lg:col-span-2" lines={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton lines={3} />
        <CardSkeleton lines={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
