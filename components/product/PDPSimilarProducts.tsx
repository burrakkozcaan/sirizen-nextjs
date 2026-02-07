import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";
import { getSimilarProducts, getRelatedProducts } from "@/actions/product.actions";

interface PDPSimilarProductsProps {
  productId: number;
  type?: "similar" | "related";
  relationType?: "cross" | "up" | "also_bought";
}

export function PDPSimilarProducts({
  productId,
  type = "similar",
  relationType,
}: PDPSimilarProductsProps) {
  const productsPromise =
    type === "similar"
      ? getSimilarProducts(productId, 12)
      : getRelatedProducts(productId, relationType || "cross", 12);

  return (
    <Suspense fallback={<PDPSimilarProductsSkeleton />}>
      <PDPSimilarProductsContent productsPromise={productsPromise} type={type} />
    </Suspense>
  );
}

async function PDPSimilarProductsContent({
  productsPromise,
  type,
}: {
  productsPromise: Promise<Product[]>;
  type: "similar" | "related";
}) {
  const products = await productsPromise;

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-4">
        {type === "similar" ? "Benzer Ürünler" : "Bu Ürünü Alanlar Bunu da Aldı"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function PDPSimilarProductsSkeleton() {
  return (
    <section className="mt-12">
      <Skeleton className="h-7 w-48 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </section>
  );
}

