"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  CreditCard,
  ChevronLeft,
  ExternalLink,
  Navigation,
  Star,
  RotateCcw,
  Clock,
  Copy,
  Share2,
  RefreshCw,
  Bell,
  Building,
  AlertCircle,
  PackageCheck,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/actions/order.actions";
import type { Order } from "@/types";
import { Map, MapMarker } from "@/components/ui/map";
import { LiveTrackingMap } from "@/components/tracking/LiveTrackingMap";

interface TrackingEvent {
  status: string;
  date: string;
  time: string;
  location: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isCurrent: boolean;
}

const mockTrackingEvents: TrackingEvent[] = [
  {
    status: "delivered",
    date: "13 Ocak 2026",
    time: "14:32",
    location: "İstanbul, Kadıköy",
    description: "Paketiniz teslim edildi",
    icon: <CheckCircle className="h-5 w-5" />,
    isCompleted: true,
    isCurrent: false,
  },
  {
    status: "out_for_delivery",
    date: "13 Ocak 2026",
    time: "09:15",
    location: "İstanbul, Kadıköy Dağıtım Merkezi",
    description: "Paket dağıtıma çıktı",
    icon: <Truck className="h-5 w-5" />,
    isCompleted: true,
    isCurrent: false,
  },
  {
    status: "arrived_at_hub",
    date: "12 Ocak 2026",
    time: "22:45",
    location: "İstanbul, Anadolu Transfer Merkezi",
    description: "Paket transfer merkezine ulaştı",
    icon: <Building className="h-5 w-5" />,
    isCompleted: true,
    isCurrent: false,
  },
  {
    status: "in_transit",
    date: "11 Ocak 2026",
    time: "18:20",
    location: "Ankara, Ana Dağıtım Merkezi",
    description: "Paket yola çıktı",
    icon: <Navigation className="h-5 w-5" />,
    isCompleted: true,
    isCurrent: false,
  },
  {
    status: "shipped",
    date: "10 Ocak 2026",
    time: "16:00",
    location: "Ankara",
    description: "Paket kargoya verildi",
    icon: <Package className="h-5 w-5" />,
    isCompleted: true,
    isCurrent: false,
  },
  {
    status: "processing",
    date: "10 Ocak 2026",
    time: "11:30",
    location: "Satıcı",
    description: "Sipariş hazırlanıyor",
    icon: <PackageCheck className="h-5 w-5" />,
    isCompleted: true,
    isCurrent: false,
  },
  {
    status: "confirmed",
    date: "10 Ocak 2026",
    time: "10:00",
    location: "",
    description: "Sipariş onaylandı",
    icon: <CheckCircle className="h-5 w-5" />,
    isCompleted: true,
    isCurrent: false,
  },
];

interface OrderTrackingClientProps {
  order: Order;
}

