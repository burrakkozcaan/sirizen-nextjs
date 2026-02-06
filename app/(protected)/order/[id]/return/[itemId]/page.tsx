import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/order.actions";
import { ReturnRequestClient } from "./ReturnRequestClient";
import { ReturnRequestSkeleton } from "./ReturnRequestSkeleton";

export const metadata = {
  title: "İade Talebi",
  description: "Ürün iade talebi oluşturun",
};

export default async function ReturnRequestPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const result = await getOrderById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <Suspense fallback={<ReturnRequestSkeleton />}>
      <ReturnRequestClient
        order={result.data}
        itemId={Number(itemId)}
      />
    </Suspense>
  );
}

