"use server";

import { apiGet } from "@/lib/api-server";
import type { SearchTag } from "@/types";

const SEARCH_TAGS_TAG = "search-tags";

export async function getSearchTags(): Promise<SearchTag[]> {
  try {
    const response = await apiGet<{ data: SearchTag[] }>("/search-tags", {
      next: { tags: [SEARCH_TAGS_TAG], revalidate: 3600 },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching search tags:", error);
    return [];
  }
}