export function OrderTrackingClient({ order: initialOrder }: OrderTrackingClientProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

  const { data: order, refetch } = useQuery({
    queryKey: ["order", initialOrder.id],
    queryFn: async () => {
      const result = await getOrderById(String(initialOrder.id));
      console.log("Order fetched:", result.data?.status, "Type:", typeof result.data?.status);
      return result.data;
    },
    initialData: initialOrder,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds for live tracking
  });

  // Debug: Log order status changes
  useEffect(() => {
    if (order) {
      console.log("Order status in component:", order.status, "Type:", typeof order.status);
    }
  }, [order?.status]);

  const getStatusIndex = (status: string): number => {
    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const normalizedStatus = String(status || "").toLowerCase().trim();
    const index = statusOrder.indexOf(normalizedStatus);
    console.log("getStatusIndex - Status:", status, "Normalized:", normalizedStatus, "Index:", index);
    return index >= 0 ? index : 0;
  };

  useEffect(() => {
    if (order) {
      const normalizedStatus = String(order.status || "").toLowerCase().trim();
      console.log("Setting tracking events - Order status:", order.status, "Normalized:", normalizedStatus);
      
      // Status progression order (from earliest to latest)
      const statusProgression = [
        "confirmed",
        "processing", 
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered"
      ];
      
      // Find current status index in progression
      let currentStatusIndex = statusProgression.indexOf(normalizedStatus);
      if (currentStatusIndex === -1) {
        // Fallback: try to match partial status
        if (normalizedStatus.includes("delivered")) currentStatusIndex = 5;
        else if (normalizedStatus.includes("delivery")) currentStatusIndex = 4;
        else if (normalizedStatus.includes("transit")) currentStatusIndex = 3;
        else if (normalizedStatus.includes("shipped")) currentStatusIndex = 2;
        else if (normalizedStatus.includes("processing")) currentStatusIndex = 1;
        else currentStatusIndex = 0;
      }
      
      console.log("Current status index:", currentStatusIndex);
      
      // Map events based on their status and current order status
      const events = mockTrackingEvents.map((event, index) => {
        let isCompleted = false;
        let isCurrent = false;
        
        // Map event status to progression index
        const eventStatusMap: Record<string, number> = {
          "confirmed": 0,
          "processing": 1,
          "shipped": 2,
          "in_transit": 3,
          "out_for_delivery": 4,
          "arrived_at_hub": 3,
          "delivered": 5,
        };
        
        const eventStatusIndex = eventStatusMap[event.status] ?? -1;
        
        if (normalizedStatus === "delivered") {
          // All events are completed when delivered
          isCompleted = true;
          isCurrent = event.status === "delivered";
        } else if (eventStatusIndex >= 0) {
          // Event is completed if its status index is <= current status index
          isCompleted = eventStatusIndex <= currentStatusIndex;
          isCurrent = eventStatusIndex === currentStatusIndex;
        }
        
        return {
          ...event,
          isCompleted,
          isCurrent,
        };
      });
      
      console.log("Tracking events set:", events.map(e => ({ 
        status: e.status, 
        description: e.description,
        isCompleted: e.isCompleted, 
        isCurrent: e.isCurrent 
      })));
      setTrackingEvents(events);
    }
  }, [order]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setIsRefreshing(false);
    toast.success("Takip bilgileri güncellendi");
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Sipariş takibi: ${order?.order_number}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Takip linki kopyalandı");
    }
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success("Takip numarası kopyalandı");
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Sipariş bulunamadı</h1>
        <p className="text-muted-foreground mb-6">
          Aradığınız siparişe ulaşılamadı.
        </p>
        <Link href="/orders">
          <Button>Siparişlerime Dön</Button>
        </Link>
      </div>
    );
  }

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 2);
  const trackingNumber = order.items[0]?.tracking_number || "TR123456789";
  const carrierName = "Yurtiçi Kargo";

  // Map coordinates - will be replaced with real data from shipment
  // Default coordinates
  const defaultOrigin: [number, number] = [39.9334, 32.8597]; // Ankara (vendor location)
  const defaultDestination: [number, number] = [41.0082, 28.9784]; // Istanbul
  
  // Get origin coordinates (vendor location)
  const originCoords: [number, number] = defaultOrigin; // TODO: Get from vendor location
  
  // Get destination coordinates from shipping address
  const destinationCoords: [number, number] = 
    order.shipping_address?.latitude && order.shipping_address?.longitude
      ? [order.shipping_address.latitude, order.shipping_address.longitude]
      : defaultDestination;
  
  // Get current location from shipment (will be added to API response)
  const currentLocationCoords: [number, number] | null = 
    order.items[0]?.current_latitude && order.items[0]?.current_longitude
      ? [order.items[0].current_latitude, order.items[0].current_longitude]
      : null;

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/order/${order.id}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold">Sipariş Takibi</h1>
            <p className="text-muted-foreground text-sm">{order.order_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Paylaş</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              <span className="hidden sm:inline">Yenile</span>
            </Button>
          </div>
        </div>

        {/* Live Tracking Map - Uber Style */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Canlı Kargo Takibi</h2>
            </div>
            {currentLocationCoords && (
              <Badge variant="outline" className="gap-1">
                <Truck className="h-3 w-3" />
                Yolda
              </Badge>
            )}
          </div>
          <LiveTrackingMap
            origin={originCoords}
            destination={destinationCoords}
            currentLocation={currentLocationCoords}
            status={order.status || "pending"}
            className="w-full h-[400px] rounded-lg overflow-hidden"
          />
          {/* Debug info - Always show for debugging */}
          <div className="mt-2 text-xs text-muted-foreground p-2 bg-gray-50 rounded">
            <p><strong>Status:</strong> {order.status || "undefined"}</p>
            <p><strong>Status Type:</strong> {typeof order.status}</p>
            <p><strong>Current Location:</strong> {currentLocationCoords ? `Var (${currentLocationCoords[0]}, ${currentLocationCoords[1]})` : "Yok"}</p>
            <p><strong>Destination:</strong> ({destinationCoords[0]}, {destinationCoords[1]})</p>
          </div>
          {currentLocationCoords && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Mevcut Konum:</span>{" "}
                {order.items[0]?.shipment?.current_location || "Yolda"}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Animated Timeline */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Sipariş Durumu</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
                  </p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Truck className="h-3 w-3" />
                  {carrierName}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {trackingEvents
                    .slice(0, order.status === "delivered" ? undefined : 4)
                    .map((event, index) => (
                      <div
                        key={index}
                        className="relative flex gap-4 pb-6 last:pb-0"
                      >
                        {index < trackingEvents.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-[18px] top-10 w-0.5 h-[calc(100%-24px)]",
                              event.isCompleted ? "bg-primary" : "bg-muted"
                            )}
                          />
                        )}

                        <div
                          className={cn(
                            "relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                            event.isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : event.isCompleted
                              ? "bg-primary/80 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {event.icon}
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p
                                className={cn(
                                  "font-medium",
                                  event.isCurrent && "text-primary"
                                )}
                              >
                                {event.description}
                              </p>
                              {event.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground shrink-0">
                              <p>{event.date}</p>
                              <p className="flex items-center gap-1 justify-end">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estimated Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tahmini Teslimat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">
                  {estimatedDeliveryDate.toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.status === "delivered"
                    ? "Teslim edildi"
                    : "Tahmini teslimat tarihi"}
                </p>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Bildirimler</p>
                      <p className="text-xs text-muted-foreground">
                        Durum değişikliklerinde bildir
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tracking Number */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kargo Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Kargo Firması
                  </p>
                  <p className="font-medium">{carrierName}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Takip Numarası
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono">
                      {trackingNumber}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyTrackingNumber(trackingNumber)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Kargo Sitesinde Takip Et
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Teslimat Adresi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.shipping_address.title || "Adres"}
                    </p>
                    {order.shipping_address.full_name && (
                      <p className="text-muted-foreground">
                        {order.shipping_address.full_name}
                      </p>
                    )}
                    {order.shipping_address.phone && (
                      <p className="text-muted-foreground">
                        {order.shipping_address.phone}
                      </p>
                    )}
                    <p>{order.shipping_address.address_line}</p>
                    <p>
                      {order.shipping_address.neighborhood &&
                        `${order.shipping_address.neighborhood}, `}
                      {order.shipping_address.district}
                      {order.shipping_address.city && `/${order.shipping_address.city}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yardım Mı Lazım?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4" />
                  Kargo ile İletişim
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Satıcıya Mesaj Gönder
                </Button>
                <Separator />
                <p className="text-xs text-muted-foreground text-center">
                  Müşteri Hizmetleri: 0850 XXX XX XX
                </p>
              </CardContent>
            </Card>

            {/* Order Items Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Siparişteki Ürünler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <Image
                        src={item.product.images?.[0]?.url || ""}
                        alt={item.product.name || item.product.title || "Ürün görseli"}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} adet
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{order.items.length - 2} ürün daha
                    </p>
                  )}
                </div>
                <Link href={`/order/${order.id}`}>
                  <Button variant="link" className="w-full mt-3 p-0">
                    Sipariş Detaylarına Git
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

