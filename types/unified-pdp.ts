/**
 * UNIFIED PDP SCHEMA
 * 
 * PDP + Cart Modal = Tek API, Tek Şema, Farklı Context
 * 
 * Endpoint: GET /api/pdp/{slug}?context=page|cart|modal|quickview
 * 
 * Kural: Frontend ASLA karar vermez. Backend block listesi ne diyorsa o render edilir.
 */

// ============================================
// 1. CORE PRODUCT (Tüm context'lerde ortak)
// ============================================

export interface UnifiedProduct {
  id: number;
  title: string;
  slug: string;
  description?: string;
  brand?: {
    id: number;
    name: string;
    slug: string;
    logo?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    group?: string; // "giyim", "elektronik", "kozmetik"
  };
  images: Array<{
    id: number;
    url: string;
    alt?: string;
    order: number;
  }>;
  attributes: Array<{
    key: string;
    label: string;
    value: string;
    display_value: string;
    icon?: string;
  }>;
}

// ============================================
// 2. PRICING & STOCK (Dynamic - cache strategy farklı)
// ============================================

export interface UnifiedPricing {
  price: number;
  sale_price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
  currency: string;
  stock: number;
  is_in_stock: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  low_stock_threshold?: number;
}

export interface UnifiedVariant {
  id: number;
  sku: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_default: boolean;
  attributes: Record<string, string>; // { "beden": "M", "renk": "Siyah" }
  image?: string;
}

export interface UnifiedVariantConfig {
  enabled: boolean; // Kozmetikte false, giyimde true
  attributes: Array<{
    key: string;
    label: string;
    type: 'select' | 'color' | 'size' | 'button';
    values: Array<{
      value: string;
      label: string;
      available: boolean;
      stock: number;
      color_hex?: string; // Renk tipi için
    }>;
  }>;
  combinations: UnifiedVariant[];
  selection_required: boolean; // Varyant seçimi zorunlu mu?
}

// ============================================
// 3. VENDOR / SELLER (Multi-seller için)
// ============================================

export interface UnifiedVendor {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  review_count: number;
  product_count?: number;
  follower_count?: number;
  years_on_platform?: number;
  response_time?: string;
  is_official: boolean;
  shipping: {
    estimated_days: number;
    same_day_cutoff?: string;
    free_shipping_threshold?: number;
  };
  price?: number; // Seller-specific price
  stock?: number; // Seller-specific stock
}

// ============================================
// 4. CAMPAIGNS & BADGES
// ============================================

export interface UnifiedBadge {
  key: string;
  label: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  priority: number;
}

export interface UnifiedCampaign {
  id: number;
  title: string;
  type: 'discount' | 'coupon' | 'bundle' | 'flash';
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  badge_text?: string;
  min_order?: number;
  valid_until?: string;
}

// ============================================
// 5. BLOCK SYSTEM (Context'e göre değişir)
// ============================================

export type PdpBlockType =
  // Gallery
  | 'gallery' | 'thumbnail_nav' | 'zoom'
  // Info
  | 'breadcrumbs' | 'title' | 'rating' | 'badges'
  // Pricing
  | 'price' | 'installments' | 'coupon_input'
  // Variants
  | 'variant_selector' | 'size_guide' | 'color_selector'
  // Actions
  | 'quantity_selector' | 'add_to_cart' | 'add_to_favorites' | 'add_to_list'
  // Seller
  | 'seller_info' | 'seller_selector' | 'shipping_info'
  // Campaigns
  | 'campaigns' | 'bundles' | 'flash_sale_timer'
  // Details
  | 'description' | 'attributes' | 'highlights'
  // Social
  | 'social_proof' | 'reviews_summary' | 'qa_summary'
  // Related
  | 'related_products' | 'similar_products' | 'bought_together';

export interface PdpBlock {
  block: PdpBlockType;
  position: 'main' | 'sidebar' | 'sticky' | 'modal_header' | 'modal_body' | 'modal_footer';
  order: number;
  visible: boolean;
  props?: Record<string, unknown>;
}

// ============================================
// 6. RULES (Context ve kategori bazlı davranış)
// ============================================

export interface PdpRules {
  // Variant rules
  disable_add_until_variant_selected: boolean;
  show_out_of_stock_variants: boolean;
  
  // Stock rules
  show_stock_warning_threshold: number; // 5 ise, stok 5 ve altındaysa uyarı göster
  
  // Seller rules
  allow_multi_seller: boolean; // Elektronikte true, giyimde false
  show_all_sellers: boolean;
  
  // Action rules
  show_quantity_selector: boolean;
  max_quantity: number;
  
  // UI rules
  show_size_guide: boolean;
  show_installments: boolean;
  show_social_proof: boolean;
}

// ============================================
// 7. UNIFIED RESPONSE (Tek schema)
// ============================================

