"use server";

import { revalidateTag } from "next/cache";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";

export async function getOrders(status?: string) {
  try {
    const endpoint =
      status && status !== "all" ? `/orders?status=${status}` : "/orders";
    const data = await apiGet<{ data: any[]; current_page?: number; last_page?: number; per_page?: number; total?: number }>(endpoint, {
      next: {
        tags: ["orders"],
        revalidate: 0, // Always fetch fresh data
      },
    });
    // Handle paginated response
    const orders = Array.isArray(data.data) ? data.data : [];
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, data: [], error: "Failed to fetch orders" };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const data = await apiGet<{ data: any }>(`/orders/${orderId}`, {
      next: {
        tags: [`order-${orderId}`, "orders"],
        revalidate: 0, // Always fetch fresh data
      },
    });
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, data: null, error: "Order not found" };
  }
}

export async function getOrderStatusCounts() {
  try {
    const response = await apiGet<{ data: Record<string, number> }>(
      "/orders/status-counts",
      {
        next: {
          tags: ["orders"],
          revalidate: 0, // Always fetch fresh data
        },
      }
    );
    console.log("API response for status counts:", response);
    // Backend returns { data: { all: 1, pending: 0, ... } }
    // apiGet returns the full response, so we need response.data
    const counts = response.data || {};
    console.log("Extracted counts:", counts);
    return { success: true, data: counts };
  } catch (error) {
    console.error("Error fetching status counts:", error);
    return {
      success: false,
      data: {},
      error: "Failed to fetch status counts",
    };
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const data = await apiPost<{ data: any }>(`/orders/${orderId}/cancel`);
    revalidateTag("orders", "default");
    revalidateTag(`order-${orderId}`, "default");
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to cancel order",
    };
  }
}

export async function createOrder(data: {
  address_id: number;
  payment_method: string;
  items?: Array<{
    product_id: number;
    variant_id?: number;
    quantity: number;
    price: number;
  }>;
  order_items?: Array<{
    product_id: number;
    variant_id?: number;
    quantity: number;
    price: number;
  }>;
  use_cart?: boolean;
  reordered_from_order_id?: number;
  payment_details?: {
    card_number?: string;
    card_month?: string;
    card_year?: string;
    installment?: string;
    use_3d_secure?: boolean;
  };
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log("Creating order with data:", data);
    const response = await apiPost<{ data: any }>("/orders", data, {});
    console.log("Order API response:", response);
    revalidateTag("orders", "default");
    
    // Handle different response structures
    const orderData = response.data?.data || response.data || response;
    return { success: true, data: orderData };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return {
      success: false,
      error: error.message || error.errors?.address_id?.[0] || "Sipariş oluşturulurken bir hata oluştu",
    };
  }
}

