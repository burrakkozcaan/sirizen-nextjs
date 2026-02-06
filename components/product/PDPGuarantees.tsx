import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, CheckCircle, RotateCcw } from "lucide-react";
import type { ProductCore } from "@/actions/pdp.actions";

interface PDPGuaranteesProps {
  corePromise: Promise<ProductCore | null>;
}

export function PDPGuarantees({ corePromise }: PDPGuaranteesProps) {
  return (
    <Suspense fallback={<PDPGuaranteesSkeleton />}>
      <PDPGuaranteesContent corePromise={corePromise} />
    </Suspense>
  );
}

async function PDPGuaranteesContent({ corePromise }: PDPGuaranteesProps) {
  const core = await corePromise;

  if (!core || !core.guarantees || core.guarantees.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "original":
        return <ShieldCheck className="w-5 h-5" />;
      case "warranty":
        return <CheckCircle className="w-5 h-5" />;
      case "refund":
        return <RotateCcw className="w-5 h-5" />;
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "original":
        return "%100 Orijinal Ürün";
      case "warranty":
        return "Garantili";
      case "refund":
        return "Kolay İade";
      default:
        return "Garanti";
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm mb-3">Garantiler</h3>
      <div className="space-y-2">
        {core.guarantees.map((guarantee) => (
          <div
            key={guarantee.id}
            className="flex items-start gap-3 p-2 bg-muted/50 rounded"
          >
            <div className="text-primary mt-0.5">{getIcon(guarantee.type)}</div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">
                {getLabel(guarantee.type)}
              </div>
              <p className="text-xs text-muted-foreground">
                {guarantee.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PDPGuaranteesSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

