import { Skeleton } from '@/components/ui/skeleton'

export function DestinationSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Flag + country */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Visa badge */}
      <Skeleton className="h-5 w-24 rounded-full" />

      {/* Best months */}
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Vibe tags */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Cost range */}
      <Skeleton className="h-4 w-36" />

      {/* Button */}
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  )
}
