"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  Navigation,
  CreditCard,
  ChevronLeft,
  ExternalLink,
  Star,
  RotateCcw,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  X,
  Copy,
  PackageCheck,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useReturns } from "@/contexts/ReturnsContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getRecommended } from "@/actions/product.actions";
import { resolveMediaUrl } from "@/lib/media";
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
  confirmed: "Onaylandı",
  processing: "Hazırlanıyor",
  partially_shipped: "Kargoda", // Map partially_shipped to "Kargoda" for display
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
};

const timelineSteps = [
  { key: "pending", label: "Sipariş Alındı", icon: Package },
  { key: "confirmed", label: "Onaylandı", icon: CheckCircle },
  { key: "processing", label: "Hazırlanıyor", icon: PackageCheck },
  { key: "shipped", label: "Kargoya Verildi", icon: Truck },
  { key: "delivered", label: "Teslim Edildi", icon: CheckCircle },
];

// Helper function to get status label safely
const getStatusLabel = (status: string | undefined): string => {
  if (!status) return "Bilinmeyen";
  const normalizedStatus = status.toLowerCase().trim() as OrderStatus;
  return statusLabels[normalizedStatus] || status;
};

interface OrderDetailClientProps {
  order: Order;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const { hasActiveReturn, getByOrderItemId } = useReturns();
  const { addItem } = useCart();
  const router = useRouter();
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [question, setQuestion] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCargoDialog, setShowCargoDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [reorderQuantities, setReorderQuantities] = useState<
    Record<string, number>
  >({});
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] =
    useState<Product[]>([]);

  // Fetch recommended products for the dialog
  const { data: recommendedProducts = [] } = useQuery({
    queryKey: ["recommended-products"],
    queryFn: () => getRecommended(8),
    enabled: showReorderDialog, // Only fetch when dialog is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const questionSuggestions = [
    "Siparişim ne zaman kargoya verilecek?",
    "Kargo takip numarası nedir?",
    "Siparişimi iptal edebilir miyim?",
    "Ürünü değiştirebilir miyim?",
    "İade süreci nasıl işliyor?",
    "Fatura bilgilerimi nasıl güncelleyebilirim?",
    "Ödeme yöntemimi değiştirebilir miyim?",
    "Siparişimde bir sorun var, ne yapmalıyım?",
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimelineStatus = (order: Order) => {
    const statusOrder = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const currentStep = getTimelineStatus(order);

  const handleQuestionSelect = (suggestion: string) => {
    setSelectedQuestion(suggestion);
    setQuestion(suggestion);
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      toast.error("Lütfen bir soru yazın");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: API call to submit question
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSubmitted(true);
      toast.success("Soru gönderildi! En kısa sürede cevaplanacak.");
      setTimeout(() => {
        setShowQuestionDialog(false);
        setQuestion("");
        setSelectedQuestion(null);
        setSubmitted(false);
      }, 2000);
    } catch {
      toast.error("Soru gönderilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorderClick = () => {
    // Initialize quantities with order quantities
    const initialQuantities: Record<string, number> = {};
    if (order.items) {
      order.items.forEach((item) => {
        const key = item.id || `${item.product_id}-${item.variant_id || ""}`;
        initialQuantities[key] = item.quantity || 1;
      });
    }
    setReorderQuantities(initialQuantities);
    setSelectedRecommendedProducts([]); // Reset selected recommended products
    setShowReorderDialog(true);
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

  const updateQuantity = (itemId: string, change: number) => {
    setReorderQuantities((prev) => {
      const current = prev[itemId] || 1;
      const newQuantity = Math.max(1, current + change);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleConfirmReorder = async () => {
    if (!order.items || order.items.length === 0) {
      toast.error("Bu siparişte ürün bulunamadı");
      return;
    }

    try {
      let addedCount = 0;

      // Add all items from order to cart with updated quantities
      for (const item of order.items) {
        if (item.product) {
          const key = String(
            item.id || `${item.product_id}-${item.variant_id || ""}`
          );
          const quantity = reorderQuantities[key] || item.quantity || 1;
          addItem(item.product, quantity, item.variant);
          addedCount += quantity;
        }
      }

      // Add selected recommended products
      if (selectedRecommendedProducts.length > 0) {
        console.log(
          "Adding recommended products:",
          selectedRecommendedProducts
        );
        for (const product of selectedRecommendedProducts) {
          if (product && product.id) {
            addItem(product, 1);
            addedCount += 1;
          }
        }
      }

      console.log(
        `Added ${addedCount} items to cart (${order.items.length} from order + ${selectedRecommendedProducts.length} recommended)`
      );

      toast.success(`${addedCount} ürün sepete eklendi`);

      // Small delay to ensure cart state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      const cancelledOrderId = order?.id;
      setShowReorderDialog(false);
      setReorderQuantities({});
      setSelectedRecommendedProducts([]);

      // Redirect to checkout with reordered order ID
      router.push(`/checkout?reordered_from=${cancelledOrderId}`);
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Ürünler sepete eklenirken bir hata oluştu");
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Lütfen iptal sebebini belirtin");
      return;
    }

    setIsCancelling(true);
    try {
      const { cancelOrder } = await import("@/actions/order.actions");
      // Use order_number if available, otherwise use id
      const orderIdentifier = order.order_number || String(order.id);
      const result = await cancelOrder(orderIdentifier);

      if (result.success) {
        toast.success("Siparişiniz iptal edildi");
        setShowCancelDialog(false);
        setCancelReason("");
        // Refresh page to show updated status
        window.location.reload();
      } else {
        toast.error(result.error || "Sipariş iptal edilemedi");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Sipariş iptal edilirken bir hata oluştu");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Sipariş Detayı</h1>
            <p className="text-muted-foreground">{order.order_number}</p>
          </div>
          <Badge
            className={cn(
              "ml-auto",
              statusColors[order.status as OrderStatus] || statusColors.pending
            )}
          >
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Info */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Sipariş Durumu</h2>
                <Badge
                  className={cn(
                    statusColors[order.status as OrderStatus] ||
                      statusColors.pending
                  )}
                >
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Siparişiniz şu anda{" "}
                <span className="font-semibold text-foreground">
                  {getStatusLabel(order.status)}
                </span>{" "}
                durumunda.
              </p>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="font-semibold mb-6">Sipariş Takibi</h2>
              <div className="flex justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${
                        (currentStep / (timelineSteps.length - 1)) * 100
                      }%`,
                    }}
                  />
                </div>
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-2 text-center max-w-[80px]",
                          isCurrent
                            ? "font-semibold text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold">
                  Sipariş Ürünleri ({order.items.length})
                </h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => {
                  const activeReturn = hasActiveReturn(item.id);
                  const returnRequest = getByOrderItemId(item.id);
                  const canReturn =
                    item.status === "delivered" && !activeReturn;

                  return (
                    <div key={item.id} className="p-4 flex gap-4">
                      <Link href={`/product/${item.product.slug}`}>
                        <Image
                          src={item.product.images?.[0]?.url || ""}
                          alt={
                            item.product.name || item.product.title || "Ürün"
                          }
                          width={96}
                          height={96}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="hover:text-primary"
                        >
                          <h3 className="font-medium">
                            {item.product.name || item.product.title || "Ürün"}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {typeof item.product.brand === "string"
                            ? item.product.brand
                            : (item.product.brand as { name?: string })?.name ||
                              "Marka Yok"}{" "}
                          • Adet: {item.quantity}
                        </p>
                        <Link
                          href={`/store/${item.vendor.slug}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Satıcı: {item.vendor.name}
                        </Link>
                        {item.tracking_number && (
                          <Link
                            href={`/order/${order.id}/tracking`}
                            className="inline-block mt-2"
                          >
                            <Badge
                              variant="outline"
                              className="text-xs hover:bg-primary/10 cursor-pointer"
                            >
                              <Truck className="h-3 w-3 mr-1" />
                              {item.tracking_number}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Badge>
                          </Link>
                        )}

                        {/* Return Status or Button */}
                        {activeReturn && returnRequest && (
                          <Link
                            href="/account/returns"
                            className="inline-block mt-2"
                          >
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              İade Talebi:{" "}
                              {returnRequest.status === "pending"
                                ? "İnceleniyor"
                                : returnRequest.status === "approved"
                                ? "Onaylandı"
                                : returnRequest.status === "shipped"
                                ? "Kargoda"
                                : "Devam Ediyor"}
                            </Badge>
                          </Link>
                        )}

                        {canReturn && (
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/order/${order.id}/return/${item.id}`}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                İade Talebi
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/order/${order.id}/review/${item.id}`}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Değerlendir
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatPrice(
                            item.total ||
                              (item.price || 0) * (item.quantity || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="font-semibold mb-4">Sipariş Özeti</h2>
              <div className="space-y-3 text-sm">
                {/* Vendor Information */}
                {order.items && order.items.length > 0 && (
                  <div className="pb-3 border-b">
                    <span className="text-muted-foreground text-xs mb-2 block">
                      Satıcı{order.items.length > 1 ? "lar" : ""}
                    </span>
                    <div className="space-y-2">
                      {Array.from(
                        new Map(
                          order.items
                            .filter((item) => item.vendor)
                            .map((item) => [item.vendor.id, item.vendor])
                        ).values()
                      ).map((vendor) => (
                        <div
                          key={vendor.id}
                          className="flex items-center gap-2"
                        >
                          {vendor.logo && (
                            <Image
                              src={vendor.logo}
                              alt={vendor.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <Link
                            href={`/store/${vendor.slug}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {vendor.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ürün Toplamı</span>
                  <span>{formatPrice(order.subtotal || order.total || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kargo</span>
                  <span
                    className={order.shipping_total === 0 ? "text-success" : ""}
                  >
                    {(order.shipping_total || 0) === 0
                      ? "Ücretsiz"
                      : formatPrice(order.shipping_total || 0)}
                  </span>
                </div>
                {(order.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-success">
                    <span>İndirim</span>
                    <span>-{formatPrice(order.discount_total || 0)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam</span>
                    <span className="text-primary">
                      {formatPrice(order.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-white rounded-lg shadow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Teslimat Adresi</h2>
                </div>
                <div className="text-sm">
                  <p className="font-medium">
                    {order.shipping_address.title || "Adres"}
                  </p>
                  {order.shipping_address.full_name && (
                    <p className="text-muted-foreground mt-1">
                      {order.shipping_address.full_name}
                    </p>
                  )}
                  {order.shipping_address.phone && (
                    <p className="text-muted-foreground">
                      {order.shipping_address.phone}
                    </p>
                  )}
                  <p className="mt-2">
                    {order.shipping_address.address_line}
                    {order.shipping_address.neighborhood &&
                      `, ${order.shipping_address.neighborhood}`}
                    {order.shipping_address.district &&
                      `, ${order.shipping_address.district}`}
                    {order.shipping_address.city &&
                      `/${order.shipping_address.city}`}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Ödeme Bilgileri</h2>
              </div>
              <p className="text-sm">
                {order.payment_method === "credit_card"
                  ? "Kredi/Banka Kartı"
                  : "Kapıda Ödeme"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(order.created_at)}
              </p>
            </div>

            {/* Shipping Info */}
            {order.items?.some((item) => item.tracking_number) && (
              <div className="bg-white rounded-lg shadow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Kargo Bilgileri</h2>
                </div>
                <div className="space-y-3">
                  {order.items
                    .filter((item) => item.tracking_number)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">
                            {item.product.name}
                          </p>
                          {item.tracking_url && (
                            <a
                              href={item.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Takip Et
                            </a>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium">Takip No:</span>{" "}
                            {item.tracking_number}
                          </p>
                          {item.carrier && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">
                                Kargo Firması:
                              </span>{" "}
                              {item.carrier}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 ">
              {["shipped", "partially_shipped", "processing"].includes(
                order.status
              ) && (
                <Link href={`/order/${order.id}/tracking`}>
                  <Button className="w-full gap-2 ">
                    <Navigation className="h-4 w-4" />
                    Sipariş Takibi
                  </Button>
                </Link>
              )}
              {order.status === "delivered" && (
                <Link href={`/order/${order.id}/review`}>
                  <Button className="w-full gap-2">
                    <Star className="h-4 w-4" />
                    Ürünü Değerlendir
                  </Button>
                </Link>
              )}
              {["pending", "confirmed", "processing"].includes(
                order.status
              ) && (
                <Button
                  variant="outline"
                  className="w-full mt-2 hover:none hover:bg-transparent hover:text-[#000]"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Siparişi İptal Et
                </Button>
              )}
              {order.status === "delivered" && (
                <Button variant="outline" className="w-full">
                  İade Talebi Oluştur
                </Button>
              )}
              {order.status === "cancelled" && (
                <Button className="w-full gap-2" onClick={handleReorderClick}>
                  <RefreshCw className="h-4 w-4" />
                  Yeniden Sipariş Ver
                </Button>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="font-semibold mb-4">Yardım Mı Lazım?</h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCargoDialog(true)}
                  className="w-full justify-start gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Kargo ile İletişim
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowQuestionDialog(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Soru Sor
                </Button>
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Müşteri Hizmetleri: 0850 XXX XX XX
                  </p>
                </div>
              </div>
            </div>

            {/* Question Dialog */}
            <Dialog
              open={showQuestionDialog}
              onOpenChange={setShowQuestionDialog}
            >
              <DialogContent className="sm:max-w-2xl rounded-lg max-h-[90vh] flex flex-col p-0 sm:p-6">
                <div className="overflow-y-auto flex-1 px-4 sm:px-0">
                  <DialogHeader className="pt-6 sm:pt-0">
                    <DialogTitle>Soru Sor</DialogTitle>
                    <DialogDescription>
                      Siparişiniz hakkında sorularınızı buradan iletebilirsiniz.
                    </DialogDescription>
                  </DialogHeader>

                  {!submitted ? (
                    <>
                      {/* Question Suggestions */}
                      <div className="space-y-4 mt-4">
                        <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                          <div className="flex gap-2 min-w-max pb-2 sm:flex-wrap sm:min-w-0">
                            {questionSuggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant={
                                  selectedQuestion === suggestion
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="whitespace-nowrap rounded-full text-xs sm:text-sm flex-shrink-0"
                                onClick={() => handleQuestionSelect(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Question Textarea */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Sorunuzu yazın
                          </label>
                          <Textarea
                            placeholder="Sorunuzu buraya yazın..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="min-h-[120px] resize-none"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Sorunuz Gönderildi
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Sorunuz en kısa sürede cevaplanacaktır. Cevabınızı
                          e-posta adresinize göndereceğiz.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setShowQuestionDialog(false);
                          setQuestion("");
                          setSelectedQuestion(null);
                          setSubmitted(false);
                        }}
                        className="mt-4"
                      >
                        Tamam
                      </Button>
                    </div>
                  )}
                </div>

                {!submitted && (
                  <DialogFooter className="border-t pt-4 mt-4 px-4 sm:px-0 pb-4 sm:pb-0 flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowQuestionDialog(false);
                        setQuestion("");
                        setSelectedQuestion(null);
                      }}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleSubmitQuestion}
                      disabled={!question.trim() || isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Gönder
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>

            {/* Cargo Info Dialog */}
            <Dialog open={showCargoDialog} onOpenChange={setShowCargoDialog}>
              <DialogContent className="sm:max-w-lg rounded-lg">
                <DialogHeader>
                  <DialogTitle>Kargo Bilgileri</DialogTitle>
                  <DialogDescription>
                    Siparişinizin kargo takip bilgileri
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Tracking Numbers */}
                  {order.items?.some((item) => item.tracking_number) ? (
                    <div className="space-y-3">
                      {order.items
                        .filter((item) => item.tracking_number)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  {item.product?.title || "Ürün"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold">
                                    {item.tracking_number}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        item.tracking_number || ""
                                      );
                                      toast.success(
                                        "Takip numarası kopyalandı"
                                      );
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                {item.carrier && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Kargo: {item.carrier}
                                  </p>
                                )}
                              </div>
                            </div>

                            {item.tracking_url && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    window.open(item.tracking_url, "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Kargo Sitesinde Takip Et
                                </Button>
                                <Link
                                  href={`/order/${
                                    order.order_number || order.id
                                  }/tracking`}
                                >
                                  <Button variant="default" size="sm">
                                    <Truck className="h-3 w-3 mr-2" />
                                    Sitede Takip Et
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Henüz kargo takip numarası oluşturulmamış.
                      </p>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            Kargo Müşteri Hizmetleri
                          </p>
                          <p className="text-xs text-muted-foreground">
                            0850 333 33 33
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open("tel:08503333333", "_self");
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Ara
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCargoDialog(false)}
                  >
                    Kapat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Cancel Order Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogContent className="sm:max-w-md rounded-lg">
                <DialogHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <DialogTitle className="text-center text-xl">
                    Siparişi İptal Et
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Siparişinizi iptal etmek istediğinizden emin misiniz?
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium mb-2">
                      Sipariş Bilgileri
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        Sipariş No:{" "}
                        <span className="font-medium text-foreground">
                          {order.order_number}
                        </span>
                      </p>
                      <p>
                        Toplam:{" "}
                        <span className="font-medium text-foreground">
                          {formatPrice(order.total || 0)}
                        </span>
                      </p>
                      <p>
                        Ürün Sayısı:{" "}
                        <span className="font-medium text-foreground">
                          {order.items?.length || 0}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      İptal Sebebi <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Lütfen siparişi iptal etme sebebinizi yazın..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="min-h-[100px] resize-none"
                      disabled={isCancelling}
                    />
                    <p className="text-xs text-muted-foreground">
                      İptal sebebiniz bizim için önemlidir ve hizmet kalitemizi
                      artırmamıza yardımcı olur.
                    </p>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">
                        İptal işlemi geri alınamaz. Siparişiniz iptal edildikten
                        sonra ödemeniz iade edilecektir.
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCancelDialog(false);
                      setCancelReason("");
                    }}
                    disabled={isCancelling}
                    className="w-full sm:w-auto"
                  >
                    Vazgeç
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={!cancelReason.trim() || isCancelling}
                    className="w-full sm:w-auto"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        İptal Ediliyor...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Siparişi İptal Et
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reorder Dialog */}
            <Dialog
              open={showReorderDialog}
              onOpenChange={setShowReorderDialog}
            >
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeniden Sipariş Ver</DialogTitle>
                  <DialogDescription>
                    Aşağıdaki ürünler sepete eklenecek ve ödeme sayfasına
                    yönlendirileceksiniz.
                  </DialogDescription>
                </DialogHeader>

                {order.items && order.items.length > 0 && (
                  <div className="space-y-4 py-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        {item.product?.images?.[0] && (
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.product.images[0]?.url || ""}
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
                              <span className="text-xs text-muted-foreground">
                                Miktar:
                              </span>
                              <div className="flex items-center gap-1 border border-gray-300 rounded-md">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    const key = String(
                                      item.id ||
                                        `${item.product_id}-${
                                          item.variant_id || ""
                                        }`
                                    );
                                    updateQuantity(key, -1);
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium text-center">
                                  {reorderQuantities[
                                    String(
                                      item.id ||
                                        `${item.product_id}-${
                                          item.variant_id || ""
                                        }`
                                    )
                                  ] ||
                                    item.quantity ||
                                    1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    const key = String(
                                      item.id ||
                                        `${item.product_id}-${
                                          item.variant_id || ""
                                        }`
                                    );
                                    updateQuantity(key, 1);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <span className="font-semibold text-primary">
                              {formatPrice(
                                (item.price || 0) *
                                  (reorderQuantities[
                                    String(
                                      item.id ||
                                        `${item.product_id}-${
                                          item.variant_id || ""
                                        }`
                                    )
                                  ] ||
                                    item.quantity ||
                                    1)
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
                    <h3 className="text-sm font-semibold mb-3">
                      Seçilen Ekstra Ürünler
                    </h3>
                    <div className="space-y-2">
                      {selectedRecommendedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-3 p-3 border border-primary/30 bg-primary/5 rounded-lg items-center"
                        >
                          {product.images?.[0] && (
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={resolveMediaUrl(
                                  product.images[0]?.url || product.images[0]
                                )}
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
                            onClick={() =>
                              handleRemoveRecommendedProduct(product.id)
                            }
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
                  <div
                    className={`pt-4 mt-4 ${
                      selectedRecommendedProducts.length > 0 ? "border-t" : ""
                    }`}
                  >
                    <h3 className="text-sm font-semibold mb-3">
                      İlginizi Çekebilir
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                      {recommendedProducts
                        .filter(
                          (p) =>
                            !selectedRecommendedProducts.find(
                              (sp) => sp.id === p.id
                            )
                        )
                        .slice(0, 4)
                        .map((product: Product) => (
                          <div
                            key={product.id}
                            className="border border-gray-200 rounded-lg p-2 hover:border-primary transition-colors cursor-pointer group"
                            onClick={() => handleAddRecommendedProduct(product)}
                          >
                            {product.images?.[0] && (
                              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                                <Image
                                  src={resolveMediaUrl(
                                    product.images[0]?.url || product.images[0]
                                  )}
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
                      setReorderQuantities({});
                      setSelectedRecommendedProducts([]);
                    }}
                  >
                    İptal
                  </Button>
                  <Button onClick={handleConfirmReorder}>Sipariş Ver</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
