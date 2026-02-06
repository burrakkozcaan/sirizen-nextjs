'use client';

export function ProductSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Image Skeleton */}
        <div className="lg:col-span-8">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
          <div className="mt-4 flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square w-20 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-4 lg:col-span-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
