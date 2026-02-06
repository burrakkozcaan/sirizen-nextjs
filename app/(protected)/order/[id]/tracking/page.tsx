import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/order.actions";
import { OrderTrackingClient } from "./OrderTrackingClient";
import { OrderTrackingSkeleton } from "./OrderTrackingSkeleton";

export const metadata = {
  title: "Sipariş Takibi",
  description: "Siparişinizin durumunu takip edin",
};

export default async function OrderTrackingPage({
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
    <Suspense fallback={<OrderTrackingSkeleton />}>
      <OrderTrackingClient order={result.data} />
    </Suspense>
  );
}
