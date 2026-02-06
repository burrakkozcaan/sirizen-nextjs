export function OrderTrackingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="bg-card rounded-lg shadow-card p-6">
          <div className="h-32 bg-muted rounded" />
        </div>
        <div className="bg-card rounded-lg shadow-card p-6">
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

