// ============================================
// Cart Modal Types
// ============================================

export interface CartModalData {
  product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    discount_price: number | null;
    discount_percentage: number | null;
    currency: string;
    image: string | null;
    stock: number;
  };
  layout: CartModalBlock[];
  rules: CartModalRules;
  variants: {
    has_variants: boolean;
    options: VariantOption[];
    combinations: VariantCombination[];
    total_stock: number;
  };
  sellers: CartModalSeller[];
  campaigns: CartModalCampaign[];
  stock_warning: StockWarning | null;
  badges: CartModalBadge[];
}

export interface CartModalBlock {
  block: string;
  order: number;
  props?: Record<string, any>;
}

export interface CartModalRules {
  disable_add_until_variant_selected?: boolean;
  show_stock_warning_threshold?: number;
  show_multiple_sellers?: boolean;
  show_warranty_info?: boolean;
  show_campaign_info?: boolean;
}

export interface VariantOption {
  key: string;
  label: string;
  values: {
    value: string;
    available: boolean;
    stock: number;
  }[];
}

export interface VariantCombination {
  attributes: Record<string, string>;
  price: number;
  stock: number;
  available: boolean;
}

export interface CartModalSeller {
  id: number;
  vendor_name: string;
  vendor_slug: string;
  price: number;
  discount_price: number | null;
  stock: number;
  shipping_time: number;
  free_shipping: boolean;
  rating: number;
}

export interface CartModalCampaign {
  id: number;
  name: string;
  type: string;
  discount_rate: number | null;
  badge_text: string | null;
}

export interface StockWarning {
  type: 'out_of_stock' | 'low_stock';
  message: string;
  color: string;
}

export interface CartModalBadge {
  key: string;
  label: string;
  color: string;
}

export interface CartModalVariantValidation {
  variant_id: number;
  price: number;
  original_price: number;
  stock: number;
  available: boolean;
  attributes: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Component Props Types
export interface CartModalBlockProps {
  product: CartModalData['product'];
  variants: CartModalData['variants'];
  sellers: CartModalData['sellers'];
  campaigns: CartModalData['campaigns'];
  stockWarning: CartModalData['stock_warning'];
  rules: CartModalData['rules'];
  selectedAttributes: Record<string, string>;
  selectedVariant: VariantCombination | null;
  onAttributeSelect: (key: string, value: string) => void;
  onSellerSelect: (sellerId: number) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}
