"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  CreditCard,
  Truck,
  ChevronRight,
  Plus,
  Loader2,
  ShoppingBag,
  Info,
  Clock,
  Package,
  Calendar,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { createOrder } from "@/actions/order.actions";
import { resolveMediaUrl } from "@/lib/media";
import type { Address } from "@/types";

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const reorderedFromOrderId = searchParams.get('reordered_from');
  const {
    items,
    isLoading: cartLoading,
    getSubtotal,
    getShippingTotal,
    getDiscountTotal,
    getTotal,
    getItemsByVendor,
    clearCart,
  } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState("address"); // "address" or "pickup"
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installment, setInstallment] = useState("single");
  const [use3DSecure, setUse3DSecure] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false); // Prevent redirect to cart after successful order

  // Redirect if cart is empty (only after cart is loaded)
  // Don't redirect on initial mount if cart is still loading
  // Also don't redirect if order was just completed
  useEffect(() => {
    // Don't redirect if order was just completed or if we're processing an order
    if (orderCompleted || isProcessing || orderSubmitted) {
      return;
    }
    
    // Only redirect if cart has finished loading and is empty
    // This prevents redirect on refresh before localStorage loads
    if (!cartLoading && items.length === 0) {
      // Small delay to ensure localStorage has loaded
      const timer = setTimeout(() => {
        if (items.length === 0 && !orderCompleted && !isProcessing && !orderSubmitted) {
          toast.error("Sepetiniz boş!");
          router.push("/cart");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartLoading, items.length, router, orderCompleted, isProcessing, orderSubmitted]);

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const data = await api.get<{ data: Address[] }>("/addresses");
        const addressesData = data.data || [];
        setAddresses(addressesData);
        if (addressesData.length > 0) {
          const defaultAddress =
            addressesData.find((a) => a.is_default) || addressesData[0];
          setSelectedAddress(defaultAddress.id.toString());
        }
      } catch (error) {
        console.error("Error loading addresses:", error);
        toast.error("Adresler yüklenirken bir hata oluştu");
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const validateCardInfo = () => {
    if (paymentMethod === "credit_card") {
      // Remove spaces from card number for validation
      const cleanCardNumber = cardNumber.replace(/\s/g, "");

      if (!cleanCardNumber || cleanCardNumber.length < 16) {
        toast.error("Lütfen geçerli bir kart numarası girin");
        return false;
      }

      if (!cardMonth || !cardYear) {
        toast.error("Lütfen son kullanma tarihini seçin");
        return false;
      }

      if (!cardCvv || cardCvv.length < 3) {
        toast.error("Lütfen CVV kodunu girin");
        return false;
      }

      // Validate expiry date
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const selectedYear = parseInt(cardYear);
      const selectedMonth = parseInt(cardMonth);

      if (
        selectedYear < currentYear ||
        (selectedYear === currentYear && selectedMonth < currentMonth)
      ) {
        toast.error("Kartın son kullanma tarihi geçmiş olamaz");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    // Prevent duplicate submissions - multiple checks
    if (isProcessing || orderSubmitted) {
      toast.warning("Sipariş işleniyor, lütfen bekleyin...");
      return;
    }

    // Wait for cart to load if still loading
    if (cartLoading) {
      toast.info("Sepet yükleniyor, lütfen bekleyin...");
      return;
    }

    // Validation
    if (!selectedAddress) {
      toast.error("Lütfen bir teslimat adresi seçin");
      return;
    }

    if (items.length === 0) {
      toast.error("Sepetiniz boş! Lütfen sepete ürün ekleyin.");
      router.push("/cart");
      return;
    }

    if (!validateCardInfo()) {
      return;
    }

    // Set processing and submitted flags immediately to prevent duplicate calls
    setIsProcessing(true);
    setOrderSubmitted(true);

    try {
      // Skip cart sync - send items directly in order creation
      // Backend will resolve vendor_id from product data
      console.log(
        "Skipping cart sync, sending items directly in order creation"
      );

      // Prepare order items - backend will resolve vendor_id from product
      // Try different formats that backend might expect
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id || null, // Some backends expect null instead of undefined
        quantity: item.quantity,
        price: item.price,
        // Don't send vendor_id - backend will get it from product
      }));

      // Prepare order data - try multiple field names and formats
      const orderData = {
        address_id: Number(selectedAddress),
        payment_method: paymentMethod,
        // Try all possible field names
        items: orderItems,
        order_items: orderItems,
        products: orderItems, // Some backends use 'products'
        cart_items: orderItems, // Some backends use 'cart_items'
        // Flags to tell backend to use items instead of cart
        use_cart: false,
        use_items: true,
        skip_cart_check: true,
        // Include reordered_from_order_id if this is a reorder
        reordered_from_order_id: reorderedFromOrderId ? Number(reorderedFromOrderId) : undefined,
        payment_details:
          paymentMethod === "credit_card"
            ? {
                card_number: cardNumber.replace(/\s/g, "").slice(-4), // Only last 4 digits
                card_month: cardMonth,
                card_year: cardYear,
                installment: installment,
                use_3d_secure: use3DSecure,
              }
            : undefined,
        notes: sameBillingAddress
          ? "Fatura adresi teslimat adresi ile aynı"
          : undefined,
      } as Parameters<typeof createOrder>[0] & {
        order_items?: typeof orderItems;
        products?: typeof orderItems;
        cart_items?: typeof orderItems;
        use_cart?: boolean;
        use_items?: boolean;
        skip_cart_check?: boolean;
        reordered_from_order_id?: number;
      };

      console.log("Order data being sent:", JSON.stringify(orderData, null, 2));
      console.log("Cart items count:", items.length);
      console.log("Order items:", orderItems);

      // Create order using server action
      const result = await createOrder(orderData);

      console.log("Order creation result:", JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        // Handle different response structures
        const orderDataResponse = result.data.data || result.data;
        const orderId = orderDataResponse.id || orderDataResponse.order_id || orderDataResponse.order?.id;
        const orderNumber = orderDataResponse.order_number || orderDataResponse.order?.order_number || orderId;

        console.log(
          "Order created successfully. ID:",
          orderId,
          "Number:",
          orderNumber,
          "Full response:",
          orderDataResponse
        );

        if (!orderId) {
          console.error("No order ID in response:", result);
          toast.error("Sipariş oluşturuldu ancak sipariş ID alınamadı. Lütfen siparişlerinizi kontrol edin.");
          // Don't clear cart if we can't verify order was created
          setIsProcessing(false);
          // Mark as completed to prevent redirect to cart
          setOrderCompleted(true);
          // Still redirect to orders page so user can check
          setTimeout(() => {
            router.push("/orders");
          }, 2000);
          return;
        }

        // Mark order as completed before clearing cart to prevent redirect to /cart
        setOrderCompleted(true);
        
        // Clear cart only after successful order creation and ID verification
        clearCart();
        console.log("Cart cleared after successful order creation");

        // Set order number and show success modal
        setOrderNumber(orderNumber || `#${orderId}`);
        setShowSuccessModal(true);
        setIsProcessing(false);

        // Auto-close modal and redirect to orders page after 2 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push("/orders");
          router.refresh(); // Force refresh to get latest data
        }, 2000);
      } else {
        console.error("Order creation failed:", result);
        const errorMessage = result.error || "Sipariş oluşturulurken bir hata oluştu";
        toast.error(errorMessage);
        setIsProcessing(false);
        setOrderSubmitted(false); // Allow retry on error
        // Don't clear cart on error
        // Don't redirect - let user stay on checkout page to retry
      }
    } catch (error) {
      console.error("Order creation exception:", error);
      const apiError = error as ApiError;
      toast.error(
        apiError.message ||
          apiError.errors?.address_id?.[0] ||
          "Sipariş oluşturulurken bir hata oluştu"
      );
      setIsProcessing(false);
      setOrderSubmitted(false); // Allow retry on error
    }
  };

  if (cartLoading || loadingAddresses) {
    return (
      <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Sepetiniz Boş</h1>
            <p className="text-muted-foreground mb-6">
              Ödeme işlemine devam etmek için sepetinizde ürün bulunmalıdır.
            </p>
            <Link href="/cart">
              <Button size="lg">Sepete Git</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const itemsByVendor = getItemsByVendor();
  const subtotal = getSubtotal();
  const shippingTotal = getShippingTotal();
  const discountTotal = getDiscountTotal();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Sipariş Özeti</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Teslimat Adresi</h3>
              </div>

              {/* Delivery Type Selection */}
              <RadioGroup
                value={deliveryType}
                onValueChange={setDeliveryType}
                className="mb-6"
              >
                <div className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                  <RadioGroupItem value="address" id="delivery-address" />
                  <MapPin className="h-5 w-5 text-primary" />
                  <Label
                    htmlFor="delivery-address"
                    className="cursor-pointer font-semibold"
                  >
                    Adrese Teslim Edilsin
                  </Label>
                </div>
              </RadioGroup>

              {deliveryType === "address" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold">
                      Teslimat Adresi
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      asChild
                    >
                      <Link href="/account/addresses">
                        <Plus className="h-3 w-3 mr-1" />
                        Adres Ekle / Değiştir
                      </Link>
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-muted-foreground mb-4">
                        Kayıtlı adresiniz bulunmuyor
                      </p>
                      <Button variant="outline" asChild>
                        <Link href="/account/addresses">
                          <Plus className="h-4 w-4 mr-2" />
                          Yeni Adres Ekle
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      {selectedAddress && (
                        <div className="border-2 border-gray-300 rounded-lg p-4 mb-4 flex items-center justify-between hover:border-primary transition-colors cursor-pointer">
                          <div className="flex-1">
                            <p className="font-semibold text-base mb-1">
                              {addresses.find(
                                (a) => a.id.toString() === selectedAddress
                              )?.title || "Adres"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {(() => {
                                const addr = addresses.find(
                                  (a) => a.id.toString() === selectedAddress
                                );
                                if (!addr) return "";
                                return `${addr.neighborhood || ""} ${
                                  addr.district || ""
                                } / ${addr.city || ""}`.trim();
                              })()}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {
                                addresses.find(
                                  (a) => a.id.toString() === selectedAddress
                                )?.address_line
                              }
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <Checkbox
                          id="same-billing"
                          checked={sameBillingAddress}
                          onCheckedChange={(checked) =>
                            setSameBillingAddress(checked === true)
                          }
                        />
                        <Label
                          htmlFor="same-billing"
                          className="text-sm cursor-pointer"
                        >
                          Faturamı Aynı Adrese Gönder
                        </Label>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Shipping Info per Vendor */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-lg font-semibold">Teslimat Bilgileri</h2>
              </div>

              <div className="space-y-6">
                {Object.entries(itemsByVendor).map(
                  ([vendorId, vendorItems]) => {
                    const vendor = vendorItems[0]?.product.vendor;
                    const hasFreeShipping = vendorItems.some(
                      (item) => item.shipping_type === "free"
                    );
                    const shippingCost = hasFreeShipping
                      ? 0
                      : vendorItems[0]?.shipping_cost || 29.99;

                    // Calculate estimated delivery date
                    const today = new Date();
                    const deliveryDate = new Date(today);
                    deliveryDate.setDate(today.getDate() + 3); // 3 business days
                    const formattedDate = deliveryDate.toLocaleDateString(
                      "tr-TR",
                      {
                        day: "numeric",
                        month: "long",
                        weekday: "long",
                      }
                    );

                    return (
                      <div
                        key={vendorId}
                        className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary/50 transition-colors"
                      >
                        {/* Vendor Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-base">
                                {vendor?.name || "Satıcı"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {vendorItems.length} ürün
                              </p>
                            </div>
                          </div>
                          {vendor?.is_official && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              <Shield className="h-3 w-3 mr-1" />
                              Resmi Satıcı
                            </Badge>
                          )}
                        </div>

                        {/* Product List */}
                        <div className="mb-4 space-y-2">
                          {vendorItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground line-clamp-1">
                                {item.product.name}
                              </span>
                              <span className="text-muted-foreground">
                                (x{item.quantity})
                              </span>
                            </div>
                          ))}
                          {vendorItems.length > 3 && (
                            <p className="text-xs text-muted-foreground ml-5">
                              +{vendorItems.length - 3} ürün daha
                            </p>
                          )}
                        </div>

                        {/* Delivery Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Estimated Delivery */}
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">
                                Tahmini Teslimat
                              </p>
                              <p className="text-sm font-semibold text-green-700">
                                {formattedDate}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                2-3 iş günü içinde
                              </p>
                            </div>
                          </div>

                          {/* Shipping Cost */}
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Truck className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">
                                Kargo Ücreti
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  hasFreeShipping
                                    ? "text-green-600"
                                    : "text-blue-700"
                                }`}
                              >
                                {hasFreeShipping
                                  ? "Ücretsiz Kargo"
                                  : formatPrice(shippingCost)}
                              </p>
                              {hasFreeShipping && (
                                <p className="text-xs text-green-600 mt-1">
                                  Satıcı karşılıyor
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Shipping Speed Options */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Kargoya Teslim Süresi:
                            </span>
                            <span className="font-medium">2 iş günü</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-muted-foreground">
                              Hızlı Teslimat:
                            </span>
                            <span className="font-medium text-primary">
                              Yarın kargoda (Ek ücret: 19.99 TL)
                            </span>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <p>
                              Siparişiniz onaylandıktan sonra kargo takip
                              numaranız SMS ile gönderilecektir.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-xl font-bold mb-6">Ödeme Seçenekleri</h3>

              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="mb-6"
              >
                <div className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                  <RadioGroupItem value="credit_card" id="payment-card" />
                  <CreditCard className="h-5 w-5 text-primary" />
                  <Label
                    htmlFor="payment-card"
                    className="cursor-pointer font-semibold"
                  >
                    Kart ile Öde
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "credit_card" && (
                <>
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">
                      <Info className="h-4 w-4 inline mr-1" />
                      <strong>Test Modu:</strong> Şu an için kart bilgileri
                      manuel olarak işlenmektedir. Gerçek ödeme entegrasyonu
                      yakında eklenecektir.
                    </p>
                    <p className="text-xs text-blue-600">
                      Test için geçerli bir kart formatı girebilirsiniz (16
                      haneli numara).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card Information */}
                    <div>
                      <h4 className="font-semibold mb-4">Kart Bilgileri</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-number" className="text-sm">
                            Kart Numarası
                          </Label>
                          <Input
                            id="card-number"
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) =>
                              setCardNumber(
                                e.target.value
                                  .replace(/\D/g, "")
                                  .replace(/(.{4})/g, "$1 ")
                                  .trim()
                              )
                            }
                            maxLength={19}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <Label className="text-sm">
                              Son Kullanma Tarihi
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <Select
                                value={cardMonth}
                                onValueChange={setCardMonth}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Ay" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem
                                      key={i + 1}
                                      value={(i + 1)
                                        .toString()
                                        .padStart(2, "0")}
                                    >
                                      {(i + 1).toString().padStart(2, "0")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={cardYear}
                                onValueChange={setCardYear}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Yıl" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return (
                                      <SelectItem
                                        key={year}
                                        value={year.toString()}
                                      >
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="card-cvv" className="text-sm">
                              CVV
                            </Label>
                            <div className="flex items-center gap-1 mt-1">
                              <Input
                                id="card-cvv"
                                type="text"
                                placeholder="000"
                                value={cardCvv}
                                onChange={(e) =>
                                  setCardCvv(
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 3)
                                  )
                                }
                                maxLength={3}
                                className="w-full"
                              />
                              <Info className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="3d-secure"
                            checked={use3DSecure}
                            onCheckedChange={(checked) =>
                              setUse3DSecure(checked === true)
                            }
                          />
                          <Label
                            htmlFor="3d-secure"
                            className="text-sm cursor-pointer"
                          >
                            3D Secure ile ödemek istiyorum
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Installment Options */}
                    <div>
                      <h4 className="font-semibold mb-4">Taksit Seçenekleri</h4>
                      <RadioGroup
                        value={installment}
                        onValueChange={setInstallment}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <RadioGroupItem
                              value="single"
                              id="installment-single"
                            />
                            <Label
                              htmlFor="installment-single"
                              className="cursor-pointer flex-1"
                            >
                              Tek Çekim
                            </Label>
                            <span className="font-semibold">
                              {formatPrice(total)}
                            </span>
                          </div>
                          {[2, 3, 6, 9, 12].map((months) => {
                            const installmentAmount = total / months;
                            return (
                              <div
                                key={months}
                                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                              >
                                <RadioGroupItem
                                  value={`${months}x`}
                                  id={`installment-${months}x`}
                                />
                                <Label
                                  htmlFor={`installment-${months}x`}
                                  className="cursor-pointer flex-1"
                                >
                                  {months} Taksit
                                </Label>
                                <span className="font-semibold">
                                  {formatPrice(installmentAmount)} x {months}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">
                Sepetim ({items.length} Ürün)
              </h2>

              {/* Login Prompt */}
              {!isAuthenticated && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    Alışverişini daha hızlı tamamlamak için{" "}
                    <Link href="/login" className="font-semibold underline">
                      Giriş Yap
                    </Link>
                  </p>
                </div>
              )}

              {/* Items Preview */}
              <div className="space-y-4 mb-4 pb-4 border-b">
                {items.map((item) => {
                  const vendor = item.product.vendor;
                  return (
                    <div key={item.id} className="space-y-2">
                      {/* Vendor Info */}
                      {vendor && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700">
                            Satıcı:
                          </span>
                          <span className="text-xs text-gray-600">
                            {vendor.name || "Satıcı"}
                          </span>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex items-start gap-3">
                        <Image
                          src={
                            item.product.images?.[0]?.url
                              ? resolveMediaUrl(item.product.images[0].url)
                              : "https://placehold.co/80x80"
                          }
                          alt={item.product.name || "Ürün"}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 mb-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {typeof item.product.brand === 'string' 
                              ? item.product.brand 
                              : item.product.brand?.name || 'Marka Yok'}
                          </p>

                          {/* Free Shipping Badge */}
                          {item.product.has_free_shipping && (
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs font-semibold text-green-600">
                                Kargo Bedava!
                              </span>
                            </div>
                          )}

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {item.quantity} adet
                              </span>
                            </div>
                            <p className="text-sm font-semibold">
                              {formatPrice(
                                (Number(item.price) || 0) *
                                  (Number(item.quantity) || 0)
                              )}
                            </p>
                          </div>

                          {/* Estimated Delivery */}
                          <p className="text-xs text-muted-foreground mt-1">
                            Tahmini Kargoya Teslim: 3 gün içinde
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ürün Toplamı</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kargo</span>
                  <span className={shippingTotal === 0 ? "text-green-600" : ""}>
                    {shippingTotal === 0
                      ? "Ücretsiz"
                      : formatPrice(shippingTotal)}
                  </span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>İndirim</span>
                    <span>-{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full mt-6"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlaceOrder();
                }}
                onMouseDown={(e) => {
                  // Prevent double-click
                  if (isProcessing || orderSubmitted) {
                    e.preventDefault();
                  }
                }}
                disabled={
                  isProcessing ||
                  orderSubmitted ||
                  !selectedAddress ||
                  (paymentMethod === "credit_card" &&
                    (!cardNumber.replace(/\s/g, "") ||
                      cardNumber.replace(/\s/g, "").length < 16 ||
                      !cardMonth ||
                      !cardYear ||
                      !cardCvv ||
                      cardCvv.length < 3))
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  "Siparişi Tamamla"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Siparişi tamamlayarak ön bilgilendirme formunu ve mesafeli satış
                sözleşmesini kabul ediyorum.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Ödeme Başarılı!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Siparişiniz başarıyla oluşturuldu.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Sipariş Numarası</p>
              <p className="text-xl font-bold text-primary">{orderNumber}</p>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600">
              Sipariş detaylarınızı görmek için siparişlerim sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/orders");
              }}
              className="w-full sm:w-auto"
            >
              Siparişlerime Git
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
