import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/actions/category.actions";
import { CategoryClient } from "./CategoryClient";
import { CategorySkeleton } from "./CategorySkeleton";

export const metadata = {
  title: "Kategori",
  description: "Kategori ürünleri",
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    free_shipping?: string;
    in_stock?: string;
    rating?: string;
    vendor_city?: string;
    vendor_district?: string;
    page?: string;
  }>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const categoryPromise = getCategoryBySlug(slug);

  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent
        categoryPromise={categoryPromise}
        slug={slug}
        searchParams={searchParamsResolved}
      />
    </Suspense>
  );
}

async function CategoryContent({
  categoryPromise,
  slug,
  searchParams,
}: {
  categoryPromise: ReturnType<typeof getCategoryBySlug>;
  slug: string;
  searchParams: {
    sort?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    free_shipping?: string;
    in_stock?: string;
    rating?: string;
    vendor_city?: string;
    vendor_district?: string;
    page?: string;
  };
}) {
  const category = await categoryPromise;

  if (!category) {
    notFound();
  }

  return (
    <CategoryClient
      category={category}
      slug={slug}
      searchParams={searchParams}
    />
  );
}