export interface UnifiedPdpResponse {
  // Meta (cache ve context bilgisi)
  meta: {
    context: 'page' | 'cart' | 'modal' | 'quickview';
    category_group: string;
    cached_at: string;
    expires_at: string;
  };

  // Core data
  product: UnifiedProduct;
  pricing: UnifiedPricing;
  
  // Optional based on category
  variants: UnifiedVariantConfig;
  vendors: UnifiedVendor[];
  
  // Marketing
  badges: UnifiedBadge[];
  campaigns: UnifiedCampaign[];
  
  // Layout (Context'e göre filtrelenmiş)
  blocks: PdpBlock[];
  
  // Behavior rules
  rules: PdpRules;
  
  // Social proof (dynamic - category'ye göre filtrelenmiş)
  social_proof?: ProductSocialProof;
}

// ============================================
// 8. CONTEXT-SPECIFIC PARTIAL TYPES
// ============================================

// Cart/Modal için sadece gerekli bloklar
export type CartModalBlock = 
  | 'gallery' 
  | 'title' 
  | 'price' 
  | 'badges'
  | 'variant_selector'
  | 'seller_selector'
  | 'campaigns'
  | 'add_to_cart';

// QuickView için orta seviye
export type QuickViewBlock =
  | 'gallery'
  | 'title'
  | 'rating'
  | 'price'
  | 'badges'
  | 'variant_selector'
  | 'seller_info'
  | 'description'
  | 'add_to_cart';

// Full PDP için tüm bloklar
export type FullPdpBlock = PdpBlockType;

// ============================================
// 9. API PARAMS
// ============================================

export interface PdpApiParams {
  context?: 'page' | 'cart' | 'modal' | 'quickview';
  variant_id?: number;
  seller_id?: number;
  selected_attributes?: Record<string, string>;
}

// ============================================
// 10. HELPER TYPES
// ============================================

export interface PdpCacheKey {
  slug: string;
  context: string;
  variant_id?: number;
  seller_id?: number;
}

// Category Group tanımları
export const CATEGORY_GROUPS = {
  GIYIM: 'giyim',
  ELEKTRONIK: 'elektronik',
  KOZMETIK: 'kozmetik',
  EV_YASAM: 'ev_yasam',
  GIDA: 'gida',
  KITAP: 'kitap',
  SPOR: 'spor',
  DEFAULT: 'default',
} as const;

// Block visibility by context
export const BLOCK_VISIBILITY: Record<string, PdpBlockType[]> = {
  page: [
    'gallery', 'thumbnail_nav', 'zoom',
    'breadcrumbs', 'title', 'rating', 'badges',
    'price', 'installments', 'coupon_input',
    'variant_selector', 'size_guide', 'color_selector',
    'quantity_selector', 'add_to_cart', 'add_to_favorites',
    'seller_info', 'seller_selector', 'shipping_info',
    'campaigns', 'bundles', 'flash_sale_timer',
    'description', 'attributes', 'highlights',
    'social_proof', 'reviews_summary', 'qa_summary',
    'related_products', 'similar_products', 'bought_together'
  ],
  modal: [
    'gallery',
    'title',
    'price',
    'badges',
    'variant_selector',
    'seller_selector',
    'campaigns',
    'quantity_selector',
    'add_to_cart'
  ],
  quickview: [
    'gallery',
    'title',
    'rating',
    'price',
    'badges',
    'variant_selector',
    'seller_info',
    'description',
    'add_to_cart'
  ],
  cart: [
    'title',
    'price',
    'variant_selector',
    'seller_info',
    'add_to_cart'
  ]
};

// Category-based rules
export const CATEGORY_RULES: Record<string, Partial<PdpRules>> = {
  [CATEGORY_GROUPS.GIYIM]: {
    disable_add_until_variant_selected: true,
    show_size_guide: true,
    show_stock_warning_threshold: 5,
    allow_multi_seller: false,
  },
  [CATEGORY_GROUPS.ELEKTRONIK]: {
    disable_add_until_variant_selected: false,
    show_size_guide: false,
    show_stock_warning_threshold: 3,
    allow_multi_seller: true,
  },
  [CATEGORY_GROUPS.KOZMETIK]: {
    disable_add_until_variant_selected: false,
    show_size_guide: false,
    show_stock_warning_threshold: 10,
    allow_multi_seller: false,
  },
  default: {
    disable_add_until_variant_selected: false,
    show_size_guide: false,
    show_stock_warning_threshold: 5,
    allow_multi_seller: false,
  }
};

// ============================================
// 11. CATEGORY ALLOWED ATTRIBUTES (ÇOK ÖNEMLİ)
// ============================================
// Backend bu tabloya göre validate eder
// Vendor "beden" gönderirse ama kategori kozmetikse → DROP

