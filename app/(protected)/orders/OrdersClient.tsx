"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ChevronRight,
  Truck,
  Star,
  CheckCircle,
  X,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrderStatusCounts } from "@/actions/order.actions";
import { getRecommended } from "@/actions/product.actions";
import { ProductCard } from "@/components/product/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import type { Order, OrderStatus, Product } from "@/types";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  partially_shipped: "bg-purple-100 text-purple-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Beklemede",
  confirmed: "Beklemede", // confirmed should show as "Beklemede" in pending tab
  processing: "Hazırlanıyor",
  partially_shipped: "Kargoda", // Map partially_shipped to "Kargoda" for display
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
};

interface OrdersClientProps {
  initialOrders: Order[];
  initialCounts: Record<string, number>;
  initialStatus: string;
}

export function OrdersClient({
  initialOrders,
  initialCounts,
  initialStatus,
}: OrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialStatus);
  const { addItem } = useCart();
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reorderQuantities, setReorderQuantities] = useState<Record<string, number>>({});
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] = useState<Product[]>([]);
  
  // Fetch recommended products for the dialog
  const { data: recommendedProducts = [] } = useQuery({
    queryKey: ["recommended-products"],
    queryFn: () => getRecommended(8),
    enabled: showReorderDialog, // Only fetch when dialog is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ["orders", activeTab],
    queryFn: async () => {
      const result = await getOrders(activeTab);
      console.log(`Orders fetched for tab "${activeTab}":`, result.data);
      return result.data;
    },
    initialData: initialOrders,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    cacheTime: 0, // Don't cache at all
  });

  const { data: countsData, refetch: refetchCounts } = useQuery({
    queryKey: ["order-status-counts"],
    queryFn: async () => {
      const result = await getOrderStatusCounts();
      console.log("Status counts result:", result);
      return result.data || {};
    },
    initialData: initialCounts,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Refetch when tab changes
  useEffect(() => {
    refetchOrders();
    refetchCounts();
  }, [activeTab, refetchOrders, refetchCounts]);

  // Refetch on page focus (when user comes back from admin panel)
  useEffect(() => {
    const handleFocus = () => {
      refetchOrders();
      refetchCounts();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOrders, refetchCounts]);

  // Filter out cancelled orders from the list (they should only appear in "İptal Edildi" tab)
  const orders = (ordersData || []).filter(order => {
    // If we're on "all" tab, exclude cancelled orders
    // If we're on "cancelled" tab, show only cancelled orders
    if (activeTab === "all") {
      return order.status?.toLowerCase() !== "cancelled";
    }
    return true; // Show all orders for other tabs
  });
  const statusCounts = countsData || {};
  
  // Helper function to get status label safely
  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return 'Bilinmeyen';
    const normalizedStatus = status.toLowerCase().trim() as OrderStatus;
    return statusLabels[normalizedStatus] || status;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/orders?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleReorderClick = (order: Order) => {
    setSelectedOrder(order);
    // Initialize quantities with order quantities
    const initialQuantities: Record<string, number> = {};
    if (order.items) {
      order.items.forEach((item) => {
        const key = String(item.id || `${item.product_id}-${item.variant_id || ''}`);
        initialQuantities[key] = item.quantity || 1;
      });
    }
    setReorderQuantities(initialQuantities);
    setSelectedRecommendedProducts([]); // Reset selected recommended products
    setShowReorderDialog(true);
  };

  const updateQuantity = (itemId: string, change: number) => {
    setReorderQuantities((prev) => {
      const current = prev[itemId] || 1;
      const newQuantity = Math.max(1, current + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleAddRecommendedProduct = (product: Product) => {
    setSelectedRecommendedProducts((prev) => {
      // Check if product is already selected
      if (prev.find((p) => p.id === product.id)) {
        return prev; // Already selected, don't add again
      }
      return [...prev, product];
    });
    toast.success(`${product.title} eklendi`);
  };

  const handleRemoveRecommendedProduct = (productId: number) => {
    setSelectedRecommendedProducts((prev) => 
      prev.filter((p) => p.id !== productId)
    );
  };

  const handleConfirmReorder = async () => {
    if (!selectedOrder || !selectedOrder.items || selectedOrder.items.length === 0) {
      toast.error("Bu siparişte ürün bulunamadı");
      return;
    }

    try {
      let addedCount = 0;
      
      // Add all items from order to cart with updated quantities
      for (const item of selectedOrder.items) {
        if (item.product) {
          const key = String(item.id || `${item.product_id}-${item.variant_id || ''}`);
          const quantity = reorderQuantities[key] || item.quantity || 1;
          addItem(item.product, quantity, item.variant);
          addedCount += quantity;
        }
      }

      // Add selected recommended products
      if (selectedRecommendedProducts.length > 0) {
        console.log("Adding recommended products:", selectedRecommendedProducts);
        for (const product of selectedRecommendedProducts) {
          if (product && product.id) {
            addItem(product, 1);
            addedCount += 1;
          }
        }
      }
      
      console.log(`Added ${addedCount} items to cart (${selectedOrder.items.length} from order + ${selectedRecommendedProducts.length} recommended)`);
      
      toast.success(`${addedCount} ürün sepete eklendi`);
      
      // Small delay to ensure cart state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cancelledOrderId = selectedOrder?.id;
      setShowReorderDialog(false);
      setSelectedOrder(null);
      setReorderQuantities({});
      setSelectedRecommendedProducts([]);
      
      // Redirect to checkout with reordered order ID
      router.push(`/checkout?reordered_from=${cancelledOrderId}`);
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Ürünler sepete eklenirken bir hata oluştu");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide flex-nowrap bg-muted rounded-lg p-1 h-auto mb-6">
            <TabsTrigger 
              value="all" 
              className="rounded-md px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm font-medium data-[state=active]:text-foreground flex items-center gap-1"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tümü</span>
              <span className="sm:hidden">Tümü</span>
              ({statusCounts.all || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="rounded-md px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm font-medium data-[state=active]:text-foreground flex items-center gap-1"
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Beklemede</span>
              <span className="sm:hidden">Beklemede</span>
              ({statusCounts.pending || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="shipped" 
              className="rounded-md px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm font-medium data-[state=active]:text-foreground flex items-center gap-1"
            >
              <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Kargoda</span>
              <span className="sm:hidden">Kargoda</span>
              ({statusCounts.shipped || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="delivered" 
              className="rounded-md px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm font-medium data-[state=active]:text-foreground flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Teslim Edildi</span>
              <span className="sm:hidden">Teslim</span>
              ({statusCounts.delivered || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="cancelled" 
              className="rounded-md px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm font-medium data-[state=active]:text-foreground flex items-center gap-1"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">İptal Edildi</span>
              <span className="sm:hidden">İptal</span>
              ({statusCounts.cancelled || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-card p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">
                  Henüz siparişiniz bulunmamaktadır.
                </h2>
                <p className="text-muted-foreground mb-6">
                  Henüz siparişiniz bulunmuyor.
                </p>
                <Link href="/">
                  <Button>Alışverişe Başla</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  // Debug: Log order data
                  if (order.order_number) {
                    console.log(`Order ${order.order_number} (${order.status}):`, {
                      items: order.items?.map(item => ({
                        product_id: item.product?.id,
                        product_title: item.product?.title || item.product?.name,
                        product_images: item.product?.images,
                      }))
                    });
                  }
                  return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-card overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-muted/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Sipariş No
                          </p>
                          <p className="font-semibold">{order.order_number}</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs text-muted-foreground">
                            Sipariş Tarihi
                          </p>
                          <p className="text-sm">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusColors[order.status as OrderStatus] || statusColors.pending}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <Link href={`/product/${item.product.slug || item.product.id}`}>
                              <Image
                                src={
                                  item.product.images?.[0]?.url
                                    ? resolveMediaUrl(item.product.images[0].url)
                                    : item.product.images?.[0]
                                    ? resolveMediaUrl(item.product.images[0])
                                    : "https://placehold.co/80x80"
                                }
                                alt={item.product.title || item.product.name || "Ürün"}
                                width={80}
                                height={80}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/product/${item.product.slug || item.product.id}`}
                                className="hover:text-primary"
                              >
                                <h3 className="font-medium line-clamp-1">
                                  {item.product.title || item.product.name || "Ürün"}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {typeof item.product.brand === "string"
                                  ? item.product.brand
                                  : (item.product.brand as { name?: string })?.name || "Marka Yok"}{" "}
                                • x{item.quantity}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                {formatPrice(
                                  item.total ||
                                    (item.price || 0) * (item.quantity || 0)
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.items.length - 2} ürün daha
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Toplam
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(
                            order.total ||
                              order.total_price ||
                              0
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {/* Tracking button - Show for shipped, partially_shipped, and delivered */}
                        {["shipped", "partially_shipped", "delivered"].includes(
                          order.status
                        ) && (
                          <Link href={`/order/${order.order_number || order.id}/tracking`}>
                            <Button 
                              variant={order.status === "delivered" ? "outline" : "default"} 
                              size="sm" 
                              className="gap-1"
                            >
                              <Truck className="h-4 w-4" />
                              {order.status === "delivered" ? "Sipariş Takibi" : "Takip Et"}
                            </Button>
                          </Link>
                        )}
                        {/* Review button - Show for delivered orders */}
                        {order.status === "delivered" && (
                          <Link href={`/order/${order.order_number || order.id}/review`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Star className="h-4 w-4" />
                              Değerlendir
                            </Button>
                          </Link>
                        )}
                        {/* Reorder button - Show for cancelled orders */}
                        {order.status === "cancelled" && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleReorderClick(order)}
                          >
                            <RefreshCw className="h-4 w-4" />
                            Yeniden Sipariş Ver
                          </Button>
                        )}
                        <Link href={`/order/${order.order_number || order.id}`}>
                          <Button variant="outline" size="sm">
                            Detaylar
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reorder Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeniden Sipariş Ver</DialogTitle>
            <DialogDescription>
              Aşağıdaki ürünler sepete eklenecek ve ödeme sayfasına yönlendirileceksiniz.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && selectedOrder.items && (
            <div className="space-y-4 py-4">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                >
                        {item.product?.images?.[0] && (
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={resolveMediaUrl(item.product.images[0]?.url || item.product.images[0])}
                              alt={item.product.title || "Ürün"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {item.product?.title || "Ürün adı bulunamadı"}
                    </h4>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.variant.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Miktar:</span>
                        <div className="flex items-center gap-1 border border-gray-300 rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              const key = String(item.id || `${item.product_id}-${item.variant_id || ''}`);
                              updateQuantity(key, -1);
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {reorderQuantities[String(item.id || `${item.product_id}-${item.variant_id || ''}`)] || item.quantity || 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              const key = String(item.id || `${item.product_id}-${item.variant_id || ''}`);
                              updateQuantity(key, 1);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatPrice(
                          (item.price || 0) * (reorderQuantities[String(item.id || `${item.product_id}-${item.variant_id || ''}`)] || item.quantity || 1)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Recommended Products */}
          {selectedRecommendedProducts.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-3">Seçilen Ekstra Ürünler</h3>
              <div className="space-y-2">
                {selectedRecommendedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 border border-primary/30 bg-primary/5 rounded-lg items-center"
                  >
                    {product.images?.[0] && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={resolveMediaUrl(product.images[0]?.url || product.images[0])}
                          alt={product.title || "Ürün"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {product.title}
                      </h4>
                      <span className="text-xs font-bold text-primary">
                        {formatPrice(product.price || 0)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveRecommendedProduct(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products Section */}
          {recommendedProducts.length > 0 && (
            <div className={`pt-4 mt-4 ${selectedRecommendedProducts.length > 0 ? 'border-t' : ''}`}>
              <h3 className="text-sm font-semibold mb-3">İlginizi Çekebilir</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                {recommendedProducts
                  .filter(p => !selectedRecommendedProducts.find(sp => sp.id === p.id))
                  .slice(0, 4)
                  .map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-2 hover:border-primary transition-colors cursor-pointer group"
                    onClick={() => handleAddRecommendedProduct(product)}
                  >
                    {product.images?.[0] && (
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                        <Image
                          src={resolveMediaUrl(product.images[0]?.url || product.images[0])}
                          alt={product.title || "Ürün"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <h4 className="text-xs font-medium line-clamp-2 mb-1">
                      {product.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(product.price || 0)}
                      </span>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReorderDialog(false);
                setSelectedOrder(null);
              }}
            >
              İptal
            </Button>
            <Button onClick={handleConfirmReorder}>
              Sipariş Ver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


