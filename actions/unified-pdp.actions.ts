"use server";

/**
 * UNIFIED PDP ACTIONS
 * 
 * Tek endpoint: GET /api/pdp/{slug}?context=page|cart|modal|quickview
 * Aynı şema, farklı context = farklı block listesi
 */

import { apiGet } from "@/lib/api-server";
import { allProducts } from "@/data/mock-data";
import type { 
  UnifiedPdpResponse, 
  PdpApiParams,
  PdpBlock,
  UnifiedVariant,
  UnifiedVendor,
  UnifiedBadge,
  UnifiedCampaign,
  PdpRules
} from "@/types/unified-pdp";
import { CATEGORY_GROUPS, BLOCK_VISIBILITY, CATEGORY_RULES } from "@/types/unified-pdp";

// ============================================
// 1. MAIN FETCH FUNCTION
// ============================================

export async function getUnifiedPdp(
  slug: string,
  params?: PdpApiParams
): Promise<UnifiedPdpResponse | null> {
  const context = params?.context || 'page';
  
  try {
    // Try API first
    const queryParams = new URLSearchParams();
    queryParams.set('context', context);
    if (params?.variant_id) queryParams.set('variant_id', params.variant_id.toString());
    if (params?.seller_id) queryParams.set('seller_id', params.seller_id.toString());
    
    const response = await apiGet<{ data: UnifiedPdpResponse }>(
      `/pdp/${slug}?${queryParams.toString()}`,
      {
        next: {
          tags: ['pdp', `pdp-${slug}`, `pdp-${slug}-${context}`],
          revalidate: context === 'page' ? 3600 : 60, // Page: 1hr, others: 1min
        },
      }
    );
    
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.log(`API fallback for PDP ${slug}, using mock data`);
  }
  
  // Fallback: Build from mock data
  return buildMockPdpResponse(slug, context, params);
}

// ============================================
// 2. MOCK DATA BUILDER (Development/Fallback)
// ============================================

function buildMockPdpResponse(
  slug: string, 
  context: string,
  params?: PdpApiParams
): UnifiedPdpResponse | null {
  // Find product
  const product = allProducts.find(p => p.slug === slug);
  if (!product) return null;
  
  // Determine category group
  const categoryGroup = detectCategoryGroup(product);
  
  // Build base response
  const baseResponse: UnifiedPdpResponse = {
    meta: {
      context: context as any,
      category_group: categoryGroup,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    },
    product: {
      id: product.id,
      title: product.name || product.title || '',
      slug: product.slug,
      description: product.description || '',
      brand: product.brand ? {
        id: typeof product.brand === 'string' ? 0 : product.brand.id || 0,
        name: typeof product.brand === 'string' ? product.brand : product.brand.name || '',
        slug: typeof product.brand === 'string' ? product.brand.toLowerCase().replace(/\s+/g, '-') : product.brand.slug || '',
        logo: typeof product.brand === 'object' ? product.brand.logo : undefined,
      } : undefined,
      category: {
        id: product.category?.id || 0,
        name: product.category?.name || 'Kategori',
        slug: product.category?.slug || 'kategori',
        group: categoryGroup,
      },
      images: product.images?.map((img, idx) => ({
        id: img.id || idx,
        url: img.url,
        alt: img.alt || product.name,
        order: idx,
      })) || [],
      attributes: Object.entries(product.specifications || {}).map(([key, value]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value),
        display_value: String(value),
      })),
    },
    pricing: {
      price: product.original_price || product.price,
      sale_price: product.original_price ? product.price : null,
      original_price: product.original_price || null,
      discount_percentage: product.discount_percentage || null,
      currency: 'TRY',
      stock: product.stock || 10,
      is_in_stock: product.is_in_stock ?? true,
      stock_status: product.stock === 0 ? 'out_of_stock' : (product.stock || 10) < 5 ? 'low_stock' : 'in_stock',
      low_stock_threshold: 5,
    },
    variants: buildVariantConfig(product, categoryGroup),
    vendors: buildVendors(product),
    badges: buildBadges(product),
    campaigns: buildCampaigns(product),
    blocks: filterBlocksByContext(buildAllBlocks(), context),
    rules: buildRules(categoryGroup),
    social_proof: {
      view_count: Math.floor(Math.random() * 1000) + 100,
      cart_count: Math.floor(Math.random() * 100) + 10,
      sold_count: Math.floor(Math.random() * 500) + 50,
      review_count: product.review_count || 0,
      average_rating: product.rating || 0,
    },
  };
  
  return baseResponse;
}

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

