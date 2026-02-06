export function ReturnRequestSkeleton() {
  return (
    <div className="min-h-screen bg-secondary pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
