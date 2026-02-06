"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";
import type { QuickLink } from "@/types";

const QUICK_LINKS_TAG = "quick-links";

export async function getQuickLinks(): Promise<QuickLink[]> {
  try {
    const response = await apiGet<{ data: QuickLink[] }>("/quick-links", {
      next: { tags: [QUICK_LINKS_TAG], revalidate: 3600 }, // Cache for 1 hour
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching quick links:", error);
    return [];
  }
}