function detectCategoryGroup(product: any): string {
  const categoryName = product.category?.name?.toLowerCase() || '';
  const productName = product.name?.toLowerCase() || '';
  
  if (categoryName.includes('giyim') || categoryName.includes('ayakkabı') || categoryName.includes('çanta') ||
      productName.includes('elbise') || productName.includes('tişört') || productName.includes('pantolon')) {
    return CATEGORY_GROUPS.GIYIM;
  }
  
  if (categoryName.includes('elektronik') || categoryName.includes('bilgisayar') || categoryName.includes('telefon') ||
      productName.includes('kulaklık') || productName.includes('laptop') || productName.includes('telefon')) {
    return CATEGORY_GROUPS.ELEKTRONIK;
  }
  
  if (categoryName.includes('kozmetik') || categoryName.includes('kişisel bakım') || categoryName.includes('parfüm') ||
      productName.includes('parfüm') || productName.includes('krem') || productName.includes('şampuan')) {
    return CATEGORY_GROUPS.KOZMETIK;
  }
  
  if (categoryName.includes('ev') || categoryName.includes('mobilya') || categoryName.includes('dekorasyon')) {
    return CATEGORY_GROUPS.EV_YASAM;
  }
  
  return CATEGORY_GROUPS.DEFAULT;
}

function buildVariantConfig(product: any, categoryGroup: string) {
  // Kozmetik ve benzeri kategorilerde varyant yok
  if (categoryGroup === CATEGORY_GROUPS.KOZMETIK || categoryGroup === CATEGORY_GROUPS.GIDA) {
    return {
      enabled: false,
      attributes: [],
      combinations: [],
      selection_required: false,
    };
  }
  
  // Giyimde beden ve renk
  if (categoryGroup === CATEGORY_GROUPS.GIYIM) {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = [
      { value: 'siyah', label: 'Siyah', hex: '#000000' },
      { value: 'beyaz', label: 'Beyaz', hex: '#FFFFFF' },
      { value: 'mavi', label: 'Mavi', hex: '#3B82F6' },
      { value: 'kırmızı', label: 'Kırmızı', hex: '#EF4444' },
      { value: 'gri', label: 'Gri', hex: '#6B7280' },
    ];
    
    const combinations: UnifiedVariant[] = [];
    sizes.forEach((size, sIdx) => {
      colors.forEach((color, cIdx) => {
        combinations.push({
          id: sIdx * colors.length + cIdx + 1,
          sku: `${product.slug}-${size}-${color.value}`.toUpperCase(),
          price: product.original_price || product.price,
          sale_price: product.original_price ? product.price : null,
          stock: Math.floor(Math.random() * 20) + 1,
          is_default: size === 'M' && color.value === 'siyah',
          attributes: { beden: size, renk: color.value },
        });
      });
    });
    
    return {
      enabled: true,
      attributes: [
        {
          key: 'beden',
          label: 'Beden',
          type: 'size',
          values: sizes.map(size => ({
            value: size,
            label: size,
            available: true,
            stock: 10,
          })),
        },
        {
          key: 'renk',
          label: 'Renk',
          type: 'color',
          values: colors.map(color => ({
            value: color.value,
            label: color.label,
            available: true,
            stock: 10,
            color_hex: color.hex,
          })),
        },
      ],
      combinations,
      selection_required: true,
    };
  }
  
  // Elektronikte depolama kapasitesi gibi
  if (categoryGroup === CATEGORY_GROUPS.ELEKTRONIK) {
    const storages = ['64GB', '128GB', '256GB', '512GB'];
    
    return {
      enabled: true,
      attributes: [
        {
          key: 'depolama',
          label: 'Depolama',
          type: 'select',
          values: storages.map((storage, idx) => ({
            value: storage,
            label: storage,
            available: true,
            stock: 10,
          })),
        },
      ],
      combinations: storages.map((storage, idx) => ({
        id: idx + 1,
        sku: `${product.slug}-${storage}`.toUpperCase(),
        price: product.price + (idx * 1000),
        sale_price: null,
        stock: Math.floor(Math.random() * 15) + 5,
        is_default: idx === 1,
        attributes: { depolama: storage },
      })),
      selection_required: false,
    };
  }
  
  // Default
  return {
    enabled: false,
    attributes: [],
    combinations: [],
    selection_required: false,
  };
}

