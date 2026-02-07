// Core entity types for the marketplace

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id: number | null;
  children?: Category[];
  product_count?: number;
}

export interface SellerPage {
  id: number;
  seo_slug: string;
  description?: string;
  logo?: string;
  banner?: string;
}

export interface Vendor {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  rating: number;
  review_count: number;
  follower_count: number;
  product_count: number;
  location?: string;
  years_on_platform: number;
  response_time?: string;
  description?: string;
  is_official?: boolean;
  created_at: string;
  seller_page?: SellerPage;
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  type: 'size' | 'color' | 'other';
  value: string;
  price: number;
  original_price?: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface Badge {
  key: string;
  label: string;
  color: string;
  bg_color?: string;
  text_color?: string;
  icon?: string;
}

// Social Proof verisi (Trendyol tarzı)
export interface SocialProof {
  type: 'basket' | 'favorite' | 'view' | 'sold';
  emoji: string;
  count: number;
  period?: string; // "3 günde", "24 saatte", "bu hafta"
}

// Hierarchical Badge (En çok satanlar, ziyaret edilenler vb.)
export interface HierarchicalBadge {
  rank: number;
  label: string; // "En Çok Ziyaret Edilen", "En Çok Satan"
  icon?: string;
}

// Price Badge (Son X günün en düşüğü vb.)
export interface PriceBadge {
  type: 'lowest_price' | 'flash_sale' | 'limited_stock' | 'campaign';
  label: string;
}

export interface Product {
  id: number;
  name?: string;
  title?: string;
  slug: string;
  description: string;
  short_description?: string;
  brand: string | { id: number; name: string; slug: string; logo?: string };
  brand_slug: string;
  category_id: number;
  category: Category;
  vendor_id: number;
  vendor: Vendor;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  currency: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  rating: number;
  review_count: number;
  question_count: number;
  stock: number;
  is_in_stock: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  has_free_shipping: boolean;
  shipping_time?: string;
  specifications?: Record<string, string>;
  tags?: string[];
  badges?: Badge[]; // PDP Engine'den gelen dinamik badge'ler
  // Trendyol-style dynamic data
  social_proof?: SocialProof[];
  hierarchical_badge?: HierarchicalBadge;
  price_badge?: PriceBadge;
  price_badges?: PriceBadge[]; // Multiple rotating price badges
  stamp_image?: string; // Sol üst köşedeki damga resmi
  favorite_count?: number;
  basket_count?: number; // Son X günde sepete eklenme
  view_count?: number; // Son 24 saatte görüntülenme
  has_review_photos?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: number;
  product: Product;
  vendor_id: number;
  variant_id?: number;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  original_price?: number;
  shipping_type: 'free' | 'paid';
  shipping_cost: number;
  campaign_id?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  item_count: number;
  coupon_code?: string;
}

export interface Address {
  id: number;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  address_line: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product: Product;
  vendor_id: number;
  vendor: Vendor;
  variant_id?: number;
  variant?: ProductVariant;
  product_seller_id?: number; // BuyBox winner seller ID
  variant_snapshot?: {
    id: number;
    name: string;
    type: string;
    value: string;
    price: number;
    original_price?: number;
    stock: number;
    sku?: string;
  }; // Snapshot of variant at order time
  unit_price: number; // Price per unit at order time
  quantity: number;
  price: number; // Total price (unit_price * quantity)
  total: number;
  status: OrderItemStatus;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  current_latitude?: number;
  current_longitude?: number;
  estimated_delivery?: string;
  delivered_at?: string;
}

export type OrderItemStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'partially_shipped'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  shipping_address: Address;
  billing_address?: Address;
  payment_method: string;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  coupon_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewImage {
  id: number;
  url: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: ReviewImage[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface SellerReview {
  id: number;
  vendor_id: number;
  user_id: number;
  user_name: string;
  delivery_rating: number;
  packaging_rating: number;
  communication_rating: number;
  comment?: string;
  created_at: string;
}

export interface Campaign {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image: string;
  banner?: string;
  discount_percentage?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface QuickLink {
  id: number;
  key: string;
  label: string;
  icon?: string;
  path: string;
  category_slug?: string;
  campaign_slug?: string;
  product_id?: number;
  color?: string;
  order: number;
  is_active: boolean;
}

export interface SearchTag {
  id: number;
  label: string;
  url: string;
  order: number;
}

export interface Coupon {
  id: number;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  vendor_id?: number;
  expires_at: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Filter types
export interface ProductFilters {
  category_id?: number;
  vendor_id?: number;
  brand?: string[];
  min_price?: number;
  max_price?: number;
  rating?: number;
  has_discount?: boolean;
  has_free_shipping?: boolean;
  is_in_stock?: boolean;
  vendor_city?: string[];
  vendor_district?: string[];
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'bestseller';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'vendor';
  id: number;
  name: string;
  slug: string;
  image?: string;
}

// Dynamic Filter Types (Trendyol-style)
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  hex?: string; // For color filters
}

export type FilterComponentType =
  | 'checkbox'
  | 'range'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'rating'
  | 'boolean';

export type FilterType =
  | 'attribute'
  | 'price'
  | 'brand'
  | 'rating'
  | 'seller'
  | 'shipping'
  | 'campaign';

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterComponentType;
  filter_type?: FilterType;
  is_collapsed?: boolean;
  show_count?: boolean;
  options?: FilterOption[];
  // For range filters
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface FiltersResponse {
  filters: FilterConfig[];
  category?: {
    id: number;
    name: string;
    slug: string;
    category_group_id?: number;
  };
}

// Dynamic filter values - key is filter key, value depends on filter type
export type DynamicFilterValues = Record<string, string | string[] | number | boolean | [number, number] | undefined>;

// Collection types for vendor collections
export interface Collection {
  id: number;
  vendor_id: number;
  title: string;
  subtitle?: string;
  start_date?: string;
  end_date?: string;
  layout_type?: string;
  is_active: boolean;
  vendor?: Vendor;
  products?: CollectionProduct[];
}

export interface CollectionProduct {
  id: number;
  product_id: number;
  collection_id: number;
  order: number;
  product?: {
    id: number;
    slug: string;
    name?: string;
    title?: string;
    images?: ProductImage[];
    price?: number;
  };
}

export interface VendorCollection {
  id: number;
  vendor: {
    id: number;
    name: string;
    slug: string;
    logo?: string;
  };
  title: string;
  subtitle?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  products: Array<{
    id: number;
    slug: string;
    image?: string;
    name?: string;
  }>;
  cta?: string;
  badge?: string; // "Yeni Koleksiyon", "Kampanya", "Özel Fırsat"
  discount_text?: string; // "%50'ye varan indirim"
  product_count?: number; // Toplam ürün sayısı
}

export interface HomeSection {
  id: number;
  position: number;
  section_type: string;
  config_json: Record<string, any>;
  is_active: boolean;
}
