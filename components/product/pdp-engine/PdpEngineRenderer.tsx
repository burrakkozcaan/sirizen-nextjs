"use client";

import { Suspense } from "react";
import type { PdpEngineData, PdpBlockConfig } from "@/types/pdp-engine";
import { BadgeList } from "./BadgeList";
import { HighlightAttributes } from "./HighlightAttributes";
import { SocialProofBanner } from "./SocialProofBanner";
import { getBlocksByPosition, getDefaultLayout } from "@/actions/pdp-engine.actions";

// Re-use existing components
import { ProductImageGallery } from "../ProductImageGallery";
import { ProductInfoSection } from "../ProductInfoSection";
import { ProductSidebar } from "../ProductSidebar";
import { DeliveryInfoBox } from "../DeliveryInfoBox";
import { ProductReviews } from "../ProductReviews";
import { ProductQA } from "../ProductQA";
import { PDPSimilarProducts } from "../PDPSimilarProducts";

interface PdpEngineRendererProps {
  data: PdpEngineData;
}

/**
 * PDP Engine Renderer
 * 
 * Kategori bazlı dinamik blok dizilimini render eder.
 * Her blok, layout konfigürasyonuna göre belirlenir.
 */
export function PdpEngineRenderer({ data }: PdpEngineRendererProps) {
  const { product, layout, badges, highlights, social_proof } = data;
  
  // Layout yoksa varsayılanı kullan
  const blocks = layout?.length > 0 ? layout : getDefaultLayout();
  
  // Pozisyonlara göre blokları ayır
  const mainBlocks = getBlocksByPosition(blocks, "main");
  const sidebarBlocks = getBlocksByPosition(blocks, "sidebar");
  const bottomBlocks = getBlocksByPosition(blocks, "bottom");
  const underTitleBlocks = getBlocksByPosition(blocks, "under_title");

  return (
    <div className="space-y-8">
      {/* Ana Grid: Sol (Galeri + Bilgi) - Sağ (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon */}
        <div className="lg:col-span-8 space-y-6">
          {/* Üst Kısım: Galeri + Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol: Ürün Görselleri */}
            <div>
              <ProductImageGallery 
                images={product.images} 
                productTitle={product.title}
                badges={badges}
              />
            </div>
            
            {/* Sağ: Ürün Bilgileri */}
            <div className="space-y-4">
              {/* Blokları Render Et */}
              {mainBlocks.map((block) => (
                <BlockRenderer
                  key={`${block.block}-${block.order}`}
                  block={block}
                  product={product}
                  badges={badges}
                  highlights={highlights}
                  socialProof={social_proof}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sağ Kolon: Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {sidebarBlocks.map((block) => (
            <BlockRenderer
              key={`sidebar-${block.block}-${block.order}`}
              block={block}
              product={product}
              badges={badges}
              highlights={highlights}
              socialProof={social_proof}
            />
          ))}
          
          {/* Fallback: Eski Sidebar */}
          {sidebarBlocks.length === 0 && (
            <ProductSidebar product={product as any} />
          )}
        </div>
      </div>
      
      {/* Alt Kısım: Detaylar, Yorumlar, vb. */}
      <div className="space-y-8">
        {bottomBlocks.map((block) => (
          <BlockRenderer
            key={`bottom-${block.block}-${block.order}`}
            block={block}
            product={product}
            badges={badges}
            highlights={highlights}
            socialProof={social_proof}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Blok Renderer - Her blok tipi için uygun component'i render eder
 */
interface BlockRendererProps {
  block: PdpBlockConfig;
  product: PdpEngineData["product"];
  badges: PdpEngineData["badges"];
  highlights: PdpEngineData["highlights"];
  socialProof: PdpEngineData["social_proof"];
}

function BlockRenderer({ block, product, badges, highlights, socialProof }: BlockRendererProps) {
  switch (block.block) {
    case "badges":
      return <BadgeList badges={badges} />;
      
    case "social_proof":
      return socialProof ? <SocialProofBanner data={socialProof} /> : null;
      
    case "attributes_highlight":
      return <HighlightAttributes highlights={highlights} />;
      
    case "title":
      return (
        <div>
          {product.brand && (
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {product.brand}
            </p>
          )}
          <h1 className="text-xl md:text-2xl font-bold">{product.title}</h1>
        </div>
      );
      
    case "rating":
      return (
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? "fill-current"
                    : "fill-gray-200"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-medium">{Number(product.rating || 0).toFixed(1)}</span>
          {product.reviews_count > 0 && (
            <a href="#reviews" className="text-sm text-muted-foreground hover:underline">
              ({product.reviews_count} değerlendirme)
            </a>
          )}
        </div>
      );
      
    case "price":
      return (
        <div className="space-y-1">
          {product.discount_percentage > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                %{Math.round(product.discount_percentage)} İNDİRİM
              </span>
              <span className="text-muted-foreground line-through text-sm">
                {product.price.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: product.currency,
                })}
              </span>
            </div>
          )}
          <div className="text-3xl font-bold text-orange-600">
            {(product.discount_price || product.price).toLocaleString("tr-TR", {
              style: "currency",
              currency: product.currency,
            })}
          </div>
        </div>
      );
      
    case "add_to_cart":
      return (
        <div className="space-y-3">
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Sepete Ekle
          </button>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-orange-600 text-center">
              Sadece {product.stock} adet kaldı!
            </p>
          )}
        </div>
      );
      
    case "delivery_info":
      return (
        <DeliveryInfoBox 
          hasFreeShipping={product.fast_delivery}
          shippingTime={product.fast_delivery ? "24 saat içinde kargoda" : "2-4 iş günü"}
        />
      );
      
    case "description":
      return product.description ? (
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Ürün Açıklaması</h2>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      ) : null;
      
    case "reviews":
      return (
        <div id="reviews">
          <ProductReviews productId={product.id} />
        </div>
      );
      
    case "questions":
      return (
        <div>
          <ProductQA productId={product.id} />
        </div>
      );
      
    case "related_products":
      return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <PDPSimilarProducts productId={product.id} />
        </Suspense>
      );
      
    default:
      return null;
  }
}
