"use server";

import { apiPost, apiGet } from "@/lib/api-server";

/**
 * Claim/Collect a coupon for a product
 */
export async function claimCoupon(couponId: number, productId?: number): Promise<{
  success: boolean;
  message?: string;
  couponCode?: string;
  error?: string;
}> {
  try {
    const response = await apiPost<{ 
      data: { 
        coupon_code: string;
        message?: string;
      } 
    }>(
      `/coupons/${couponId}/claim`,
      {
        product_id: productId,
      },
      {}
    );
    
    return {
      success: true,
      couponCode: response.data?.coupon_code,
      message: response.data?.message || "Kupon başarıyla kazandınız!",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Kupon kazanılamadı. Lütfen tekrar deneyin.",
    };
  }
}

/**
 * Get user's claimed coupons
 */
export async function getUserClaimedCoupons(): Promise<{
  success: boolean;
  coupons?: Array<{
    id: number;
    code: string;
    title: string;
    discount_type: string;
    discount_value: number;
    expires_at: string;
  }>;
  error?: string;
}> {
  try {
    const response = await apiGet<{ 
      data: Array<{
        id: number;
        code: string;
        title: string;
        discount_type: string;
        discount_value: number;
        expires_at: string;
      }> 
    }>("/coupons/my-coupons", {
      next: { tags: ["user-coupons"], revalidate: 60 },
    });
    
    return {
      success: true,
      coupons: response.data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Kuponlar yüklenemedi.",
    };
  }
}
