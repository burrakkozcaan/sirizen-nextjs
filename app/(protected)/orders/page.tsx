import { Suspense } from "react";
import { getOrders, getOrderStatusCounts } from "@/actions/order.actions";
import { OrdersClient } from "./OrdersClient";
import { OrdersSkeleton } from "./OrdersSkeleton";

export const metadata = {
  title: "Siparişlerim",
  description: "Sipariş geçmişinizi görüntüleyin",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status || "all";

  // Prefetch data
  const [ordersResult, countsResult] = await Promise.all([
    getOrders(status),
    getOrderStatusCounts(),
  ]);

  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersClient
        initialOrders={ordersResult.data}
        initialCounts={countsResult.data}
        initialStatus={status}
      />
    </Suspense>
  );
}
