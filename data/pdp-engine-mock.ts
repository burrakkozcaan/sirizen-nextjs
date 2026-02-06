/**
 * PDP Engine Mock Data
 * Test ve geliştirme için örnek veriler
 */

import type { PdpEngineData, CategoryGroup, FilterConfig } from "@/types/pdp-engine";

// ============================================
// CATEGORY GROUPS
// ============================================

export const mockCategoryGroups: CategoryGroup[] = [
  {
    id: 1,
    key: "giyim",
    name: "Giyim",
    icon: "shirt",
    color: "#ec4899",
    is_active: true,
  },
  {
    id: 2,
    key: "elektronik",
    name: "Elektronik",
    icon: "smartphone",
    color: "#3b82f6",
    is_active: true,
  },
  {
    id: 3,
    key: "kozmetik",
    name: "Kozmetik & Kişisel Bakım",
    icon: "sparkles",
    color: "#8b5cf6",
    is_active: true,
  },
  {
    id: 4,
    key: "ev-yasam",
    name: "Ev & Yaşam",
    icon: "home",
    color: "#10b981",
    is_active: true,
  },
];

// ============================================
// MOCK PDP DATA - GİYİM ÜRÜNÜ
// ============================================

export const mockPdpDataClothing: PdpEngineData = {
  product: {
    id: 1,
    title: "Defacto Erkek Slim Fit Deri Ceket",
    slug: "defacto-erkek-slim-fit-deri-ceket",
    price: 2499.99,
    discount_price: 1499.99,
    discount_percentage: 40,
    currency: "TRY",
    rating: 4.5,
    reviews_count: 1284,
    stock: 45,
    is_new: false,
    is_bestseller: true,
    fast_delivery: true,
    images: [
      { url: "https://placehold.co/600x800/374151/white?text=Deri+Ceket+1", alt: "Ön görünüm" },
      { url: "https://placehold.co/600x800/374151/white?text=Deri+Ceket+2", alt: "Arka görünüm" },
      { url: "https://placehold.co/600x800/374151/white?text=Deri+Ceket+3", alt: "Detay" },
    ],
    variants: [
      { id: 1, title: "S - Siyah", price: 1499.99, stock: 12, attributes: { beden: "S", renk: "Siyah" } },
      { id: 2, title: "M - Siyah", price: 1499.99, stock: 15, attributes: { beden: "M", renk: "Siyah" } },
      { id: 3, title: "L - Siyah", price: 1499.99, stock: 8, attributes: { beden: "L", renk: "Siyah" } },
      { id: 4, title: "XL - Kahverengi", price: 1599.99, stock: 10, attributes: { beden: "XL", renk: "Kahverengi" } },
    ],
    attributes: [
      { key: "materyal", label: "Materyal", value: "sunideri", display_value: "Suni Deri" },
      { key: "kumas", label: "Kumaş", value: "polyester", display_value: "%100 Polyester" },
      { key: "astar", label: "Astar", value: "polyester", display_value: "Polyester Astar" },
      { key: "kalip", label: "Kalıp", value: "slim", display_value: "Slim Fit" },
      { key: "boy", label: "Boy", value: "normal", display_value: "Normal Boy" },
    ],
    description: `
      <p>Modern ve şık tasarımıyla bu deri ceket, kış aylarının vazgeçilmezi olacak.</p>
      <ul>
        <li>Suni deri dış yüzey</li>
        <li>Polyester iç astar</li>
        <li>2 cep detayı</li>
        <li>Fermuarlı kapatma</li>
      </ul>
    `,
    brand: "Defacto",
    category: { id: 1, name: "Erkek Ceket", slug: "erkek-ceket" },
  },
  
  // Layout: Giyim için optimize edilmiş blok dizilimi
  layout: [
    { block: "gallery", position: "main", order: 1, visible: true },
    { block: "title", position: "main", order: 2, visible: true },
    { block: "rating", position: "main", order: 3, visible: true },
    { block: "badges", position: "main", order: 4, visible: true },
    { block: "social_proof", position: "under_title", order: 5, visible: true },
    { block: "price", position: "main", order: 6, visible: true },
    { block: "size_selector", position: "main", order: 7, visible: true, props: { showGuide: true } },
    { block: "color_selector", position: "main", order: 8, visible: true },
    { block: "attributes_highlight", position: "main", order: 9, visible: true },
    { block: "delivery_info", position: "main", order: 10, visible: true },
    { block: "add_to_cart", position: "main", order: 11, visible: true },
    { block: "seller_info", position: "sidebar", order: 1, visible: true },
    { block: "description", position: "bottom", order: 1, visible: true },
    { block: "attributes_detail", position: "bottom", order: 2, visible: true },
    { block: "reviews", position: "bottom", order: 3, visible: true },
    { block: "related_products", position: "bottom", order: 4, visible: true },
  ],
  
  // Badges: Giyim için uygun rozetler
  badges: [
    { key: "fast_delivery", label: "Hızlı Teslimat", icon: "truck", color: "#059669", bg_color: "#d1fae5", priority: 100 },
    { key: "advantage", label: "Avantajlı Ürün", icon: "zap", color: "#ea580c", bg_color: "#ffedd5", priority: 90 },
    { key: "best_seller", label: "Çok Satan", icon: "trophy", color: "#dc2626", bg_color: "#fee2e2", priority: 80 },
    { key: "free_shipping", label: "Ücretsiz Kargo", icon: "package", color: "#2563eb", bg_color: "#dbeafe", priority: 70 },
  ],
  
  // Highlights: Giyim özellikleri
  highlights: [
    { key: "materyal", label: "Materyal", value: "sunideri", display_value: "Suni Deri", icon: "🧥", color: "#92400e" },
    { key: "kalip", label: "Kalıp", value: "slim", display_value: "Slim Fit", icon: "📏", color: "#0369a1" },
    { key: "astar", label: "Astar", value: "polyester", display_value: "Astarlı", icon: "🧵", color: "#7c3aed" },
  ],
  
  // Social Proof: Giyim için sepet sayısı
  social_proof: {
    type: "cart_count",
    message: "3.2B kişinin sepetinde",
    position: "under_title",
    color: "#059669",
    icon: "shopping-cart",
    refresh_interval: 300,
  },
  
  // Filters: Giyim filtreleri
  filters: [
    {
      id: 1,
      category_group_id: 1,
      filter_type: "attribute",
      attribute_key: "beden",
      display_label: "Beden",
      component: "checkbox",
      order: 1,
      is_collapsed: false,
      show_count: true,
      options: [
        { value: "s", label: "S", count: 156 },
        { value: "m", label: "M", count: 234 },
        { value: "l", label: "L", count: 189 },
        { value: "xl", label: "XL", count: 98 },
      ],
      is_active: true,
    },
    {
      id: 2,
      category_group_id: 1,
      filter_type: "attribute",
      attribute_key: "renk",
      display_label: "Renk",
      component: "color",
      order: 2,
      is_collapsed: false,
      show_count: false,
      options: [
        { value: "siyah", label: "Siyah", color: "#000000" },
        { value: "kahverengi", label: "Kahverengi", color: "#8B4513" },
        { value: "bordo", label: "Bordo", color: "#800000" },
      ],
      is_active: true,
    },
    {
      id: 3,
      category_group_id: 1,
      filter_type: "price",
      display_label: "Fiyat Aralığı",
      component: "range",
      order: 3,
      is_collapsed: true,
      show_count: false,
      config: { min: 0, max: 5000, step: 100, unit: "TL" },
      is_active: true,
    },
  ],
};

