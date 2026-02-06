/**
 * PDP Engine Types - Trendyol-style Dynamic Product Page System
 * 
 * Bu modül, kategori bazlı dinamik PDP yapısını tanımlar:
 * - Badge sistemi (kurallı, otomatik hesaplanan)
 * - PDP Layout (kategori grubuna göre değişen blok dizilimi)
 * - Attribute Highlights (öne çıkan özellikler)
 * - Filter Config (kategoriye özel filtreler)
 */

// ============================================
// 1. BADGE SYSTEM
// ============================================

export interface Badge {
  key: string;           // fast_delivery, advantage, best_seller, discount
  label: string;         // "Hızlı Teslimat", "Avantajlı Ürün"
  icon?: string;         // Lucide icon name
  color?: string;        // text color (tailwind class veya hex)
  bg_color?: string;     // background color
  border_color?: string; // border color
  priority: number;      // gösterim sırası (yüksek önce)
}

export interface BadgeRule {
  id: number;
  badge_key: string;
  category_group_id?: number;  // null = tüm kategoriler
  condition_type: 'price_discount' | 'review_count' | 'rating' | 'stock' | 'is_new' | 'is_bestseller' | 'fast_delivery' | 'custom';
  condition_config: {
    operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'contains';
    value: number | string | string[];
    field?: string;  // custom condition için
  };
  priority: number;
  is_active: boolean;
}

// ============================================
// 2. PDP LAYOUT SYSTEM
// ============================================

export type PdpBlockType = 
  | 'gallery'
  | 'title'
  | 'rating'
  | 'badges'
  | 'social_proof'
  | 'price'
  | 'variant_selector'
  | 'size_selector'
  | 'color_selector'
  | 'attributes_highlight'
  | 'delivery_info'
  | 'campaigns'
  | 'add_to_cart'
  | 'description'
  | 'attributes_detail'
  | 'reviews'
  | 'questions'
  | 'seller_info'
  | 'related_products'
  | 'breadcrumbs';

export type PdpBlockPosition = 'main' | 'sidebar' | 'under_title' | 'bottom' | 'above_gallery';

export interface PdpBlockConfig {
  block: PdpBlockType;
  position: PdpBlockPosition;
  order: number;
  visible: boolean;
  props?: Record<string, unknown>;  // blok özel ayarlar
}

export interface PdpLayout {
  id: number;
  category_group_id: number;
  name: string;           // "Varsayılan", "Giyim Layout", "Elektronik Layout"
  blocks: PdpBlockConfig[];
  is_default: boolean;
  is_active: boolean;
}

// ============================================
// 3. ATTRIBUTE HIGHLIGHT SYSTEM
// ============================================

export interface AttributeHighlight {
  id: number;
  attribute_key: string;       // "materyal", "kumas"
  category_group_id: number;
  display_label: string;       // "Pamuklu" (orijinal: "Materyal")
  icon?: string;
  color?: string;              // vurgu rengi
  priority: number;
  show_in_pdp: boolean;
  show_in_list: boolean;
}

export interface HighlightAttributeValue {
  key: string;
  label: string;
  value: string;
  display_value: string;  // birim ile birlikte (örn: "100% Pamuk")
  icon?: string;
  color?: string;
}

// ============================================
// 4. SOCIAL PROOF SYSTEM
// ============================================

export type SocialProofType = 'cart_count' | 'view_count' | 'sold_count' | 'review_count';

export interface SocialProofRule {
  id: number;
  category_group_id: number;
  type: SocialProofType;
  display_format: string;      // "{count} kişinin sepetinde"
  threshold_type: 'fixed' | 'percentage';
  threshold_value: number;
  refresh_interval: number;    // saniye cinsinden
  position: 'under_title' | 'near_price' | 'under_gallery';
  color?: string;
  icon?: string;
  is_active: boolean;
}

export interface SocialProofData {
  type: SocialProofType;
  message: string;            // formatlanmış mesaj
  position: string;
  color?: string;
  icon?: string;
  refresh_interval: number;
}

// ============================================
// 5. FILTER SYSTEM
// ============================================

export type FilterComponentType = 'checkbox' | 'range' | 'select' | 'multiselect' | 'color' | 'rating';

export interface FilterConfig {
  id: number;
  category_group_id: number;
  filter_type: 'attribute' | 'price' | 'brand' | 'rating' | 'seller' | 'campaign';
  attribute_key?: string;      // filter_type = 'attribute' için
  display_label: string;       // "Beden", "Renk", "Fiyat Aralığı"
  component: FilterComponentType;
  order: number;
  is_collapsed: boolean;       // varsayılan daraltılmış mı?
  show_count: boolean;         // ürün sayısı gösterilsin mi?
  options?: FilterOption[];    // sabit seçenekler
  config?: {                   // dinamik ayarlar
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };
  is_active: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;    // ürün sayısı
  color?: string;    // renk filtresi için
}

// ============================================
// 6. CATEGORY GROUP SYSTEM
// ============================================

export interface CategoryGroup {
  id: number;
  key: string;           // "giyim", "elektronik", "kozmetik"
  name: string;          // "Giyim", "Elektronik"
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
}

// ============================================
// 7. COMPLETE PDP DATA RESPONSE
// ============================================

export interface PdpEngineData {
  // Temel ürün bilgileri (mevcut Product tipi ile uyumlu)
  product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    discount_price?: number;
    discount_percentage: number;
    currency: string;
    rating: number;
    reviews_count: number;
    stock: number;
    is_new: boolean;
    is_bestseller: boolean;
    fast_delivery: boolean;
    images: Array<{ url: string; alt?: string }>;
    variants?: Array<{
      id: number;
      title: string;
      price: number;
      discount_price?: number;
      stock: number;
      attributes?: Record<string, string>;
    }>;
    attributes: Array<{
      key: string;
      label: string;
      value: string;
      display_value: string;
    }>;
    description?: string;
    brand?: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  };
  
  // PDP Engine özellikleri
  layout: PdpBlockConfig[];
  badges: Badge[];
  highlights: HighlightAttributeValue[];
  social_proof: SocialProofData | null;
  filters: FilterConfig[];
}

// ============================================
// 8. API RESPONSE TYPES
// ============================================

export interface PdpApiResponse {
  data: PdpEngineData;
  meta?: {
    cached_at: string;
    expires_at: string;
  };
}

export interface BadgesApiResponse {
  data: {
    badges: Badge[];
  };
}

export interface FiltersApiResponse {
  data: {
    category_group_id: number;
    filters: FilterConfig[];
  };
}
