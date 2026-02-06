import type { Vendor } from '@/types';
import { mockVendors } from '@/data/mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const vendorService = {
  /**
   * Get all vendors
   */
  async getAll(): Promise<Vendor[]> {
    await delay(200);
    return mockVendors;
  },

  /**
   * Get vendor by ID
   */
  async getById(id: number): Promise<Vendor | null> {
    await delay(150);
    return mockVendors.find(v => v.id === id) || null;
  },

  /**
   * Get vendor by slug
   */
  async getBySlug(slug: string): Promise<Vendor | null> {
    await delay(150);
    return mockVendors.find(v => v.slug === slug) || null;
  },

  /**
   * Get top vendors
   */
  async getTopVendors(limit: number = 10): Promise<Vendor[]> {
    await delay(200);
    return [...mockVendors]
      .sort((a, b) => b.follower_count - a.follower_count)
      .slice(0, limit);
  },

  /**
   * Search vendors
   */
  async search(query: string, limit: number = 10): Promise<Vendor[]> {
    await delay(150);
    const queryLower = query.toLowerCase();
    return mockVendors
      .filter(v => v.name.toLowerCase().includes(queryLower))
      .slice(0, limit);
  },
};
