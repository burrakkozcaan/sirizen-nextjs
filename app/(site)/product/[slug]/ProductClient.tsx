"use client";

/**
 * Product Client - Unified PDP
 * 
 * Orijinal özellikleri korur:
 * - Sticky Add to Cart (scroll yapınca altta çıkar)
 * - Product Reviews & Q&A
 * - Price Alert (Takip Et)
 * - Favorites & Comparison
 * - Seller Info
 * - Campaigns
 * - Buy Together
 * 
 * Backend: Unified Schema kullanır
 */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  Heart, 
  Share2,
  ChevronRight,
  Package,
  Shield,
  ShieldCheck,
  Truck,
  Sparkles,
  Flame,
  Bell,
  MessageCircle,
  ThumbsUp,
  Minus,
  Plus,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { UnifiedPdpResponse, UnifiedVariant } from "@/types/unified-pdp";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePriceAlert } from "@/contexts/PriceAlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { resolveMediaUrl } from "@/lib/media";
import { getProductSellers } from "@/actions/product-sellers.actions";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { VariantSelector } from "@/components/pdp/blocks/VariantSelector";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductQA } from "@/components/product/ProductQA";
import { RelatedProducts } from "@/components/pdp/blocks/RelatedProducts";
import { WriteReviewModal } from "@/components/product/WriteReviewModal";
import { PriceAlertModal } from "@/components/product/PriceAlertModalSimple";
import { AddToCartPopup } from "@/components/product/AddToCartPopup";
import { StickyAddToCart } from "@/components/product/StickyAddToCart";
import { ProductInfoSection } from "@/components/product/ProductInfoSection";
import { ProductSidebar } from "@/components/product/ProductSidebar";
import { BuyTogetherSection } from "@/components/product/BuyTogetherSection";
import { ProductBundlesSection } from "@/components/product/ProductBundlesSection";
import { UserReviewPhotos } from "@/components/product/UserReviewPhotos";
import { LocationSelectorModal } from "@/components/product/LocationSelectorModal";
import { RelatedTags } from "@/components/product/RelatedTags";
import { ProductZoomModal } from "@/components/product/ProductZoomModal";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProductClientProps {
  data: UnifiedPdpResponse;
}

