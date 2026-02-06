"use server";

import { apiPost, apiGet } from "@/lib/api-server";

export interface PayTRTokenResponse {
  success: boolean;
  data?: {
    token: string;
    merchant_oid: string;
    iframe_url: string;
  };
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    status: string;
    merchant_oid?: string;
  };
  message?: string;
}

/**
 * PayTR ödeme token'ı oluştur
 */
export async function createPayTRToken(
  orderId: number,
  customerData: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    installment?: number;
  }
): Promise<PayTRTokenResponse> {
  try {
    const response = await apiPost<PayTRTokenResponse>(
      "/payments/paytr/token",
      {
        order_id: orderId,
        ...customerData,
      }
    );

    return response;
  } catch (error: any) {
    console.error("PayTR token creation error:", error);
    return {
      success: false,
      message: error.message || "Ödeme token'ı oluşturulamadı",
    };
  }
}

/**
 * Ödeme durumunu sorgula
 */
export async function checkPaymentStatus(
  orderId: number
): Promise<PaymentStatusResponse> {
  try {
    const response = await apiGet<PaymentStatusResponse>(
      `/payments/status/${orderId}`
    );

    return response;
  } catch (error: any) {
    console.error("Payment status check error:", error);
    return {
      success: false,
      message: error.message || "Ödeme durumu sorgulanamadı",
    };
  }
}
