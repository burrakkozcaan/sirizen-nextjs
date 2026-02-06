import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/order.actions";
import { OrderDetailClient } from "./OrderDetailClient";
import { OrderDetailSkeleton } from "./OrderDetailSkeleton";

export const metadata = {
  title: "Sipariş Detayı",
  description: "Sipariş detaylarını görüntüleyin",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailClient order={result.data} />
    </Suspense>
  );
}
