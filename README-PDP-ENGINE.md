# PDP Engine - Trendyol-style Product Detail Page

Bu doküman, Laravel backend ile entegre çalışan Next.js PDP (Product Detail Page) Engine'in kurulumunu ve kullanımını açıklar.

## 🏗️ Mimari

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│  Laravel API    │────▶│   Database      │
│   Frontend      │     │   (/api/pdp/*)  │     │   (MySQL)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📁 Dosya Yapısı

```
components/
├── pdp/
│   ├── PdpEngine.tsx           # Ana PDP motoru
│   ├── PdpBlockRenderer.tsx    # Blok render edici
│   ├── ProductSkeleton.tsx     # Yüklenme durumu
│   └── blocks/
│       ├── Gallery.tsx         # Ürün görselleri
│       ├── Title.tsx           # Ürün başlığı
│       ├── Price.tsx           # Fiyat
│       ├── Badges.tsx          # Rozetler
│       ├── SocialProof.tsx     # Sosyal kanıt
│       ├── VariantSelector.tsx # Varyant seçici
│       ├── HighlightAttributes.tsx # Öne çıkan özellikler
│       ├── AddToCart.tsx       # Sepete ekle
│       ├── Description.tsx     # Açıklama
│       └── DeliveryInfo.tsx    # Teslimat bilgisi
├── filters/
│   ├── FilterSidebar.tsx       # Filtre sidebar
│   ├── CheckboxFilter.tsx      # Checkbox filtresi
│   └── RangeFilter.tsx         # Fiyat aralığı filtresi

hooks/
├── usePdp.ts                   # PDP veri hook'u
└── useFilters.ts               # Filtre hook'u

services/
└── pdpApi.ts                   # API servisleri

types/
└── pdp.ts                      # TypeScript tipleri
```

## 🚀 Kurulum

### 1. Environment Variables

`.env.local` dosyasına API URL'sini ekleyin:

```env
NEXT_PUBLIC_API_URL=https://api.sirizen.com
```

### 2. API Endpoints

Laravel backend şu endpoint'leri sağlar:

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/pdp/{slug}` | Tam PDP verisi |
| `GET /api/pdp/{slug}/badges` | Sadece rozetler |
| `GET /api/pdp/{slug}/social-proof` | Sosyal kanıt |
| `GET /api/pdp/{slug}/highlights` | Öne çıkan özellikler |
| `GET /api/pdp/{slug}/variant` | Varyant detayı |
| `GET /api/pdp/{slug}/reviews` | Yorumlar |
| `GET /api/pdp/{slug}/related` | Benzer ürünler |
| `GET /api/categories/{slug}` | Kategori + filtreler |

### 3. Kullanım

#### Ürün Detay Sayfası

```tsx
// app/product/[slug]/page.tsx
import { PdpEngine } from '@/components/pdp/PdpEngine';

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <PdpEngine slug={params.slug} />;
}
```

#### PDP Engine

```tsx
import { usePdp } from '@/hooks/usePdp';

function PdpEngine({ slug }: { slug: string }) {
  const { data, isLoading, selectedVariant, selectVariant } = usePdp(slug);
  
  if (isLoading) return <ProductSkeleton />;
  
  // data.layout: Kategoriye göre değişen blok dizilimi
  // data.badges: Otomatik hesaplanan rozetler
  // data.highlights: Öne çıkan özellikler (sarı kutular)
  // data.social_proof: "3.2K kişinin sepetinde" vb.
}
```

## 🎨 Blok Sistemi

Trendyol'da her kategori farklı bloklar gösterir:

### Giyim Kategorisi
```json
[
  { "block": "gallery", "position": "main", "order": 1 },
  { "block": "title", "position": "main", "order": 2 },
  { "block": "badges", "position": "main", "order": 3 },
  { "block": "variant_selector", "position": "main", "order": 4 },
  { "block": "size_guide", "position": "main", "order": 5 },
  { "block": "price", "position": "sidebar", "order": 1 },
  { "block": "add_to_cart", "position": "sidebar", "order": 2 }
]
```

### Elektronik Kategorisi
```json
[
  { "block": "gallery", "position": "main", "order": 1 },
  { "block": "title", "position": "main", "order": 2 },
  { "block": "attributes_highlight", "position": "main", "order": 3 },
  { "block": "price", "position": "sidebar", "order": 1 },
  { "block": "add_to_cart", "position": "sidebar", "order": 2 },
  { "block": "warranty_info", "position": "sidebar", "order": 3 }
]
```

## 🔥 Özellikler

### 1. Otomatik Badge Hesaplama
Backend'de kurallara göre otomatik hesaplanır:
- İndirim ≥ %30 → "Avantajlı Ürün"
- Stok < 10 → "Son X Adet"
- Değerlendirme > 4.5 → "Çok Beğenilen"

### 2. Sosyal Kanıt (Real-time)
```tsx
// 30 saniyede bir güncellenir
const socialProof = useSocialProof(slug);
// "Son 24 saatte 28.3K kişi görüntüledi"
```

### 3. Varyant Seçimi
```tsx
const { selectedVariant, selectVariant } = usePdp(slug);
// Beden + Renk kombinasyonları otomatik yönetilir
```

### 4. Filtre Sistemi
Kategoriye özel filtreler:
```tsx
const { filters, toggleFilter, applyFilters } = useFilters(categorySlug);
// Giyim: Beden, Renk, Materyal
// Elektronik: RAM, Depolama, Ekran Boyutu
```

## 📱 Responsive Davranış

- **Mobile**: Tek sütun, filtreler drawer
- **Tablet**: İki sütun
- **Desktop**: Ana içerik (8/12) + Sidebar (4/12)

## ⚡ Performans

- **Code Splitting**: Her blok lazy-loaded
- **Image Optimization**: Next.js Image component
- **Caching**: SWR veya React Query önerilir
- **Skeleton Loading**: Yükleme durumları

## 🔧 Admin Panel (Filament)

Laravel tarafında Filament ile yönetilir:
- PDP Layout Editor
- Badge Rule Manager
- Filter Configurator
- Attribute Highlight Editor

## 📝 Örnek API Response

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 123,
      "title": "Defacto Erkek Deri Ceket",
      "price": 2499.99,
      "discount_price": 1499.99,
      "discount_percentage": 40,
      "rating": 4.5,
      "reviews_count": 328,
      "images": [...],
      "variants": [...]
    },
    "layout": [
      { "block": "gallery", "position": "main", "order": 1 },
      { "block": "title", "position": "main", "order": 2 },
      { "block": "badges", "position": "main", "order": 3 },
      { "block": "price", "position": "sidebar", "order": 1 },
      { "block": "add_to_cart", "position": "sidebar", "order": 2 }
    ],
    "badges": [
      { "key": "fast_delivery", "label": "Hızlı Teslimat", "color": "green" },
      { "key": "advantage", "label": "Avantajlı Ürün", "color": "orange" }
    ],
    "highlights": [
      { "label": "Materyal", "value": "Deri", "icon": "check", "color": "#f97316" },
      { "label": "Astar", "value": "Polar", "icon": "check", "color": "#f97316" }
    ],
    "social_proof": {
      "type": "cart",
      "message": "3.2K kişinin sepetinde",
      "color": "orange",
      "refresh_interval": 30000
    }
  }
}
```

## 🐛 Debug

```tsx
// Layout yapısını konsolda gör
console.log(data.layout);

// Blok render durumlarını izle
<PdpBlockRenderer debug />
```

## 📚 İlgili Dosyalar

- Backend: `app/Services/PDPService.php`
- Backend: `app/Http/Controllers/Api/PdpController.php`
- Migration: `database/migrations/*pdp*.php`
- Models: `app/Models/PdpLayout.php`, `app/Models/PdpBlock.php`
