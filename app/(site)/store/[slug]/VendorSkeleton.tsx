export function VendorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="container mx-auto px-4 py-6">
        <div className="h-24 bg-muted rounded-lg mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

