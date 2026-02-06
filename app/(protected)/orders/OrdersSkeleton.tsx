export function OrdersSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="h-8 bg-muted rounded w-1/4 mb-6 animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-card p-6 animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-1/4 mb-4" />
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

