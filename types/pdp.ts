// ============================================
// PDP (Product Detail Page) Types
// Trendyol-style TypeScript definitions
// ============================================

export interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  discount_percentage: number | null;
  currency: string;
  rating: number;
  reviews_count: number;
  stock: number;
  is_new: boolean;
  is_bestseller: boolean;
  fast_delivery: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  description: string;
  brand: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariant {
  id: number;
  title: string;
  price: number;
  discount_price: number | null;
  stock: number;
  attributes: Record<string, string>;
  image: string | null;
}

export interface ProductAttribute {
  key: string;
  label: string;
  value: string;
  display_value: string;
}

export interface Badge {
  key: string;
  label: string;
  icon?: string;
  color: string;
  bg_color?: string;
  text_color?: string;
}

export interface HighlightAttribute {
  key: string;
  label: string;
  value: string;
  display_value: string;
  icon?: string;
  color?: string;
}

export interface SocialProof {
  type: 'cart' | 'view' | 'sold';
  message: string;
  position: string;
  color: string;
  icon?: string;
  refresh_interval: number;
}

export interface PdpBlock {
  block: string;
  position: 'main' | 'sidebar' | 'under_title' | 'bottom';
  order: number;
  config?: Record<string, any>;
}

export interface PdpData {
  product: Product;
  layout: PdpBlock[];
  badges: Badge[];
  highlights: HighlightAttribute[];
  social_proof: SocialProof | null;
  filters: Filter[];
}

// ============================================
// Filter Types
// ============================================

export interface Filter {
  key: string;
  label: string;
  type: 'checkbox' | 'range' | 'rating' | 'select';
  is_collapsed: boolean;
  show_count?: boolean;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface AppliedFilters {
  [key: string]: string | string[] | { min?: number; max?: number };
}

export interface SortOption {
  key: string;
  label: string;
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  children?: Category[];
  product_count?: number;
}

export interface Breadcrumb {
  name: string;
  slug: string;
}

export interface CategoryPageData {
  category: Category;
  products: ProductListItem[];
  filters: Filter[];
  sub_categories: Category[];
  breadcrumbs: Breadcrumb[];
  sort_options: SortOption[];
}

export interface ProductListItem {
  id: number;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  discount_percentage: number | null;
  image: string | null;
  brand: string | null;
  rating: number;
  reviews_count: number;
  badges: Badge[];
  fast_delivery: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
