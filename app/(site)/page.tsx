import { Suspense } from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  Sparkles,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CategorySectionHeader } from "@/components/home/CategorySectionHeader";
import { FlashSales } from "@/components/home/FlashSales";
import { QuickLinks } from "@/components/home/QuickLinks";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { ProductCard } from "@/components/product/ProductCard";
import { getAllCategories } from "@/actions/category.actions";
import {
  getBestsellers,
  getNewArrivals,
  getBuyMoreSaveMore,
} from "@/actions/product.actions";
import { getHeroCampaigns } from "@/actions/campaign.actions";
import { getFeaturedVendors } from "@/actions/vendor.actions";
import { getVendorCollections } from "@/actions/collection.actions";
import { getHomeSections } from "@/actions/home.actions";
import { VendorCarousel } from "@/components/home/VendorCarousel";
import { HomeEngine } from "@/components/home/HomeEngine";
import { HomeClient } from "./HomeClient";

export const metadata = {
  title: "Sirizen - Online Alışveriş",
  description: "En iyi fiyatlarla binlerce ürün",
};

/* ─── Skeleton Fallbacks ─── */
function ProductRowSkeleton() {
  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[160px]">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorCarouselSkeleton() {
  return (
    <div className="py-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="flex-shrink-0 w-[320px] h-[200px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ─── Async Section Components (streamable via Suspense) ─── */
async function BestsellersSection() {
  const bestsellers = await getBestsellers(12);
  if (bestsellers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Henüz çok satan ürün bulunmamaktadır.</p>
      </div>
    );
  }
  return (
    <section className="py-6" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Çok Satanlar</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/category/cok-satanlar" className="group">
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
      <div className="w-full overflow-x-auto scrollbar-hide overflow-y-hidden -mx-4 px-4">
        <div className="flex gap-4 min-w-max pb-2">
          {bestsellers.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[180px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function BuyMoreSaveMoreSection() {
  const buyMoreSaveMore = await getBuyMoreSaveMore(12);
  if (buyMoreSaveMore.length === 0) return null;
  return (
    <section className="py-6" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Çok Al Az Öde</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/category/cok-al-az-ode" className="group">
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
      <div className="w-full overflow-x-auto scrollbar-hide overflow-y-hidden -mx-4 px-4">
        <div className="flex gap-4 min-w-max pb-2">
          {buyMoreSaveMore.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[180px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function NewArrivalsSection() {
  const newArrivals = await getNewArrivals(12);
  if (newArrivals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Henüz yeni ürün bulunmamaktadır.</p>
      </div>
    );
  }
  return (
    <section className="py-6" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 400px" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Yeni Gelenler</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/category/yeni-gelenler" className="group">
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
      <div className="w-full overflow-x-auto scrollbar-hide overflow-y-hidden -mx-4 px-4">
        <div className="flex gap-4 min-w-max pb-2">
          {newArrivals.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[180px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function FeaturedVendorsSection() {
  const featuredVendors = await getFeaturedVendors(9);
  if (featuredVendors.length === 0) return null;
  return <VendorCarousel vendors={featuredVendors} title="Popüler Mağazalar" />;
}

async function HomeEngineSection() {
  const [vendorCollections, homeSections] = await Promise.all([
    getVendorCollections(6),
    getHomeSections(),
  ]);
  return (
    <HomeEngine
      sections={homeSections && homeSections.length > 0 ? homeSections : undefined}
      vendorCollections={vendorCollections}
    />
  );
}

/* ─── Main Page ─── */
export default async function HomePage() {
  // Only fetch above-the-fold data synchronously
  const [categories, campaigns] = await Promise.all([
    getAllCategories(),
    getHeroCampaigns(),
  ]);

  const mainCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="lg:pb-8">
      {/* Hero Carousel - Above fold, priority */}
      <Suspense
        fallback={
          <Skeleton className="h-[200px] sm:h-[300px] lg:h-[400px] w-full" />
        }
      >
        <HeroCarousel campaigns={campaigns} />
      </Suspense>

      {/* Quick Links */}
      <QuickLinks />

      <div className="container mx-auto px-4">
        {/* Flash Sales - Mock Data with Demo Notification */}
        <FlashSales />

        {/* Category Grid - Above fold, renders immediately */}
        <section className="py-4">
          <CategorySectionHeader />
          <CategoryGrid categories={mainCategories} />
        </section>

        {/* Home Engine - Streamed */}
        <Suspense fallback={null}>
          <HomeEngineSection />
        </Suspense>

        {/* Bestsellers - Streamed independently */}
        <Suspense fallback={<ProductRowSkeleton />}>
          <BestsellersSection />
        </Suspense>

        {/* Buy More Save More - Streamed independently */}
        <Suspense fallback={<ProductRowSkeleton />}>
          <BuyMoreSaveMoreSection />
        </Suspense>

        {/* Free Shipping Banner - Static content, renders immediately */}
        <section className="py-6" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 120px" }}>
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
              <div className="absolute top-1/2 -translate-y-1/2 animate-[flyAcross_8s_linear_infinite] opacity-20">
                <Truck className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Ücretsiz Kargo
                    </h3>
                    <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      200 TL+
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">
                    200 TL ve üzeri alışverişlerde kargo bedava!
                  </p>
                </div>
              </div>
              <Button className="bg-white text-green-600 hover:bg-white/90 font-semibold" asChild>
                <Link href="/category/ucretsiz-kargo">
                  Fırsatları Keşfet
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* New Arrivals - Streamed independently */}
        <Suspense fallback={<ProductRowSkeleton />}>
          <NewArrivalsSection />
        </Suspense>

        {/* Featured Vendors - Streamed independently */}
        <Suspense fallback={<VendorCarouselSkeleton />}>
          <FeaturedVendorsSection />
        </Suspense>

        {/* Related Tags - Static, renders immediately */}
        <section className="py-6" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 100px" }}>
          <div className="bg-white rounded-lg shadow-card ">
            <h3 className="text-lg font-semibold mb-4">
              Bunlar da İlginizi Çekebilir
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Moda",
                "Erkek Modelleri",
                "Çocuk Ürünleri",
                "Ev & Yaşam",
                "Elektronik",
                "Spor & Outdoor",
                "Kozmetik",
                "Ayakkabı",
                "Çanta",
                "Saat",
                "Gözlük",
                "Takı",
                "İndirimli Ürünler",
                "Yeni Sezon",
                "Kampanyalı Ürünler",
                "Popüler Markalar",
              ].map((tag, index) => (
                <Link
                  key={index}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-sm text-foreground rounded-full border border-border hover:border-primary/30 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recently Viewed */}
        <RecentlyViewed showClear />
      </div>

      {/* Client Component for notifications */}
      <HomeClient />
    </div>
  );
}