export function ProductClient({ data }: ProductClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { product, pricing, variants, vendors, badges, campaigns, blocks, rules, social_proof } = data;
  
  // Client states
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  // Modals
  const [priceAlertOpen, setPriceAlertOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [addToCartPopupOpen, setAddToCartPopupOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    city: string;
    district: string;
  } | null>(null);
  
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getAlert, addAlert, removeAlert } = usePriceAlert();
  const { isAuthenticated } = useAuth();
  const [sellersData, setSellersData] = useState<any>(null);

  // Scroll listener for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Find selected variant
  const selectedVariant = (() => {
    if (!variants.enabled || Object.keys(selectedAttributes).length === 0) return null;
    return variants.combinations.find(combo =>
      Object.entries(selectedAttributes).every(
        ([key, value]) => combo.attributes[key] === value
      )
    ) || null;
  })();

  // Convert UnifiedVariant to ProductVariant for ProductInfoSection
  const productVariant = selectedVariant ? {
    id: selectedVariant.id,
    value: Object.values(selectedVariant.attributes)[0] || '',
    price: selectedVariant.price,
    original_price: selectedVariant.sale_price ? selectedVariant.price : undefined,
    stock: selectedVariant.stock || 0,
  } : null;

  // Convert variants for ProductInfoSection
  const productVariants = variants.enabled ? variants.combinations.map(v => ({
    id: v.id,
    value: Object.values(v.attributes)[0] || '',
    price: v.price,
    original_price: v.sale_price ? v.price : undefined,
    stock: v.stock || 0,
  })) : [];

  // Calculate final price: variant price > sale_price > regular price
  const finalPrice = selectedVariant?.price || (pricing.sale_price ?? pricing.price);
  const originalPrice = pricing.original_price || pricing.price;
  
  // Ensure priceForAlert is always valid (use pricing.price as fallback since it's required)
  const priceForAlert = finalPrice > 0 ? finalPrice : pricing.price;

  // Handle open add to cart popup
  const handleOpenAddToCartPopup = async () => {
    setAddToCartPopupOpen(true);
    
    // Load sellers data if not already loaded
    if (!sellersData) {
      try {
        const sellers = await getProductSellers(product.id, selectedVariant?.id || null);
        setSellersData(sellers);
      } catch (error) {
        console.error("Failed to load sellers:", error);
      }
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (rules.disable_add_until_variant_selected && variants.enabled && !selectedVariant) {
      toast.error("Lütfen bir varyant seçin");
      handleOpenAddToCartPopup();
      return;
    }
    
    setIsAddingToCart(true);
    addItem(product as any, quantity, selectedVariant as any);
    toast.success("Sepete eklendi");
    setIsAddingToCart(false);
    setAddToCartPopupOpen(false);
  };

  // Handle variant select in popup
  const handlePopupVariantSelect = (variantId: number) => {
    const variant = variants.combinations.find(v => v.id === variantId);
    if (variant) {
      setSelectedAttributes(variant.attributes);
    }
  };

  const handleVariantSelect = (variant: any) => {
    const unifiedVariant = variants.combinations.find(v => v.id === variant.id);
    if (unifiedVariant) {
      setSelectedAttributes(unifiedVariant.attributes);
    }
  };

  const handleImageClick = (index: number) => {
    setZoomImageIndex(index);
    setZoomModalOpen(true);
  };

  const isFav = isFavorite(product.id);
  const hasPriceAlert = !!getAlert(product.id);

  const hasBlock = (blockName: string) => blocks.some(b => b.block === blockName && b.visible);

  // Convert product for ProductInfoSection
  const productForInfo = {
    id: product.id,
    name: product.title,
    title: product.title,
    brand: product.brand?.name,
    brand_slug: product.brand?.slug,
    price: finalPrice,
    original_price: originalPrice,
    discount_percentage: originalPrice && originalPrice > finalPrice 
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
      : undefined,
    rating: social_proof?.average_rating || 0,
    review_count: social_proof?.review_count || 0,
    question_count: 0,
    images: product.images,
    variants: productVariants,
    vendor: vendors[0] ? {
      id: vendors[0].id,
      name: vendors[0].name,
      slug: vendors[0].slug,
      rating: vendors[0].rating,
    } : undefined,
    soldCount: social_proof?.sold_count,
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Ana Sayfa</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/category/${product.category.slug}`}>
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {product.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Product Section - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-5">
            <div className="sticky top-4">
              <ProductImageGallery
                images={product.images}
                productName={product.title}
                discountPercentage={originalPrice && originalPrice > finalPrice 
                  ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
                  : undefined}
                isFavorite={isFav}
                onToggleFavorite={() => {
                if (!isAuthenticated) {
                  toast.error("Koleksiyona eklemek için lütfen giriş yapın");
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                  return;
                }
                toggleFavorite(product.id);
              }}
                onImageClick={handleImageClick}
              />
            </div>
          </div>

          {/* Middle Column - Product Info */}
          <div className="lg:col-span-4">
            <ProductInfoSection
              product={productForInfo as any}
              selectedVariant={productVariant}
              onVariantSelect={handleVariantSelect}
              quantity={quantity}
              onQuantityChange={setQuantity}
              isFavorite={isFav}
              hasPriceAlert={hasPriceAlert}
              selectedLocation={selectedLocation}
              onToggleFavorite={() => {
                if (!isAuthenticated) {
                  toast.error("Koleksiyona eklemek için lütfen giriş yapın");
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                  return;
                }
                toggleFavorite(product.id);
              }}
              onAddToCart={handleOpenAddToCartPopup}
              onPriceAlertClick={() => setPriceAlertOpen(true)}
              onLocationClick={() => setLocationModalOpen(true)}
              onWriteReviewClick={() => setWriteReviewOpen(true)}
              onSizeGuideClick={() => setSizeGuideOpen(true)}
              onShowOtherSellers={handleOpenAddToCartPopup}
              hasFasterSellers={
                sellersData?.sellers && sellersData.sellers.some((s: any) => 
                  s.estimated_delivery_days < (vendors[0]?.shipping?.estimated_days || 2)
                )
              }
              campaigns={campaigns}
              productId={product.id}
            />
            
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <ProductSidebar 
                product={productForInfo as any} 
                vendor={vendors[0] ? {
                  id: vendors[0].id,
                  name: vendors[0].name,
                  slug: vendors[0].slug,
                  logo: vendors[0].logo,
                  rating: vendors[0].rating,
                  follower_count: vendors[0].follower_count || 0,
                  is_official: vendors[0].is_official || false,
                  product_count: vendors[0].product_count || 0,
                  response_time: vendors[0].response_time || '24 saat',
                  review_count: vendors[0].review_count || 0,
                  years_on_platform: vendors[0].years_on_platform || 0,
                } : undefined}
                sellers={sellersData}
              />
            </div>
          </div>
        </div>

        {/* Product Bundles Section - Çok Al Az Öde */}
        <div className="mt-8">
          <ProductBundlesSection productId={product.id} />
        </div>

        {/* Buy Together Section */}
        <div className="mt-8">
          <BuyTogetherSection 
            mainProduct={productForInfo as any} 
            suggestedProducts={[]} 
          />
        </div>

        {/* User Review Photos */}
        <div className="mt-8">
          <UserReviewPhotos photos={[]} totalCount={156} />
        </div>

        {/* Product Description & Details Tabs */}
        <div className="mt-8 bg-card rounded-xl border overflow-hidden">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start rounded-full border-b bg-muted/30 h-12 px-4">
              <TabsTrigger value="description" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full">
                Ürün Açıklaması
              </TabsTrigger>
              {product.attributes && product.attributes.length > 0 && (
                <TabsTrigger value="specifications" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full">
                  Ürün Özellikleri
                </TabsTrigger>
              )}
              {variants.enabled && variants.combinations.length > 0 && (
                <TabsTrigger value="variants" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full">
                  Varyantlar
                </TabsTrigger>
              )}
              {vendors && vendors.length > 0 && vendors[0] && (
                <TabsTrigger value="vendor" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full">
                  Satıcı Bilgileri
                </TabsTrigger>
              )}
              <TabsTrigger value="safety" className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full">
                Ürün Güvenliği
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="p-6 mt-0">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description || 'Ürün açıklaması bulunmamaktadır.'}
                </p>
              </div>
            </TabsContent>

            {/* Specifications Tab */}
            {product.attributes && product.attributes.length > 0 && (
              <TabsContent value="specifications" className="p-6 mt-0">
                <div className="border rounded-lg overflow-hidden">
                  {product.attributes.map((attr, index) => (
                    <div
                      key={attr.key}
                      className={`flex ${index % 2 === 0 ? 'bg-muted/30' : 'bg-white'}`}
                    >
                      <span className="w-1/3 p-3 text-sm text-muted-foreground border-r font-medium">
                        {attr.label}
                      </span>
                      <span className="w-2/3 p-3 text-sm">{attr.display_value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* Variants Tab */}
            {variants.enabled && variants.combinations.length > 0 && (
              <TabsContent value="variants" className="p-6 mt-0">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Bu ürün için mevcut varyant seçenekleri:
                  </p>
                  <div className="grid gap-4">
                    {variants.combinations.map((variant) => {
                      const variantAttributes = Object.entries(variant.attributes).map(([key, value]) => ({
                        key,
                        value,
                      }));
                      
                      return (
                        <div
                          key={variant.id}
                          className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap gap-2 mb-2">
                                {variantAttributes.map((attr) => (
                                  <Badge key={attr.key} variant="secondary" className="text-xs">
                                    {attr.key}: {attr.value}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-semibold text-primary">
                                  {new Intl.NumberFormat('tr-TR', {
                                    style: 'currency',
                                    currency: pricing.currency || 'TRY',
                                  }).format(variant.price)}
                                </span>
                                <span className="text-muted-foreground">
                                  Stok: {variant.stock > 0 ? `${variant.stock} adet` : 'Stokta yok'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Vendor Tab */}
            {vendors && vendors.length > 0 && vendors[0] && (
              <TabsContent value="vendor" className="p-6 mt-0">
                <div className="space-y-6">
                  {/* Vendor Header */}
                  <div className="flex items-start gap-4 pb-4 border-b">
                    {vendors[0].logo && (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={resolveMediaUrl(vendors[0].logo)}
                          alt={vendors[0].name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/store/${vendors[0].slug}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {vendors[0].name}
                        </Link>
                        {vendors[0].is_official && (
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        )}
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          {Number(vendors[0].rating || 0).toFixed(1)}
                        </Badge>
                      </div>
                      {vendors[0].follower_count && (
                        <p className="text-sm text-muted-foreground">
                          {vendors[0].follower_count >= 1000
                            ? `${(vendors[0].follower_count / 1000).toFixed(1).replace('.0', '')}B`
                            : vendors[0].follower_count.toLocaleString('tr-TR')} Takipçi
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vendor Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vendors[0].product_count !== undefined && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ürünler</p>
                          <p className="font-semibold">{vendors[0].product_count.toLocaleString('tr-TR')}</p>
                        </div>
                      </div>
                    )}
                    
                    {vendors[0].review_count && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Değerlendirme</p>
                          <p className="font-semibold">{vendors[0].review_count.toLocaleString('tr-TR')}</p>
                        </div>
                      </div>
                    )}

                    {vendors[0].years_on_platform !== undefined && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Platformda</p>
                          <p className="font-semibold">{vendors[0].years_on_platform} yıl</p>
                        </div>
                      </div>
                    )}

                    {vendors[0].response_time && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Yanıt Süresi</p>
                          <p className="font-semibold">{vendors[0].response_time}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vendor Description - Note: UnifiedVendor doesn't have description field */}
                  {/* If you need vendor description, add it to UnifiedVendor interface */}

                  {/* Shipping Info */}
                  {vendors[0].shipping && (
                    <div>
                      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Teslimat Bilgileri
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>
                            Tahmini teslimat süresi: {vendors[0].shipping.estimated_days} iş günü
                          </span>
                        </li>
                        {vendors[0].shipping.same_day_cutoff && (
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>
                              Aynı gün kargo: {vendors[0].shipping.same_day_cutoff} saatine kadar
                            </span>
                          </li>
                        )}
                        {vendors[0].shipping.free_shipping_threshold && (
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>
                              {vendors[0].shipping.free_shipping_threshold.toLocaleString('tr-TR')} TL ve üzeri ücretsiz kargo
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Go to Store Button */}
                  <div>
                    <Button asChild className="w-full">
                      <Link href={`/store/${vendors[0].slug}`}>
                        Mağazaya Git
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Safety Tab */}
            <TabsContent value="safety" className="p-6 mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Güvenli Alışveriş
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Orijinal ve garantili ürünler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Güvenli ödeme sistemi ile korumalı alışveriş</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>15 gün içinde ücretsiz iade garantisi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>SSL sertifikası ile şifrelenmiş veri transferi</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Teslimat Güvenliği
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Ürünler orijinal ambalajında gönderilir</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Hasarlı ürünler için anında değişim garantisi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Kargo takip sistemi ile güvenli teslimat</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Kişisel Veri Güvenliği
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>KVKK uyumlu veri işleme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Kişisel bilgileriniz üçüncü taraflarla paylaşılmaz</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Güvenli ödeme bilgileri saklama</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Reviews Section */}
        <div className="mt-8" id="reviews">
          <ProductReviews
            productId={product.id}
            onWriteReview={() => setWriteReviewOpen(true)}
          />
        </div>

        {/* Q&A Section */}
        <div className="mt-8" id="qa">
          <ProductQA productId={product.id} vendorName={vendors[0]?.name} />
        </div>

        {/* Shipping & Returns Section */}
        <div className="mt-8 bg-card rounded-xl border overflow-hidden">
          <div className="p-4 md:p-6 border-b bg-muted/30">
            <h2 className="text-lg font-semibold">Teslimat & İade</h2>
          </div>
          <div className="p-4 md:p-6 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
                Teslimat Bilgileri
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-10">
                <li>• Ürün, satıcı tarafından 2 iş günü içinde kargoya verilir.</li>
                <li>• Standart teslimat süresi 1-3 iş günüdür.</li>
                <li>• Siparişiniz kargoya verildiğinde SMS ile bilgilendirilirsiniz.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
                İade Koşulları
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-10">
                <li>• 15 gün içinde ücretsiz iade hakkınız bulunmaktadır.</li>
                <li>• Ürün, orijinal ambalajında ve kullanılmamış olmalıdır.</li>
                <li>• İade sürecini hesabınızdan başlatabilirsiniz.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Tags */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="mt-8">
            <RelatedTags 
              tags={product.attributes.map(a => a.display_value)} 
              categoryName={product.category?.name} 
            />
          </div>
        )}

        {/* Similar Products */}
        <div className="mt-8">
          <RelatedProducts productId={product.id} categoryId={product.category.id} />
        </div>

        {/* Recently Viewed */}
        <div className="mt-8">
          <RecentlyViewed excludeProductId={product.id} limit={8} />
        </div>
      </div>

      {/* Modals */}
      <PriceAlertModal
        productId={product.id}
        currentPrice={priceForAlert}
        productName={product.title}
        productImage={product.images?.[0]?.url || ''}
        open={priceAlertOpen}
        onOpenChange={setPriceAlertOpen}
      />

      <LocationSelectorModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        onLocationSelect={(location) => {
          setSelectedLocation({
            city: location.city,
            district: location.district,
          });
        }}
      />

      {product && (
        <WriteReviewModal
          open={writeReviewOpen}
          onOpenChange={setWriteReviewOpen}
          product={{
            id: product.id,
            name: product.title,
            title: product.title,
            brand: product.brand?.name || '',
            images: product.images.map(img => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              is_primary: img.order === 1,
            })),
          } as any}
        />
      )}

      {/* Zoom Modal */}
      <ProductZoomModal
        images={product.images}
        initialIndex={zoomImageIndex}
        open={zoomModalOpen}
        onOpenChange={setZoomModalOpen}
        productName={product.title}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
      />

      {/* Sticky Add to Cart Bar */}
      {showStickyBar && (
        <StickyAddToCart
          productTitle={product.title}
          productImage={product.images[0]?.url ? resolveMediaUrl(product.images[0].url) : undefined}
          selectedVariant={productVariant}
          selectedAttributes={selectedAttributes}
          quantity={quantity}
          onQuantityChange={setQuantity}
          isFavorite={isFav}
          onToggleFavorite={() => toggleFavorite(product.id)}
          onAddToCart={handleOpenAddToCartPopup}
          currentPrice={finalPrice}
          originalPrice={originalPrice}
        />
      )}
      
      <AddToCartPopup
        open={addToCartPopupOpen}
        onOpenChange={setAddToCartPopupOpen}
        product={{
          core: {
            id: product.id,
            title: product.title,
            slug: product.slug,
            brand: product.brand ? {
              id: product.brand.id || 0,
              name: product.brand.name,
              slug: product.brand.slug,
            } : undefined,
            images: product.images.map(img => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              order: img.order,
            })),
            attributes: product.attributes,
          } as any,
          pricing: {
            final_price: finalPrice,
            original_price: originalPrice,
            currency: pricing.currency || "TRY",
            stock: selectedVariant?.stock || pricing.stock,
            variants: variants.enabled ? variants.combinations.map(v => ({
              id: v.id,
              value: Object.values(v.attributes)[0] || '',
              price: v.price,
              original_price: v.sale_price ? v.price : undefined,
              stock: v.stock,
            })) : [],
          } as any,
          engagement: null,
          seller: vendors[0] ? {
            id: vendors[0].id,
            name: vendors[0].name,
            slug: vendors[0].slug,
            rating: vendors[0].rating,
            shipping_speed: {
              free_shipping_threshold: 2500,
            },
          } as any : null,
        }}
        sellers={sellersData}
        selectedVariantId={selectedVariant?.id || null}
        quantity={quantity}
        onVariantSelect={handlePopupVariantSelect}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
        isAddedToCart={false}
        variants={variants}
        selectedAttributes={selectedAttributes}
        onAttributeSelect={(key, value) => {
          setSelectedAttributes(prev => ({ ...prev, [key]: value }));
        }}
      />
    </div>
  );
}

