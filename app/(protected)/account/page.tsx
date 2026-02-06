"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  CreditCard,
  Bell,
  BellOff,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Gift,
  Ticket,
  Clock,
  Store,
  MessageCircle,
  Shield,
  HelpCircle,
  ShoppingBag,
  RotateCcw,
  Image as ImageIcon,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, PillIndicator } from "@/components/ui/pill";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useReturns } from "@/contexts/ReturnsContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePriceAlert } from "@/contexts/PriceAlertContext";
import { FollowedVendorsSection } from "./FollowedVendorsSection";
import { SellerMessagesSection } from "@/components/account/SellerMessagesSection";
import { AddressesSection } from "@/components/account/AddressesSection";
import { ProfileSection } from "@/components/account/ProfileSection";
import { api } from "@/lib/api";
import type { Order } from "@/types";
import { toast } from "sonner";

export default function AccountPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("siparislerim");
  const { getAll } = useReturns();
  const { user, logout } = useAuth();
  const { alerts, removeAlert, getActiveAlerts, getTriggeredAlerts } = usePriceAlert();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const activeReturns = getAll().filter(
    (r) => !["refunded", "rejected"].includes(r.status)
  );

  const handleLogout = async () => {
    await logout();
    toast.success("Çıkış yapıldı");
    router.push("/");
  };

  // Load orders
  useEffect(() => {
    if (activeSection === "siparislerim") {
      loadOrders();
    }
  }, [activeSection]);

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const data = await api.get<{ data: Order[] }>("/orders?limit=10");
      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Beklemede",
      confirmed: "Onaylandı",
      processing: "Hazırlanıyor",
      partially_shipped: "Kargoda",
      shipped: "Kargoda",
      delivered: "Teslim Edildi",
      cancelled: "İptal Edildi",
      refunded: "İade Edildi",
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string) => {
    if (["processing", "confirmed"].includes(status)) return "warning";
    if (["shipped", "partially_shipped", "delivered"].includes(status))
      return "success";
    if (["cancelled", "refunded"].includes(status)) return "error";
    return "info";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const sidebarSections = [
    {
      title: "Siparişlerim",
      icon: Package,
      items: [
        {
          icon: Package,
          label: "Tüm Siparişlerim",
          id: "siparislerim",
          badge: "3",
        },
        {
          icon: RotateCcw,
          label: "İade Taleplerim",
          id: "iadeler",
          badge:
            activeReturns.length > 0 ? String(activeReturns.length) : undefined,
        },
        {
          icon: Star,
          label: "Değerlendirmelerim",
          id: "degerlendirmeler",
          highlight: true,
        },
        {
          icon: MessageCircle,
          label: "Satıcı Mesajlarım",
          id: "mesajlar",
        },
        {
          icon: ShoppingBag,
          label: "Tekrar Satın Al",
          id: "tekrar-satin-al",
        },
      ],
    },
    {
      title: "Sana Özel",
      icon: Gift,
      items: [
        {
          icon: Ticket,
          label: "İndirim Kuponlarım",
          id: "kuponlar",
          badge: "5",
        },
        {
          icon: Bell,
          label: "Fiyat Alarmlarım",
          id: "fiyat-alarmlari",
        },
        {
          icon: Clock,
          label: "Önceden Gezdiklerim",
          id: "gecmis",
        },
        {
          icon: Store,
          label: "Takip Ettiğim Mağazalar",
          id: "magazalar",
        },
      ],
    },
    {
      title: "Hesabım & Yardım",
      icon: Settings,
      items: [
        {
          icon: User,
          label: "Kullanıcı Bilgilerim",
          id: "bilgiler",
        },
        {
          icon: MapPin,
          label: "Adres Bilgilerim",
          id: "adresler",
        },
        {
          icon: CreditCard,
          label: "Kayıtlı Kartlarım",
          id: "kartlar",
        },
        {
          icon: Bell,
          label: "Duyuru Tercihlerim",
          id: "duyurular",
        },
        {
          icon: Shield,
          label: "Şifre Değişikliği",
          id: "sifre",
        },
        {
          icon: Settings,
          label: "Aktif Oturumlarım",
          id: "oturumlar",
        },
        {
          icon: HelpCircle,
          label: "Yardım",
          id: "yardim",
          link: "/help",
        },
      ],
    },
  ];

  const handleItemClick = (item: {
    id: string;
    link?: string;
    onClick?: () => void;
  }) => {
    if (item.link) {
      router.push(item.link);
    } else if (item.onClick) {
      item.onClick();
    } else {
      setActiveSection(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-10 lg:pb-8">
      <div className="container mx-auto px-4 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* User Card */}

            <Card className="w-full shadow-none border bg-white/5 backdrop-blur-sm p-2">
              <CardContent className="px-4 py-1">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user?.email || "Kullanıcı"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </Button>
                </div>

                {/* Promo Banner */}
              </CardContent>
            </Card>
            {/* Sidebar Navigation */}
            <Card className="w-full shadow-none border bg-white/5 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Desktop: Normal View */}
                <div className="hidden lg:block space-y-4">
                  {sidebarSections.map((section, sectionIndex) => (
                    <div key={section.title} className="px-4">
                      <div className="px-4 py-3 bg-muted/80 rounded-md mb-2 flex items-center gap-2">
                        {section.icon && (
                          <section.icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {section.title}
                        </h3>
                      </div>
                      {section.items.map((item: {
                        icon: React.ComponentType<{ className?: string }>;
                        label: string;
                        id: string;
                        link?: string;
                        badge?: string;
                        badgeVariant?: string;
                        highlight?: boolean;
                        onClick?: () => void;
                      }) => {
                        const isActive =
                          activeSection === item.id ||
                          (item.link && pathname === item.link);

                        return item.link ? (
                        <Link
                          key={item.id}
                          href={item.link}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 rounded-md py-2.5 text-sm transition-colors hover:bg-muted/50",
                            isActive && "text-primary font-medium bg-primary/5",
                            item.highlight && !isActive && "text-primary"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badgeVariant === "success"
                                  ? "secondary"
                                  : item.badgeVariant === "destructive"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={cn(
                                "text-xs",
                                item.badgeVariant === "success" &&
                                  "bg-red-100 text-red-600",
                                item.badgeVariant === "destructive" &&
                                  "bg-red-500 text-white"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ) : (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 rounded-md py-2.5 text-sm transition-colors hover:bg-muted/50",
                            isActive && "text-primary font-medium bg-primary/5",
                            item.highlight && !isActive && "text-primary"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badgeVariant === "success"
                                  ? "secondary"
                                  : item.badgeVariant === "destructive"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={cn(
                                "text-xs",
                                item.badgeVariant === "success" &&
                                  "bg-red-100 text-red-600",
                                item.badgeVariant === "destructive" &&
                                  "bg-red-500 text-white"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                ))}
                </div>

                {/* Mobile: Accordion */}
                <div className="lg:hidden">
                  <Accordion type="multiple" className="w-full">
                    {sidebarSections.map((section, sectionIndex) => (
                      <AccordionItem key={section.title} value={section.title} className="border-b-0">
                        <AccordionTrigger className="px-4 py-3 m-2 bg-muted/80 rounded-md mb-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            {section.icon && (
                              <section.icon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {section.title}
                            </h3>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-2">
                          {section.items.map((item: {
                            icon: React.ComponentType<{ className?: string }>;
                            label: string;
                            id: string;
                            link?: string;
                            badge?: string;
                            badgeVariant?: string;
                            highlight?: boolean;
                            onClick?: () => void;
                          }) => {
                            const isActive =
                              activeSection === item.id ||
                              (item.link && pathname === item.link);

                            return item.link ? (
                              <Link
                                key={item.id}
                                href={item.link}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 rounded-md py-2.5 text-sm transition-colors hover:bg-muted/50",
                                  isActive && "text-primary font-medium bg-primary/5",
                                  item.highlight && !isActive && "text-primary"
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    "h-4 w-4",
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                  <Badge
                                    variant={
                                      item.badgeVariant === "success"
                                        ? "secondary"
                                        : item.badgeVariant === "destructive"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className={cn(
                                      "text-xs",
                                      item.badgeVariant === "success" &&
                                        "bg-red-100 text-red-600",
                                      item.badgeVariant === "destructive" &&
                                        "bg-red-500 text-white"
                                    )}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </Link>
                            ) : (
                              <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 rounded-md py-2.5 text-sm transition-colors hover:bg-muted/50",
                                  isActive && "text-primary font-medium bg-primary/5",
                                  item.highlight && !isActive && "text-primary"
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    "h-4 w-4",
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                  <Badge
                                    variant={
                                      item.badgeVariant === "success"
                                        ? "secondary"
                                        : item.badgeVariant === "destructive"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className={cn(
                                      "text-xs",
                                      item.badgeVariant === "success" &&
                                        "bg-red-100 text-red-600",
                                      item.badgeVariant === "destructive" &&
                                        "bg-red-500 text-white"
                                    )}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </button>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </CardContent>
            </Card>
           
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="relative order-2 mr-4 flex w-full flex-col items-center rounded-3xl border border-gray-200 px-6 md:order-1 md:overflow-y-auto md:border md:bg-white md:px-8 md:shadow-xs dark:border-[#313131] dark:bg-[#171719]">
              <div className="flex h-full w-full flex-col">
                {/* Header */}
                <div className="flex w-full flex-col gap-y-4 py-8 md:flex-row md:items-center md:justify-between md:py-8">
                  <div>
                    <h1 className="text-xl font-semibold">
                      {activeSection === "siparislerim" && "Siparişlerim"}
                      {activeSection === "iadeler" && "İade Taleplerim"}
                      {activeSection === "mesajlar" && "Satıcı Mesajlarım"}
                      {activeSection === "magazalar" &&
                        "Takip Ettiğim Mağazalar"}
                      {activeSection === "degerlendirmeler" &&
                        "Değerlendirmelerim"}
                      {activeSection === "kuponlar" && "İndirim Kuponlarım"}
                      {activeSection === "fiyat-alarmlari" && "Fiyat Alarmlarım"}
                      {activeSection === "gecmis" && "Önceden Gezdiklerim"}
                      {activeSection === "tekrar-satin-al" && "Tekrar Satın Al"}
                      {activeSection === "kartlar" && "Kayıtlı Kartlarım"}
                      {activeSection === "duyurular" && "Duyuru Tercihlerim"}
                      {activeSection === "sifre" && "Şifre Değişikliği"}
                      {activeSection === "oturumlar" && "Aktif Oturumlarım"}
                      {activeSection === "bilgiler" && "Kullanıcı Bilgilerim"}
                      {activeSection === "adresler" && "Adres Bilgilerim"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Hesabına ait detayları buradan yönetebilirsin
                    </p>
                  </div>
                </div>

                <Separator />

                {/* CONTENT */}
                <div className="flex flex-col gap-y-4 py-6">
                  {/* Siparişlerim */}
                  {activeSection === "siparislerim" && (
                    <>
                      {isLoadingOrders ? (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-sm text-muted-foreground">
                            Siparişler yükleniyor...
                          </p>
                        </div>
                      ) : orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Henüz siparişiniz bulunmamaktadır.
                        </p>
                      ) : (
                        orders.map((order) => {
                          // Get unique vendors from order items
                          const vendors = Array.from(
                            new Map(
                              order.items.map((item) => [
                                item.vendor.id,
                                item.vendor,
                              ])
                            ).values()
                          );

                          return (
                            <div
                              key={order.id}
                              className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    Sipariş #{order.order_number}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(order.created_at)}
                                  </p>
                                </div>
                                <Pill variant="secondary">
                                  <PillIndicator
                                    variant={
                                      getStatusVariant(order.status) as
                                        | "success"
                                        | "error"
                                        | "warning"
                                        | "info"
                                    }
                                  />
                                  {getStatusLabel(order.status)}
                                </Pill>
                              </div>

                              {/* Satıcı ve Ürünler */}
                              <div className="space-y-3 mb-4">
                                {vendors.map((vendor) => {
                                  const vendorItems = order.items.filter(
                                    (item) => item.vendor_id === vendor.id
                                  );
                                  return (
                                    <div key={vendor.id} className="space-y-3">
                                      {/* Satıcı Bilgisi */}
                                      <div className="flex items-center gap-2 text-sm">
                                        <Store className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                          Satıcı:
                                        </span>
                                        <span className="font-medium">
                                          {vendor.name}
                                        </span>
                                      </div>

                                      {/* Ürünler */}
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span>{vendorItems.length} Ürün</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {vendorItems.map((item) => (
                                            <div
                                              key={item.id}
                                              className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-[#2a2a2a] p-2 bg-muted/30"
                                            >
                                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                                                {item.product.images?.[0] ? (
                                                  <img
                                                    src={
                                                      item.product.images[0].url
                                                    }
                                                    alt={
                                                      item.product.name || ""
                                                    }
                                                    className="h-full w-full object-cover"
                                                  />
                                                ) : (
                                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                  {item.product.name ||
                                                    item.product.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  Adet: {item.quantity}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full border"
                                  asChild
                                >
                                  <Link href={`/order/${order.id}`}>
                                    Detay
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </>
                  )}

                  {/* İadeler */}
                  {activeSection === "iadeler" && (
                    <>
                      {activeReturns.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aktif iade talebiniz bulunmamaktadır.
                        </p>
                      ) : (
                        activeReturns.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                          >
                            <div>
                              <p className="font-medium">
                                Sipariş #{r.orderId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {r.reason}
                              </p>
                            </div>
                            <Pill variant="destructive">
                              <PillIndicator variant="info" />
                              İnceleniyor
                            </Pill>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Mesajlar */}
                  {activeSection === "mesajlar" && <SellerMessagesSection />}

                  {/* Mağazalar */}
                  {activeSection === "magazalar" && <FollowedVendorsSection />}

                  {/* Değerlendirmeler */}
                  {activeSection === "degerlendirmeler" && (
                    <p className="text-sm text-muted-foreground">
                      Henüz değerlendirme yapmadınız.
                    </p>
                  )}

                  {/* Kuponlar */}
                  {activeSection === "kuponlar" && (
                    <p className="text-sm text-muted-foreground">
                      Kuponlarınız burada görüntülenecek.
                    </p>
                  )}

                  {/* Fiyat Alarmları */}
                  {activeSection === "fiyat-alarmlari" && (
                    <div className="space-y-4">
                      {alerts.length === 0 ? (
                        <div className="text-center py-12">
                          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Henüz fiyat alarmınız bulunmamaktadır.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ürün sayfalarından fiyat alarmı kurabilirsiniz.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Aktif Alarmlar */}
                          {getActiveAlerts().length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-muted-foreground">
                                Aktif Alarmlar ({getActiveAlerts().length})
                              </h3>
                              {getActiveAlerts().map((alert) => (
                                <div
                                  key={alert.productId}
                                  className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a]"
                                >
                                  <div className="flex items-start gap-4">
                                    {alert.productImage && (
                                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img
                                          src={alert.productImage}
                                          alt={alert.productName}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm mb-1 truncate">
                                        {alert.productName}
                                      </h4>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                        <span>
                                          Mevcut:{" "}
                                          {new Intl.NumberFormat("tr-TR", {
                                            style: "currency",
                                            currency: "TRY",
                                            minimumFractionDigits: 0,
                                          }).format(alert.currentPrice)}
                                        </span>
                                        <span>
                                          Hedef:{" "}
                                          <span className="font-medium text-primary">
                                            {new Intl.NumberFormat("tr-TR", {
                                              style: "currency",
                                              currency: "TRY",
                                              minimumFractionDigits: 0,
                                            }).format(alert.targetPrice)}
                                          </span>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            removeAlert(alert.productId);
                                            toast.success("Fiyat alarmı kaldırıldı");
                                          }}
                                        >
                                          <BellOff className="h-3 w-3 mr-1" />
                                          Kaldır
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            router.push(`/product/${alert.productId}`);
                                          }}
                                        >
                                          Ürüne Git
                                          <ArrowUpRight className="h-3 w-3 ml-1" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tetiklenen Alarmlar */}
                          {getTriggeredAlerts().length > 0 && (
                            <div className="space-y-3 mt-6">
                              <h3 className="text-sm font-semibold text-success">
                                Fiyat Düştü! ({getTriggeredAlerts().length})
                              </h3>
                              {getTriggeredAlerts().map((alert) => (
                                <div
                                  key={alert.productId}
                                  className="rounded-xl border-2 border-primary/50 bg-primary/5 p-4"
                                >
                                  <div className="flex items-start gap-4">
                                    {alert.productImage && (
                                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img
                                          src={alert.productImage}
                                          alt={alert.productName}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm mb-1 truncate">
                                        {alert.productName}
                                      </h4>
                                      <div className="flex items-center gap-4 text-xs mb-2">
                                        <span className="text-muted-foreground">
                                          Mevcut:{" "}
                                          {new Intl.NumberFormat("tr-TR", {
                                            style: "currency",
                                            currency: "TRY",
                                            minimumFractionDigits: 0,
                                          }).format(alert.currentPrice)}
                                        </span>
                                        <span className="font-medium text-success">
                                          Hedef:{" "}
                                          {new Intl.NumberFormat("tr-TR", {
                                            style: "currency",
                                            currency: "TRY",
                                            minimumFractionDigits: 0,
                                          }).format(alert.targetPrice)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            router.push(`/product/${alert.productId}`);
                                          }}
                                        >
                                          Ürüne Git
                                          <ArrowUpRight className="h-3 w-3 ml-1" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            removeAlert(alert.productId);
                                            toast.success("Fiyat alarmı kaldırıldı");
                                          }}
                                        >
                                          <BellOff className="h-3 w-3 mr-1" />
                                          Kaldır
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Geçmiş */}
                  {activeSection === "gecmis" && (
                    <p className="text-sm text-muted-foreground">
                      Önceden gezdiğiniz ürünler burada görüntülenecek.
                    </p>
                  )}

                  {/* Tekrar Satın Al */}
                  {activeSection === "tekrar-satin-al" && (
                    <p className="text-sm text-muted-foreground">
                      Tekrar satın alabileceğiniz ürünler burada görüntülenecek.
                    </p>
                  )}

                  {/* Kartlar */}
                  {activeSection === "kartlar" && (
                    <p className="text-sm text-muted-foreground">
                      Kayıtlı kartlarınız burada görüntülenecek.
                    </p>
                  )}

                  {/* Duyurular */}
                  {activeSection === "duyurular" && (
                    <p className="text-sm text-muted-foreground">
                      Duyuru tercihlerinizi buradan yönetebilirsiniz.
                    </p>
                  )}

                  {/* Şifre Değişikliği */}
                  {activeSection === "sifre" && (
                    <p className="text-sm text-muted-foreground">
                      Şifre değişikliği formu burada görüntülenecek.
                    </p>
                  )}

                  {/* Oturumlar */}
                  {activeSection === "oturumlar" && (
                    <p className="text-sm text-muted-foreground">
                      Aktif oturumlarınız burada görüntülenecek.
                    </p>
                  )}

                  {/* Adresler */}
                  {activeSection === "adresler" && <AddressesSection />}

                  {/* Bilgiler */}
                  {activeSection === "bilgiler" && <ProfileSection />}
                </div>
              </div>
            </div>
          </div>
           {/* Ask Assistant */}
           <Card className="border-primary/20 shadow-none border bg-white/5 backdrop-blur-sm">
              <CardContent className="px-4 py-3 text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-primary">
                  Sirizen Teknik Destek'e Sor
                  <Link href='/help'
                    className="text-primary hover:underline justify-center flex items-center gap-1 text-center"
                  >
                   
                      <MessageCircle className="h-4 w-4" />
                      Sor
                 
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  7/24 Sorularınızı Cevaplayız
                </p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