export interface CategoryAttributeSchema {
  allowed_variant_attributes: string[];  // Varyant oluşturabilecek attribute'lar
  allowed_highlight_attributes: string[]; // Ürün özelliği olarak gösterilecekler
  required_attributes: string[];          // Zorunlu alanlar
  social_proof_config: {
    show_view_count: boolean;
    show_cart_count: boolean;
    show_sold_count: boolean;
    show_review_count: boolean;
  };
}

export const CATEGORY_ATTRIBUTE_SCHEMA: Record<string, CategoryAttributeSchema> = {
  [CATEGORY_GROUPS.GIYIM]: {
    allowed_variant_attributes: ['beden', 'renk', 'boy'],
    allowed_highlight_attributes: ['material', 'kalip', 'yaka_tipi', 'kol_boyu', 'desen'],
    required_attributes: ['beden'],
    social_proof_config: {
      show_view_count: true,
      show_cart_count: true,
      show_sold_count: true,
      show_review_count: true,
    }
  },
  [CATEGORY_GROUPS.ELEKTRONIK]: {
    allowed_variant_attributes: ['renk', 'kapasite', 'ram', 'depolama'],
    allowed_highlight_attributes: ['marka', 'model', 'garanti', 'islemci', 'ekran_boyutu', 'pil_kapasitesi'],
    required_attributes: [],
    social_proof_config: {
      show_view_count: true,
      show_cart_count: true,
      show_sold_count: true,
      show_review_count: true,
    }
  },
  [CATEGORY_GROUPS.KOZMETIK]: {
    allowed_variant_attributes: ['renk', 'hacim', 'ton'],  // ❌ beden YOK
    allowed_highlight_attributes: ['cilt_tipi', 'icerik', 'kullanim_alani', 'spf', 'formul'],
    required_attributes: [],
    social_proof_config: {
      show_view_count: true,
      show_cart_count: false, // Kozmetikte sepet sayısı gösterme
      show_sold_count: true,
      show_review_count: true,
    }
  },
  [CATEGORY_GROUPS.EV_YASAM]: {
    allowed_variant_attributes: ['renk', 'boyut', 'malzeme'],
    allowed_highlight_attributes: ['olcu', 'agirlik', 'malzeme', 'marka'],
    required_attributes: [],
    social_proof_config: {
      show_view_count: false,
      show_cart_count: false,
      show_sold_count: true,
      show_review_count: true,
    }
  },
  [CATEGORY_GROUPS.GIDA]: {
    allowed_variant_attributes: ['agirlik', 'adet'],
    allowed_highlight_attributes: ['son_kullanma', 'mensei', 'besin_degeri', 'alerjen'],
    required_attributes: ['son_kullanma'],
    social_proof_config: {
      show_view_count: false,
      show_cart_count: false,
      show_sold_count: true,
      show_review_count: true,
    }
  },
  default: {
    allowed_variant_attributes: ['renk', 'boyut'],
    allowed_highlight_attributes: ['marka', 'model'],
    required_attributes: [],
    social_proof_config: {
      show_view_count: false,
      show_cart_count: false,
      show_sold_count: false,
      show_review_count: true,
    }
  }
};

// ============================================
// 12. SOCIAL PROOF CONFIG (Ürüne/Kategoriye göre)
// ============================================

export interface ProductSocialProof {
  // Sayısal veriler (backend hesaplar)
  view_count?: number;        // Son 24 saat görüntülenme
  cart_count?: number;        // Şu an sepetinde olan kullanıcı sayısı
  sold_count?: number;        // Toplam satış (veya son 7 gün)
  review_count: number;
  average_rating: number;

  // Dinamik mesajlar (backend oluşturur)
  messages?: Array<{
    type: 'urgency' | 'popularity' | 'trust' | 'scarcity';
    text: string;
    icon?: string;
    priority: number;
  }>;
}

// Örnek mesajlar:
// { type: 'urgency', text: 'Son 3 ürün!', icon: 'flame' }
// { type: 'popularity', text: '24 kişi şu an bakıyor', icon: 'eye' }
// { type: 'trust', text: '1.2K+ satış', icon: 'check' }

// ============================================
// 13. HELPER: Attribute validation
// ============================================

export function isAttributeAllowedForCategory(
  categoryGroup: string,
  attributeKey: string,
  attributeType: 'variant' | 'highlight'
): boolean {
  const schema = CATEGORY_ATTRIBUTE_SCHEMA[categoryGroup] || CATEGORY_ATTRIBUTE_SCHEMA.default;

  if (attributeType === 'variant') {
    return schema.allowed_variant_attributes.includes(attributeKey);
  }
  return schema.allowed_highlight_attributes.includes(attributeKey);
}

export function getSocialProofConfig(categoryGroup: string) {
  const schema = CATEGORY_ATTRIBUTE_SCHEMA[categoryGroup] || CATEGORY_ATTRIBUTE_SCHEMA.default;
  return schema.social_proof_config;
}
