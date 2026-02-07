'use client';

import dynamic from 'next/dynamic';
import type { PdpBlock, Product, Badge, HighlightAttribute, SocialProof } from '@/types/pdp';
import { AlertCircle } from 'lucide-react';

// Static imports for core blocks
import { Title } from './blocks/Title';
import { Price } from './blocks/Price';
import { Badges } from './blocks/Badges';

// Dynamic imports for heavy blocks
const Gallery = dynamic(() => import('./blocks/Gallery').then(m => m.Gallery), {
  loading: () => <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
});
const Rating = dynamic(() => import('./blocks/Rating').then(m => m.Rating));
const SocialProofBlock = dynamic(() => import('./blocks/SocialProof').then(m => m.SocialProof));
const VariantSelector = dynamic(() => import('./blocks/VariantSelector').then(m => m.VariantSelector));
const HighlightAttributes = dynamic(() => import('./blocks/HighlightAttributes').then(m => m.HighlightAttributes));
const DeliveryInfo = dynamic(() => import('./blocks/DeliveryInfo').then(m => m.DeliveryInfo));
const AddToCart = dynamic(() => import('./blocks/AddToCart').then(m => m.AddToCart));
const Description = dynamic(() => import('./blocks/Description').then(m => m.Description));
const AttributesDetail = dynamic(() => import('./blocks/AttributesDetail').then(m => m.AttributesDetail));
const Reviews = dynamic(() => import('./blocks/Reviews').then(m => m.Reviews));
const RelatedProducts = dynamic(() => import('./blocks/RelatedProducts').then(m => m.RelatedProducts));
const ProductBundles = dynamic(() => import('@/components/product/ProductBundlesSection').then(m => ({ default: m.ProductBundlesSection })));

// ✅ Map object ile temiz mapping (switch-case yerine)
const BLOCK_COMPONENTS = {
  gallery: Gallery,
  title: Title,
  rating: Rating,
  price: Price,
  badges: Badges,
  social_proof: SocialProofBlock,
  variant_selector: VariantSelector,
  size_selector: VariantSelector, // alias
  attributes_highlight: HighlightAttributes,
  delivery_info: DeliveryInfo,
  campaigns: () => null, // TODO: implement
  bundles: ProductBundles,
  add_to_cart: AddToCart,
  description: Description,
  attributes_detail: AttributesDetail,
  reviews: Reviews,
  questions: () => null, // TODO: implement
  related_products: RelatedProducts,
} as const;

type BlockKey = keyof typeof BLOCK_COMPONENTS;

interface PdpBlockRendererProps {
  block: PdpBlock;
  product: Product;
  badges: Badge[];
  highlights: HighlightAttribute[];
  socialProof: SocialProof | null;
}

// ✅ Fallback block - bilinmeyen bloklar için
function UnknownBlock({ blockKey }: { blockKey: string }) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Bilinmeyen blok: "{blockKey}"</span>
        </div>
        <p className="mt-1 text-sm">Bu blok için component tanımlanmamış.</p>
      </div>
    );
  }
  return null;
}

export function PdpBlockRenderer({
  block,
  product,
  badges,
  highlights,
  socialProof,
}: PdpBlockRendererProps) {
  const BlockComponent = BLOCK_COMPONENTS[block.block as BlockKey];

  // ✅ Fallback - bilinmeyen bloklar için
  if (!BlockComponent) {
    console.warn(`[PDP] Unknown block: ${block.block}`);
    return <UnknownBlock blockKey={block.block} />;
  }

  // Block tipine göre props hazırla
  const props = getBlockProps(block.block, {
    product,
    badges,
    highlights,
    socialProof,
    config: block.config,
  });

  return (
    <div className="pdp-block mb-6" data-block={block.block} data-position={block.position}>
      <BlockComponent {...(props as any)} />
    </div>
  );
}

// ✅ Her blok tipi için doğru props'u hazırla
function getBlockProps(
  blockKey: string,
  data: {
    product: Product;
    badges: Badge[];
    highlights: HighlightAttribute[];
    socialProof: SocialProof | null;
    config?: Record<string, any>;
  }
) {
  const { product, badges, highlights, socialProof, config } = data;

  // Block tipine göre optimize edilmiş props
  switch (blockKey) {
    case 'gallery':
      return { product };
    case 'title':
      return { product };
    case 'rating':
      return { product };
    case 'price':
      return { product };
    case 'badges':
      return { badges };
    case 'social_proof':
      return { product, socialProof: socialProof ?? null };
    case 'variant_selector':
    case 'size_selector':
      return { product };
    case 'attributes_highlight':
      return { highlights };
    case 'delivery_info':
      return {};
    case 'add_to_cart':
      return { product };
    case 'description':
      return { product };
    case 'attributes_detail':
      return { product };
    case 'reviews':
      return { product };
    case 'related_products':
      return { product };
    case 'bundles':
      return { productId: product.id };
    default:
      return { product, badges, highlights, socialProof: socialProof ?? null, config };
  }
}