function buildVendors(product: any): UnifiedVendor[] {
  // Multi-seller simulation
  return [{
    id: product.vendor_id || 1,
    name: product.vendor?.name || 'Sirizen',
    slug: product.vendor?.slug || 'sirizen',
    logo: product.vendor?.logo,
    rating: product.vendor?.rating || 4.8,
    review_count: product.vendor?.review_count || 1250,
    product_count: product.vendor?.product_count || 0,
    follower_count: product.vendor?.follower_count || 0,
    years_on_platform: product.vendor?.years_on_platform || 0,
    response_time: product.vendor?.response_time || '24 saat',
    is_official: product.vendor?.is_official || true,
    shipping: {
      estimated_days: 2,
      same_day_cutoff: '14:00',
      free_shipping_threshold: 200,
    },
  }];
}

function buildBadges(product: any): UnifiedBadge[] {
  const badges: UnifiedBadge[] = [];
  
  if (product.discount_percentage && product.discount_percentage > 0) {
    badges.push({
      key: 'discount',
      label: `%${product.discount_percentage} İndirim`,
      color: 'text-white',
      bg_color: 'bg-red-500',
      priority: 100,
    });
  }
  
  if (product.is_bestseller) {
    badges.push({
      key: 'bestseller',
      label: 'Çok Satan',
      color: 'text-white',
      bg_color: 'bg-orange-500',
      priority: 90,
    });
  }
  
  if (product.is_new) {
    badges.push({
      key: 'new',
      label: 'Yeni',
      color: 'text-white',
      bg_color: 'bg-green-500',
      priority: 80,
    });
  }
  
  if (product.fast_delivery) {
    badges.push({
      key: 'fast_delivery',
      label: 'Hızlı Teslimat',
      icon: 'truck',
      color: 'text-green-700',
      bg_color: 'bg-green-100',
      priority: 70,
    });
  }
  
  return badges.sort((a, b) => b.priority - a.priority);
}

function buildCampaigns(product: any): UnifiedCampaign[] {
  const campaigns: UnifiedCampaign[] = [];
  
  if (product.discount_percentage && product.discount_percentage >= 20) {
    campaigns.push({
      id: 1,
      title: 'Flaş İndirim',
      type: 'flash',
      discount_type: 'percentage',
      discount_value: product.discount_percentage,
      badge_text: 'Flaş',
    });
  }
  
  return campaigns;
}

function buildAllBlocks(): PdpBlock[] {
  return [
    { block: 'gallery', position: 'main', order: 1, visible: true },
    { block: 'breadcrumbs', position: 'main', order: 2, visible: true },
    { block: 'title', position: 'main', order: 3, visible: true },
    { block: 'rating', position: 'main', order: 4, visible: true },
    { block: 'badges', position: 'main', order: 5, visible: true },
    { block: 'price', position: 'main', order: 6, visible: true },
    { block: 'variant_selector', position: 'main', order: 7, visible: true },
    { block: 'campaigns', position: 'main', order: 8, visible: true },
    { block: 'add_to_cart', position: 'main', order: 9, visible: true },
    { block: 'seller_info', position: 'main', order: 10, visible: true },
    { block: 'description', position: 'main', order: 11, visible: true },
    { block: 'attributes', position: 'main', order: 12, visible: true },
    { block: 'related_products', position: 'bottom', order: 13, visible: true },
  ];
}

function filterBlocksByContext(blocks: PdpBlock[], context: string): PdpBlock[] {
  const allowedBlocks = BLOCK_VISIBILITY[context] || BLOCK_VISIBILITY.page;
  return blocks
    .filter(b => allowedBlocks.includes(b.block))
    .map((b, idx) => ({ ...b, order: idx + 1 }));
}

function buildRules(categoryGroup: string): PdpRules {
  const categoryRule = CATEGORY_RULES[categoryGroup] || CATEGORY_RULES.default;
  
  return {
    disable_add_until_variant_selected: categoryRule.disable_add_until_variant_selected ?? false,
    show_out_of_stock_variants: true,
    show_stock_warning_threshold: categoryRule.show_stock_warning_threshold ?? 5,
    allow_multi_seller: categoryRule.allow_multi_seller ?? false,
    show_all_sellers: false,
    show_quantity_selector: true,
    max_quantity: 10,
    show_size_guide: categoryRule.show_size_guide ?? false,
    show_installments: true,
    show_social_proof: true,
  };
}
