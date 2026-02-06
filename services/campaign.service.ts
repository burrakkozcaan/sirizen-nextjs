import type { Campaign, Coupon } from '@/types';
import { api } from '@/lib/api';
import { mockCoupons } from '@/data/mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const campaignService = {
  /**
   * Get all active campaigns
   */
  async getActive(): Promise<Campaign[]> {
    const res = await api.get<{ data: Campaign[] }>('/campaigns/active');
    return res.data || [];
  },

  /**
   * Get campaign by ID
   */
  async getById(id: number): Promise<Campaign | null> {
    try {
      const res = await api.get<{ data: Campaign }>(`/campaigns/${id}`);
      return res.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Get campaign by slug
   */
  async getBySlug(slug: string): Promise<Campaign | null> {
    try {
      const res = await api.get<{ data: Campaign }>(`/campaigns/${slug}`);
      return res.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Get homepage hero campaigns
   */
  async getHeroCampaigns(): Promise<Campaign[]> {
    try {
      const res = await api.get<{ data: Campaign[] }>('/campaigns/hero');
      return res.data || [];
    } catch {
      // Fallback to active if backend doesn't provide a dedicated hero endpoint
      const res = await api.get<{ data: Campaign[] }>('/campaigns/active');
      return (res.data || []).slice(0, 5);
    }
  },
};

export const couponService = {
  /**
   * Validate coupon code
   */
  async validate(code: string, orderTotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount?: number;
    message?: string;
  }> {
    await delay(200);

    const coupon = mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) {
      return { valid: false, message: 'Geçersiz kupon kodu' };
    }

    if (new Date(coupon.expires_at) < new Date()) {
      return { valid: false, message: 'Bu kuponun süresi dolmuş' };
    }

    if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
      return { 
        valid: false, 
        message: `Bu kupon ${coupon.min_order_amount} TL ve üzeri siparişlerde geçerlidir` 
      };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = orderTotal * (coupon.discount_value / 100);
      if (coupon.max_discount) {
        discount = Math.min(discount, coupon.max_discount);
      }
    } else {
      discount = coupon.discount_value;
    }

    return { valid: true, coupon, discount };
  },

  /**
   * Get available coupons for a product
   */
  async getProductCoupons(productId: number): Promise<Coupon[]> {
    await delay(100);
    // Return general coupons for now
    return mockCoupons.filter(c => new Date(c.expires_at) > new Date());
  },

  /**
   * Get user's available coupons
   */
  async getUserCoupons(): Promise<Coupon[]> {
    await delay(100);
    return mockCoupons.filter(c => new Date(c.expires_at) > new Date());
  },
};
