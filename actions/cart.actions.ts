"use server";

import { revalidateTag } from "next/cache";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";

export async function getCart() {
  try {
    const data = await apiGet<{ data: any[] }>("/cart", {
      next: {
        tags: ["cart"],
        revalidate: 60, // 1 minute
      },
    });
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, data: [], error: "Failed to fetch cart" };
  }
}

export async function addToCart(
  productId: number,
  quantity: number = 1,
  variantId?: number,
  vendorId?: number
) {
  try {
    // Only send product_seller_id if it's valid (not 0 or undefined)
    const payload: {
      product_id: number;
      quantity: number;
      variant_id?: number;
      product_seller_id?: number;
    } = {
      product_id: productId,
      quantity,
    };

    if (variantId) {
      payload.variant_id = variantId;
    }

    // Only include product_seller_id if it's a valid number
    if (vendorId && vendorId > 0) {
      payload.product_seller_id = vendorId;
    }

    console.log("Adding to cart with payload:", payload);

    const data = await apiPost<{ data: any }>("/cart/add", payload, {});
    revalidateTag("cart", "default");
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return {
      success: false,
      error: error.message || "Failed to add item to cart",
    };
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const data = await apiPut<{ data: any }>(
      `/cart/${itemId}`,
      {
        quantity,
      },
      {}
    );
    revalidateTag("cart", "default");
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update cart item",
    };
  }
}

export async function removeCartItem(itemId: string) {
  try {
    await apiDelete(`/cart/${itemId}`, {});
    revalidateTag("cart", "default");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to remove cart item",
    };
  }
}

export async function applyCouponCode(code: string) {
  try {
    const data = await apiPost<{ data: any }>(
      "/cart/coupon",
      {
        code: code.toUpperCase(),
      },
      {}
    );
    revalidateTag("cart", "default");
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Invalid coupon code",
    };
  }
}

export async function clearCart() {
  try {
    await apiDelete("/cart/clear", {});
    revalidateTag("cart", "default");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to clear cart",
    };
  }
}

