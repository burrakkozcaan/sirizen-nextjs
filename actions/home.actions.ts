"use server";

import { apiGet } from "@/lib/api-server";
import type { HomeSection } from "@/types";

const HOME_TAG = "home";

/**
 * Get homepage sections from API
 * Returns sections configured in home_sections table
 */
export async function getHomeSections(): Promise<HomeSection[]> {
  try {
    const response = await apiGet<{ data: HomeSection[] }>(
      `/home`,
      {
        next: { tags: [HOME_TAG, "home-sections"], revalidate: 300 },
      }
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching home sections:", error);
    return [];
  }
}
