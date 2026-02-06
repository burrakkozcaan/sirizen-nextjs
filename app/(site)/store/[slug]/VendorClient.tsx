"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  Package,
  Users,
  Store,
  Search,
  ChevronLeft,
  ChevronDown,
  BadgeCheck,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/ProductCard";
import { checkVendorFollow, followVendor, unfollowVendor } from "@/actions/vendor.actions";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import type { Vendor, Product } from "@/types";
import { useRouter } from "next/navigation";

interface VendorClientProps {
  vendor: Vendor;
  productsPromise: Promise<{ data: Product[]; meta: any }>;
}

type TabType = "home" | "products" | "deals" | "about";
type SortOption = "recommended" | "price_asc" | "price_desc" | "newest" | "rating" | "bestseller";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Önerilen" },
  { value: "price_asc", label: "En Düşük Fiyat" },
  { value: "price_desc", label: "En Yüksek Fiyat" },
  { value: "newest", label: "En Yeniler" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "bestseller", label: "Çok Satanlar" },
];

interface Filters {
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  hasDiscount: boolean;
  inStock: boolean;
}

const DEFAULT_FILTERS: Filters = {
  minPrice: null,
  maxPrice: null,
  minRating: null,
  hasDiscount: false,
  inStock: false,
};

export function VendorClient({ vendor, productsPromise }: VendorClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { setOpen: setBottomSheetOpen } = useBottomSheet();
  const [isFollowing, setIsFollowing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);

  // Filter & Sort State
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [tempFilters, setTempFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    productsPromise.then((result) => {
      setProducts(result.data);
      setLoading(false);
    });
  }, [productsPromise]);

  useEffect(() => {
    if (user) {
      checkVendorFollow(vendor.slug).then((following) => {
        setIsFollowing(following);
      });
    }
  }, [user, vendor.slug]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSortDropdown) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSortDropdown]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("Lütfen önce giriş yapın");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowVendor(vendor.slug);
        if (result.success) {
          setIsFollowing(false);
          toast.success(result.message || "Mağaza takipten çıkarıldı");
        }
      } else {
        const result = await followVendor(vendor.slug);
        if (result.success) {
          setIsFollowing(true);
          toast.success(result.message || "Mağaza takip edildi");
        }
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&vendor=${vendor.slug}`);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter((p) =>
        (p.name || p.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (filters.minPrice !== null) {
      result = result.filter((p) => {
        const price = p.discount_price || p.price;
        return price >= filters.minPrice!;
      });
    }
    if (filters.maxPrice !== null) {
      result = result.filter((p) => {
        const price = p.discount_price || p.price;
        return price <= filters.maxPrice!;
      });
    }

    // Rating filter
    if (filters.minRating !== null) {
      result = result.filter((p) => (p.rating || 0) >= filters.minRating!);
    }

    // Discount filter
    if (filters.hasDiscount) {
      result = result.filter((p) => p.discount_percentage && p.discount_percentage > 0);
    }

    // In stock filter
    if (filters.inStock) {
      result = result.filter((p) => p.is_in_stock !== false && (p.stock === undefined || p.stock > 0));
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
        break;
      case "price_desc":
        result.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "bestseller":
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      default:
        // recommended - keep original order
        break;
    }

    return result;
  }, [products, searchQuery, filters, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice !== null) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.minRating !== null) count++;
    if (filters.hasDiscount) count++;
    if (filters.inStock) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setTempFilters(DEFAULT_FILTERS);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilterSheet(false);
  };

  const openFilterSheet = () => {
    setTempFilters(filters);
    setShowFilterSheet(true);
  };

  const vendorLogo = vendor.seller_page?.logo || vendor.logo;
  const vendorBanner = vendor.seller_page?.banner || vendor.banner;

  // Get vendor stats - check multiple possible field names
  const productCount = vendor.product_count || (vendor as any).products_count || (vendor as any).total_products || 0;
  const rating = Number(vendor.rating) || 0;
  const reviewCount = vendor.review_count || (vendor as any).reviews_count || 0;
  const followerCount = vendor.follower_count || (vendor as any).followers_count || 0;
  const yearsOnPlatform = vendor.years_on_platform || (vendor as any).years || 0;
  const responseTime = vendor.response_time || '24 saat';
  
  const scoreColor =
    rating >= 8 ? "bg-green-500" : rating >= 6 ? "bg-yellow-500" : "bg-orange-500";

  return (
    <div className="min-h-screen bg-white-50 px-4 md:px-0">
      {/* Store Header */}
      <div ref={headerRef} className="bg-white sticky top-0 z-40 shadow-sm container mx-auto px-4 md:px-0 rounded-lg ">
        {/* Banner + Info Section */}
        <div
          className="relative"
          style={{
            background: vendorBanner
              ? `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)`
              : `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%),rgb(201, 31, 19)`,
          }}
        >
          {vendorBanner && (
            <Image
              src={resolveMediaUrl(vendorBanner)}
              alt=""
              fill
              className="object-cover -z-10"
              priority
            />
          )}

          <div className="relative z-10 px-4 py-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => router.back()}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                {vendorLogo ? (
                  <Image
                    src={resolveMediaUrl(vendorLogo)}
                    alt={vendor.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg md:text-xl font-bold text-white truncate">
                    {vendor.name}
                  </h1>
                  {vendor.is_official && (
                    <BadgeCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  )}
                  <div className={cn("px-1.5 py-0.5 rounded text-xs font-bold text-white", scoreColor)}>
                    {rating.toFixed(1)}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white/90 text-xs">
                    <strong>{formatNumber(followerCount)}</strong> Takipçi
                  </span>
                </div>
              </div>

              {/* Follow Button - Right Side */}
              <Button
                size="sm"
                variant={isFollowing ? "secondary" : "default"}
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={cn(
                  "h-9 px-4 text-xs font-semibold flex-shrink-0",
                  !isFollowing && "bg-white text-primary hover:bg-white/90"
                )}
              >
                {followLoading ? "..." : isFollowing ? "Takip Ediliyor" : "Takip Et"}
              </Button>
            </div>

            <form onSubmit={handleSearch} className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Mağazada ara"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-white border-0 rounded-lg text-sm"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {[
            { key: "home", label: "Ana Sayfa" },
            { key: "products", label: "Tüm Ürünler" },
            { key: "deals", label: "Fırsat Ürünleri" },
            { key: "about", label: "Satıcı Profili" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={cn(
                "flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.key
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="container mx-auto py-4">
        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            {/* Filter Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center gap-2 flex-wrap">
              {/* Filter Button */}
              <button
                onClick={openFilterSheet}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-full transition-colors whitespace-nowrap",
                  activeFilterCount > 0
                    ? "border-primary text-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary hover:text-primary"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtrele
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortDropdown(!showSortDropdown);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] z-[100]">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between",
                          sortBy === option.value && "text-primary font-medium"
                        )}
                      >
                        {option.label}
                        {sortBy === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <>
                  <div className="h-6 w-px bg-gray-200" />
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 whitespace-nowrap"
                  >
                    <X className="w-3 h-3" />
                    Temizle
                  </button>
                </>
              )}

              <div className="h-6 w-px bg-gray-200 ml-auto" />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {filteredAndSortedProducts.length} ürün
              </span>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery || activeFilterCount > 0
                    ? "Filtrelere uygun ürün bulunamadı"
                    : "Henüz ürün bulunmuyor"}
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3">
                    Filtreleri Temizle
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Home Tab */}
        {activeTab === "home" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">{vendor.name}</h3>
              <p className="text-gray-500 text-sm">Mağaza ana sayfası yakında aktif olacak.</p>
            </div>
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === "deals" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Şu an aktif kampanya bulunmuyor.</p>
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-base mb-4">Mağaza Bilgileri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ürünler</p>
                    <p className="font-semibold">{formatNumber(productCount)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Puan</p>
                    <p className="font-semibold">{rating.toFixed(1)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Platformda</p>
                    <p className="font-semibold">{yearsOnPlatform} yıl</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Takipçi</p>
                    <p className="font-semibold">{formatNumber(followerCount)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-base mb-3">Hakkında</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {vendor.seller_page?.description ||
                  vendor.description ||
                  `${vendor.name}, Sirizen'de ${vendor.years_on_platform} yıldır hizmet vermektedir.`}
              </p>
            </div>

            {vendor.location && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-base mb-3">Konum</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary" />
                  {vendor.location}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Sheet (Bottom Sheet on Mobile) */}
      {showFilterSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowFilterSheet(false)}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 md:w-[400px] bg-white z-[60] rounded-t-2xl md:rounded-none shadow-xl flex flex-col max-h-[85vh] md:max-h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Filtreler</h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Price Range */}
              <div>
                <h4 className="font-medium text-sm mb-3">Fiyat Aralığı</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={tempFilters.minPrice || ""}
                      onChange={(e) =>
                        setTempFilters({
                          ...tempFilters,
                          minPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-10"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Max"
                      value={tempFilters.maxPrice || ""}
                      onChange={(e) =>
                        setTempFilters({
                          ...tempFilters,
                          maxPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-medium text-sm mb-3">Minimum Puan</h4>
                <div className="flex gap-2">
                  {[null, 3, 3.5, 4, 4.5].map((value) => (
                    <button
                      key={value ?? "all"}
                      onClick={() => setTempFilters({ ...tempFilters, minRating: value })}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors",
                        tempFilters.minRating === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {value === null ? (
                        "Tümü"
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {value}+
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="font-medium text-sm mb-3">Hızlı Filtreler</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={tempFilters.hasDiscount}
                      onChange={(e) =>
                        setTempFilters({ ...tempFilters, hasDiscount: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">İndirimli Ürünler</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={tempFilters.inStock}
                      onChange={(e) =>
                        setTempFilters({ ...tempFilters, inStock: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Stokta Olanlar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setTempFilters(DEFAULT_FILTERS);
                }}
              >
                Temizle
              </Button>
              <Button className="flex-1" onClick={applyFilters}>
                Uygula
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "K";
  }
  return num.toString();
}
