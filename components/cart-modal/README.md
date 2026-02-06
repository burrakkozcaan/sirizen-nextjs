# Cart Modal Engine

PDP'nin küçültülmüş versiyonu. Aynı rule engine'den beslenir ama farklı layout config'i vardır.

## 🏗️ Mimari

```
PDP Engine                    Cart Modal Engine
     │                              │
     └──────► Category Group ◄──────┘
              │           │
     ┌────────┘           └────────┐
PDP Layout Config      Cart Modal Layout Config
(Full sayfa)              (Kompakt modal)
```

## 📁 Dosya Yapısı

```
components/cart-modal/
├── CartModalEngine.tsx           # Ana motor
├── CartModalBlockRenderer.tsx    # Blok render edici
├── README.md                     # Bu dosya
└── blocks/
    ├── ProductInfo.tsx           # Ürün başlığı + görsel
    ├── VariantSelector.tsx       # Beden/Renk seçici
    ├── SellerSelector.tsx        # Çoklu satıcı seçimi
    ├── Price.tsx                 # Fiyat gösterimi
    ├── StockWarning.tsx          # Stok uyarısı
    ├── CampaignInfo.tsx          # Kampanya bilgisi
    └── WarrantyInfo.tsx          # Garanti bilgisi
```

## 🚀 Kullanım

```tsx
import { CartModalEngine } from '@/components/cart-modal/CartModalEngine';

function ProductCard({ product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Sepete Ekle
      </button>

      <CartModalEngine
        slug={product.slug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={(variant, quantity) => {
          // Sepete ekleme logic'i
          console.log('Adding:', variant, quantity);
        }}
      />
    </>
  );
}
```

## 🎨 Kategori Bazlı Layout'lar

### Giyim
```json
{
  "blocks": [
    { "block": "variant_selector", "order": 1, "props": { "type": "size" } },
    { "block": "variant_selector", "order": 2, "props": { "type": "color" } },
    { "block": "stock_warning", "order": 3 },
    { "block": "price", "order": 4 },
    { "block": "add_to_cart", "order": 5 }
  ],
  "rules": {
    "disable_add_until_variant_selected": true,
    "show_stock_warning_threshold": 5
  }
}
```

### Kozmetik
```json
{
  "blocks": [
    { "block": "variant_selector", "order": 1, "props": { "type": "volume" } },
    { "block": "campaign_info", "order": 2 },
    { "block": "price", "order": 3 },
    { "block": "add_to_cart", "order": 4 }
  ],
  "rules": {
    "show_campaign_info": true
  }
}
```

### Elektronik
```json
{
  "blocks": [
    { "block": "seller_selector", "order": 1 },
    { "block": "variant_selector", "order": 2, "props": { "type": "storage" } },
    { "block": "warranty_info", "order": 3 },
    { "block": "price", "order": 4 },
    { "block": "add_to_cart", "order": 5 }
  ],
  "rules": {
    "show_multiple_sellers": true,
    "show_warranty_info": true
  }
}
```

## 🔑 Özellikler

### 1. Varyant Kombinasyon Validasyonu
```typescript
// Backend'den gelen kombinasyon bilgisi
{
  "combinations": [
    { "attributes": { "size": "M", "color": "Siyah" }, "stock": 5 },
    { "attributes": { "size": "M", "color": "Beyaz" }, "stock": 0 } // Pasif
  ]
}
```

### 2. URL State Senkronizasyonu
Cart modal ve PDP aynı URL state'i paylaşır:
```
/product/urun-adi?size=M&color=Siyah
```
- Modal'da seçim yapılınca URL güncellenir
- PDP refresh olunca seçim korunur

### 3. Çoklu Satıcı Desteği
Elektronik kategorisinde en uygun fiyatlı satıcı otomatik seçilir.

### 4. Kurallar (Rules)
```typescript
interface CartModalRules {
  disable_add_until_variant_selected?: boolean;  // Varyant zorunlu
  show_stock_warning_threshold?: number;         // Stok uyarı eşiği
  show_multiple_sellers?: boolean;              // Çoklu satıcı
  show_warranty_info?: boolean;                 // Garanti bilgisi
  show_campaign_info?: boolean;                 // Kampanya bilgisi
}
```

## 📡 API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/cart-modal/{slug}` | Cart modal verisi |
| `POST /api/cart-modal/{slug}/validate-variant` | Varyant kombinasyonunu doğrula |
| `GET /api/cart-modal/{slug}/layout-config` | Layout config'i getir |

## 🔄 PDP ile İlişki

| Özellik | PDP | Cart Modal |
|---------|-----|------------|
| Veri Kaynağı | Aynı Product Model | Aynı Product Model |
| Layout Config | `pdp_layouts` tablosu | `cart_modal_layouts` tablosu |
| URL State | ✅ | ✅ (Paylaşılan) |
| SEO | ✅ | ❌ (Modal) |
| Varyant Logic | ✅ | ✅ (Daha katı) |

## ⚡ Performans

- Lazy loading: Bloklar ihtiyaç halinde yüklenir
- Cache: Backend'de 5 dakika cache
- Polling yok: Statik veri (modal kapanana kadar)

## 🐛 Debug

Development modunda layout bilgisi konsola yazılır:
```typescript
console.log('[CartModal] Layout:', layout);
console.log('[CartModal] Rules:', rules);
console.log('[CartModal] Selected Variant:', selectedVariant);
```
