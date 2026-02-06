import { Suspense } from "react";
import { SharedListClient } from "./SharedListClient";
import { SharedListSkeleton } from "./SharedListSkeleton";
import { getProductsByIds } from "@/actions/product.actions";
import type { Product } from "@/types";

export const metadata = {
  title: "Paylaşılan Favori Liste",
  description: "Paylaşılan favori ürün listesi",
};

export default async function SharedListPage({
  params,
}: {
  params: Promise<{ encoded: string }>;
}) {
  const { encoded } = await params;

  // Decode the base64 encoded product IDs
  let productIds: number[] = [];
  try {
    const decoded = atob(encoded);
    productIds = decoded.split(",").map((id) => parseInt(id, 10));
  } catch {
    // Invalid encoding
  }

  const productsPromise = productIds.length > 0 
    ? getProductsByIds(productIds)
    : Promise.resolve([]);

  return (
    <Suspense fallback={<SharedListSkeleton />}>
      <SharedListContent 
        productsPromise={productsPromise}
        encoded={encoded}
      />
    </Suspense>
  );
}

async function SharedListContent({
  productsPromise,
  encoded,
}: {
  productsPromise: Promise<Product[]>;
  encoded: string;
}) {
  const products = await productsPromise;

  return <SharedListClient products={products} encoded={encoded} />;
}
