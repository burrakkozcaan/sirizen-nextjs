"use server";

import { revalidateTag } from "next/cache";
import { apiGet, apiPost } from "@/lib/api-server";

export async function getUserQuestions() {
  try {
    const data = await apiGet<{
      data: any[];
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    }>("/product-questions", {
      next: {
        tags: ["user-questions"],
        revalidate: 0,
      },
    });
    const questions = Array.isArray(data.data) ? data.data : [];
    return { success: true, data: questions };
  } catch (error) {
    return { success: false, data: [], error: "Failed to fetch questions" };
  }
}

export async function askQuestion(productId: number, question: string) {
  try {
    const response = await apiPost<{ data: any; message?: string }>(
      "/product-questions",
      {
        product_id: productId,
        question: question,
      }
    );
    revalidateTag("user-questions", "default");
    revalidateTag(`product-${productId}-questions`, "default");
    return { success: true, data: response.data || response };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Soru eklenirken bir hata oluştu",
    };
  }
}