// ============================================
// MOCK PDP DATA - ELEKTRONİK ÜRÜN
// ============================================

export const mockPdpDataElectronics: PdpEngineData = {
  product: {
    id: 2,
    title: "iPhone 15 Pro Max 256GB",
    slug: "iphone-15-pro-max-256gb",
    price: 84999,
    discount_price: 79999,
    discount_percentage: 5.9,
    currency: "TRY",
    rating: 4.9,
    reviews_count: 3421,
    stock: 23,
    is_new: true,
    is_bestseller: true,
    fast_delivery: true,
    images: [
      { url: "https://placehold.co/600x800/1e293b/white?text=iPhone+15+Pro", alt: "Natural Titanium" },
    ],
    variants: [
      { id: 1, title: "256GB - Natural Titanium", price: 79999, stock: 10 },
      { id: 2, title: "512GB - Natural Titanium", price: 89999, stock: 8 },
      { id: 3, title: "1TB - Blue Titanium", price: 99999, stock: 5 },
    ],
    attributes: [
      { key: "depolama", label: "Depolama", value: "256gb", display_value: "256 GB" },
      { key: "ram", label: "RAM", value: "8gb", display_value: "8 GB" },
      { key: "ekran", label: "Ekran", value: "6.7", display_value: '6.7" Super Retina XDR' },
      { key: "kamera", label: "Kamera", value: "48mp", display_value: "48 MP Ana Kamera" },
      { key: "pil", label: "Pil", value: "29saat", display_value: "29 Saat Video Oynatma" },
    ],
    description: "<p>iPhone 15 Pro Max, titanyum tasarım ve A17 Pro çip ile geliyor.</p>",
    brand: "Apple",
    category: { id: 2, name: "Cep Telefonu", slug: "cep-telefonu" },
  },
  
  // Layout: Elektronik için optimize edilmiş
  layout: [
    { block: "gallery", position: "main", order: 1, visible: true },
    { block: "title", position: "main", order: 2, visible: true },
    { block: "rating", position: "main", order: 3, visible: true },
    { block: "badges", position: "main", order: 4, visible: true },
    { block: "price", position: "main", order: 5, visible: true },
    { block: "variant_selector", position: "main", order: 6, visible: true },
    { block: "attributes_highlight", position: "main", order: 7, visible: true },
    { block: "campaigns", position: "main", order: 8, visible: true },
    { block: "delivery_info", position: "main", order: 9, visible: true },
    { block: "add_to_cart", position: "main", order: 10, visible: true },
    { block: "seller_info", position: "sidebar", order: 1, visible: true },
    { block: "description", position: "bottom", order: 1, visible: true },
    { block: "attributes_detail", position: "bottom", order: 2, visible: true },
    { block: "reviews", position: "bottom", order: 3, visible: true },
    { block: "questions", position: "bottom", order: 4, visible: true },
  ],
  
  // Badges: Elektronik için farklı etiketler
  badges: [
    { key: "new", label: "Yeni", icon: "sparkles", color: "#7c3aed", bg_color: "#ede9fe", priority: 100 },
    { key: "fast_delivery", label: "Hızlı Teslimat", icon: "truck", color: "#059669", bg_color: "#d1fae5", priority: 90 },
    { key: "campaign", label: "Kampanyalı Ürün", icon: "tag", color: "#dc2626", bg_color: "#fee2e2", priority: 80 },
  ],
  
  // Highlights: Teknik özellikler
  highlights: [
    { key: "depolama", label: "Depolama", value: "256gb", display_value: "256 GB", icon: "💾", color: "#0369a1" },
    { key: "kamera", label: "Kamera", value: "48mp", display_value: "48 MP Pro Kamera", icon: "📷", color: "#7c3aed" },
    { key: "pil", label: "Pil", value: "29saat", display_value: "Gün Boyu Pil", icon: "🔋", color: "#059669" },
  ],
  
  // Social Proof: Elektronik için görüntüleme sayısı
  social_proof: {
    type: "view_count",
    message: "Son 24 saatte 28.3B kişi görüntüledi",
    position: "under_title",
    color: "#7c3aed",
    icon: "eye",
    refresh_interval: 300,
  },
  
  // Filters: Elektronik filtreleri
  filters: [
    {
      id: 4,
      category_group_id: 2,
      filter_type: "attribute",
      attribute_key: "depolama",
      display_label: "Depolama",
      component: "select",
      order: 1,
      is_collapsed: false,
      show_count: true,
      options: [
        { value: "128gb", label: "128 GB", count: 45 },
        { value: "256gb", label: "256 GB", count: 89 },
        { value: "512gb", label: "512 GB", count: 56 },
        { value: "1tb", label: "1 TB", count: 23 },
      ],
      is_active: true,
    },
    {
      id: 5,
      category_group_id: 2,
      filter_type: "price",
      display_label: "Fiyat",
      component: "range",
      order: 2,
      is_collapsed: false,
      show_count: false,
      config: { min: 20000, max: 120000, step: 1000, unit: "TL" },
      is_active: true,
    },
    {
      id: 6,
      category_group_id: 2,
      filter_type: "rating",
      display_label: "Puan",
      component: "rating",
      order: 3,
      is_collapsed: true,
      show_count: true,
      is_active: true,
    },
  ],
};

// Helper fonksiyon
export function getMockPdpData(slug: string): PdpEngineData | null {
  if (slug.includes("iphone") || slug.includes("telefon")) {
    return mockPdpDataElectronics;
  }
  if (slug.includes("ceket") || slug.includes("giyim")) {
    return mockPdpDataClothing;
  }
  return mockPdpDataClothing; // default
}
