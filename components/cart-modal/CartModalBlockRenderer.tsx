'use client';

import type { 
  CartModalData, 
  VariantCombination, 
  CartModalBlock 
} from '@/types/cart-modal';
import { ProductInfo } from './blocks/ProductInfo';
import { VariantSelector } from './blocks/VariantSelector';
import { SellerSelector } from './blocks/SellerSelector';
import { Price } from './blocks/Price';
import { StockWarning } from './blocks/StockWarning';
import { CampaignInfo } from './blocks/CampaignInfo';
import { WarrantyInfo } from './blocks/WarrantyInfo';

const BLOCK_COMPONENTS = {
  variant_selector: VariantSelector,
  seller_selector: SellerSelector,
  price: Price,
  stock_warning: StockWarning,
  campaign_info: CampaignInfo,
  warranty_info: WarrantyInfo,
  // Aliases
  product_info: ProductInfo,
} as const;

type BlockKey = keyof typeof BLOCK_COMPONENTS;

interface CartModalBlockRendererProps {
  data: CartModalData;
  selectedAttributes: Record<string, string>;
  selectedVariant: VariantCombination | null;
  selectedSellerId: number | null;
  onAttributeSelect: (key: string, value: string) => void;
  onSellerSelect: (sellerId: number) => void;
  isAddingToCart: boolean;
}

export function CartModalBlockRenderer({
  data,
  selectedAttributes,
  selectedVariant,
  selectedSellerId,
  onAttributeSelect,
  onSellerSelect,
}: CartModalBlockRendererProps) {
  const { layout, rules } = data;

  return (
    <div className="space-y-4">
      {/* Ürün bilgisi (her zaman göster) */}
      <ProductInfo product={data.product} />

      {/* Layout blokları */}
      {layout
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const BlockComponent = BLOCK_COMPONENTS[block.block as BlockKey];

          if (!BlockComponent) {
            console.warn(`[CartModal] Unknown block: ${block.block}`);
            return null;
          }

          const props = getBlockProps(block, {
            data,
            selectedAttributes,
            selectedVariant,
            selectedSellerId,
            onAttributeSelect,
            onSellerSelect,
            rules,
          });

          return (
            <div key={`${block.block}-${block.order}`} data-block={block.block}>
              <BlockComponent {...props} />
            </div>
          );
        })}
    </div>
  );
}

function getBlockProps(
  block: CartModalBlock,
  context: {
    data: CartModalData;
    selectedAttributes: Record<string, string>;
    selectedVariant: VariantCombination | null;
    selectedSellerId: number | null;
    onAttributeSelect: (key: string, value: string) => void;
    onSellerSelect: (sellerId: number) => void;
    rules: CartModalData['rules'];
  }
) {
  const { data, selectedAttributes, selectedVariant, selectedSellerId, onAttributeSelect, onSellerSelect, rules } = context;

  switch (block.block) {
    case 'variant_selector':
      return {
        variants: data.variants,
        selectedAttributes,
        selectedVariant,
        onAttributeSelect,
        type: block.props?.type,
      };
    case 'seller_selector':
      return {
        sellers: data.sellers,
        selectedSellerId,
        onSellerSelect,
      };
    case 'price':
      return {
        product: data.product,
        selectedVariant,
        selectedSeller: data.sellers.find(s => s.id === selectedSellerId),
      };
    case 'stock_warning':
      return {
        warning: data.stock_warning,
        threshold: rules.show_stock_warning_threshold,
      };
    case 'campaign_info':
      return {
        campaigns: data.campaigns,
      };
    case 'warranty_info':
      return {
        show: rules.show_warranty_info,
      };
    default:
      return {};
  }
}
