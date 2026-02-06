# Seed Data for Laravel Backend

Bu klasörde Laravel backend için seed data dosyaları bulunmaktadır.

## Dosyalar

- `categories.json` - Kategori verileri (ana kategoriler ve alt kategoriler)
- `vendors.json` - Satıcı/Vendor verileri
- `products.json` - Ürün verileri
- `product_images.json` - Ürün görselleri
- `product_variants.json` - Ürün varyantları (beden, renk vb.)

## Kullanım

Laravel backend'de bu JSON dosyalarını kullanarak seed işlemi yapabilirsiniz:

1. JSON dosyalarını Laravel projenizin `database/seeders/` klasörüne kopyalayın
2. Seeder sınıflarınızda bu JSON dosyalarını okuyun ve veritabanına ekleyin

## Veri Yapısı

### Categories
- `id`: Kategori ID
- `name`: Kategori adı
- `slug`: URL slug
- `icon`: Emoji icon (opsiyonel)
- `image`: Görsel URL (opsiyonel)
- `parent_id`: Üst kategori ID (null ise ana kategori)
- `product_count`: Ürün sayısı

### Vendors
- `id`: Satıcı ID
- `name`: Satıcı adı
- `slug`: URL slug
- `logo`: Logo URL
- `banner`: Banner görsel URL
- `rating`: Ortalama puan
- `review_count`: Değerlendirme sayısı
- `follower_count`: Takipçi sayısı
- `product_count`: Ürün sayısı
- `location`: Konum
- `years_on_platform`: Platformda yıl sayısı
- `response_time`: Yanıt süresi
- `description`: Açıklama
- `is_official`: Resmi mağaza mı?
- `created_at`: Oluşturulma tarihi

### Products
- `id`: Ürün ID
- `name`: Ürün adı
- `title`: Ürün başlığı
- `slug`: URL slug
- `description`: Açıklama
- `short_description`: Kısa açıklama
- `brand`: Marka adı
- `brand_slug`: Marka slug
- `category_id`: Kategori ID
- `vendor_id`: Satıcı ID
- `price`: Fiyat
- `original_price`: Orijinal fiyat
- `discount_percentage`: İndirim yüzdesi
- `currency`: Para birimi
- `rating`: Ortalama puan
- `review_count`: Değerlendirme sayısı
- `question_count`: Soru sayısı
- `stock`: Stok miktarı
- `is_in_stock`: Stokta var mı?
- `is_bestseller`: En çok satan mı?
- `is_new`: Yeni ürün mü?
- `has_free_shipping`: Ücretsiz kargo var mı?
- `shipping_time`: Kargo süresi
- `specifications`: Özellikler (JSON object)
- `tags`: Etiketler (JSON array)
- `created_at`: Oluşturulma tarihi
- `updated_at`: Güncellenme tarihi

### Product Images
- `id`: Görsel ID
- `product_id`: Ürün ID
- `url`: Görsel URL
- `alt`: Alt text
- `is_primary`: Ana görsel mi?
- `order`: Sıralama

### Product Variants
- `id`: Varyant ID
- `product_id`: Ürün ID
- `name`: Varyant adı (örn: "S", "M", "Kırmızı")
- `type`: Varyant tipi ("size", "color", "other")
- `value`: Varyant değeri
- `price`: Fiyat
- `original_price`: Orijinal fiyat
- `stock`: Stok miktarı
- `sku`: SKU kodu
- `image`: Varyant görseli (opsiyonel)

## Notlar

- Tüm tarihler ISO 8601 formatında (UTC)
- Fiyatlar TL cinsinden
- Görseller Unsplash ve CDN URL'leri kullanıyor
- `specifications` ve `tags` alanları JSON formatında saklanmalı

