import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductCore } from "@/actions/pdp.actions";

interface PDPFAQProps {
  corePromise: Promise<ProductCore | null>;
}

export function PDPFAQ({ corePromise }: PDPFAQProps) {
  return (
    <Suspense fallback={<PDPFAQSkeleton />}>
      <PDPFAQContent corePromise={corePromise} />
    </Suspense>
  );
}

async function PDPFAQContent({ corePromise }: PDPFAQProps) {
  const core = await corePromise;

  if (!core || !core.faqs || core.faqs.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-4">Sıkça Sorulanlar</h3>
      <Accordion type="single" collapsible className="w-full">
        {core.faqs.map((faq) => (
          <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function PDPFAQSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

