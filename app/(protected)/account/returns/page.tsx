"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ChevronRight,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useReturns,
  returnReasonLabels,
  returnStatusLabels,
  returnStatusColors,
  type ReturnStatus,
} from "@/contexts/ReturnsContext";
import { cn } from "@/lib/utils";

const statusIcons: Record<ReturnStatus, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  shipped: Truck,
  received: Package,
  refunded: Wallet,
};

export default function ReturnsPage() {
  const { getAll } = useReturns();
  const [activeTab, setActiveTab] = useState("all");

  const allReturns = getAll();

  const filteredReturns =
    activeTab === "all"
      ? allReturns
      : allReturns.filter((r) => {
          if (activeTab === "active")
            return !["refunded", "rejected"].includes(r.status);
          if (activeTab === "completed") return r.status === "refunded";
          if (activeTab === "rejected") return r.status === "rejected";
          return true;
        });

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

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (allReturns.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">İade Taleplerim</h1>

          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Henüz iade talebiniz yok
            </h2>
            <p className="text-muted-foreground mb-6">
              Siparişlerinizden iade talebi oluşturabilirsiniz.
            </p>
            <Button asChild>
              <Link href="/orders">Siparişlerime Git</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">İade Taleplerim</h1>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="all">Tümü ({allReturns.length})</TabsTrigger>
            <TabsTrigger value="active">
              Devam Eden (
              {
                allReturns.filter(
                  (r) => !["refunded", "rejected"].includes(r.status)
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="completed">
              Tamamlanan (
              {allReturns.filter((r) => r.status === "refunded").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Reddedilen (
              {allReturns.filter((r) => r.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredReturns.length === 0 ? (
              <div className="bg-white rounded-lg shadow-card p-8 text-center">
                <p className="text-muted-foreground">
                  Bu kategoride iade talebi bulunmuyor.
                </p>
              </div>
            ) : (
              filteredReturns.map((returnRequest) => {
                const StatusIcon = statusIcons[returnRequest.status];
                return (
                  <div
                    key={returnRequest.id}
                    className="bg-white rounded-lg shadow-card overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            İade No
                          </p>
                          <p className="font-semibold">{returnRequest.id}</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Sipariş No
                          </p>
                          <Link
                            href={`/order/${returnRequest.orderId}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            #{returnRequest.orderNumber}
                          </Link>
                        </div>
                        <div className="h-8 w-px bg-border hidden sm:block" />
                        <div className="hidden sm:block">
                          <p className="text-sm text-muted-foreground">
                            Talep Tarihi
                          </p>
                          <p className="font-medium">
                            {formatDate(returnRequest.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "flex items-center gap-1",
                          returnStatusColors[returnRequest.status]
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {returnStatusLabels[returnRequest.status]}
                      </Badge>
                    </div>

                    {/* Product */}
                    <div className="p-4 flex items-center gap-4">
                      <Image
                        src={
                          returnRequest.orderItem.product.images?.[0]?.url || ""
                        }
                        alt={returnRequest.orderItem.product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${returnRequest.orderItem.product.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {returnRequest.orderItem.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {returnRequest.orderItem.product.brand} • Adet:{" "}
                          {returnRequest.orderItem.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          İade Nedeni:{" "}
                          {returnReasonLabels[returnRequest.reason]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          İade Tutarı
                        </p>
                        <p className="font-bold text-primary">
                          {formatPrice(returnRequest.refundAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Status Timeline - Accordion */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="timeline" className="border-t">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <span className="text-sm font-medium">
                            İade Durumu Takibi
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="relative pl-6">
                            {returnRequest.statusHistory.map(
                              (history, index) => {
                                const HistoryIcon = statusIcons[history.status];
                                const isLast =
                                  index ===
                                  returnRequest.statusHistory.length - 1;
                                return (
                                  <div
                                    key={index}
                                    className="relative pb-4 last:pb-0"
                                  >
                                    {!isLast && (
                                      <div className="absolute left-[-18px] top-6 bottom-0 w-0.5 bg-border" />
                                    )}
                                    <div className="absolute left-[-24px] top-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                      <HistoryIcon className="h-3 w-3 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {returnStatusLabels[history.status]}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatDateTime(history.date)}
                                      </p>
                                      {history.note && (
                                        <p className="text-sm mt-1">
                                          {history.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
