"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-server";
import type { Campaign, Product } from "@/types";

const CAMPAIGNS_TAG = "campaigns";

export async function getActiveCampaigns(): Promise<Campaign[]> {
  try {
    const campaigns = await apiGet<{ data: Campaign[] }>("/campaigns/active", {
      next: { tags: [CAMPAIGNS_TAG], revalidate: 600 }, // Cache for 10 minutes
    });
    return campaigns.data || [];
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return [];
  }
}

export async function getHeroCampaigns(): Promise<Campaign[]> {
  try {
    const campaigns = await apiGet<{ data: Campaign[] }>("/campaigns/hero", {
      next: { tags: [CAMPAIGNS_TAG, "campaigns-hero"], revalidate: 600 },
    });
    return campaigns.data || [];
  } catch (error) {
    // If backend doesn't have a dedicated hero endpoint, fall back to active.
    try {
      const campaigns = await apiGet<{ data: Campaign[] }>("/campaigns/active", {
        next: { tags: [CAMPAIGNS_TAG], revalidate: 600 },
      });
      return (campaigns.data || []).slice(0, 5);
    } catch (fallbackError) {
      console.error("Error fetching hero campaigns:", error, fallbackError);
      return [];
    }
  }
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  try {
    const campaign = await apiGet<{ data: Campaign }>(`/campaigns/${slug}`, {
      next: { tags: [CAMPAIGNS_TAG, `campaign-${slug}`] },
    });
    return campaign.data || null;
  } catch (error) {
    console.error(`Error fetching campaign ${slug}:`, error);
    return null;
  }
}

export async function getCampaignProducts(slug: string, limit: number = 24): Promise<Product[]> {
  try {
    const products = await apiGet<{ data: Product[] }>(`/campaigns/${slug}/products?limit=${limit}`, {
      next: { tags: [CAMPAIGNS_TAG, `campaign-${slug}-products`], revalidate: 300 }, // Cache for 5 minutes
    });
    return products.data || [];
  } catch (error) {
    console.error(`Error fetching products for campaign ${slug}:`, error);
    return [];
  }
}

