import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getVendorBySlug } from "@/actions/vendor.actions";
import { getProductsByVendor } from "@/actions/product.actions";
import { VendorClient } from "./VendorClient";
import { VendorSkeleton } from "./VendorSkeleton";

export const metadata = {
  title: "Mağaza",
  description: "Mağaza detay sayfası",
};

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendorPromise = getVendorBySlug(slug);

  return (
    <Suspense fallback={<VendorSkeleton />}>
      <VendorContent vendorPromise={vendorPromise} slug={slug} />
    </Suspense>
  );
}

async function VendorContent({
  vendorPromise,
  slug,
}: {
  vendorPromise: ReturnType<typeof getVendorBySlug>;
  slug: string;
}) {
  const vendor = await vendorPromise;

  if (!vendor) {
    notFound();
  }

  const productsPromise = getProductsByVendor(vendor.slug, { per_page: 24 });

  return <VendorClient vendor={vendor} productsPromise={productsPromise} />;
}
