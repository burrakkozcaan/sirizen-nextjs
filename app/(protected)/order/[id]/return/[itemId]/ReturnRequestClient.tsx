"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  useReturns,
  returnReasonLabels,
  type ReturnReason,
} from "@/contexts/ReturnsContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order, OrderItem } from "@/types";

interface ReturnRequestClientProps {
  order: Order;
  itemId: number;
}

export function ReturnRequestClient({
  order,
  itemId: initialItemId,
}: ReturnRequestClientProps) {
  const router = useRouter();
  const { createRequest, hasActiveReturn } = useReturns();

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [reasonDetail, setReasonDetail] = useState("");
  const refundMethod = "original" as const;
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialItemId && order) {
      const item = order.items.find((i) => i.id === initialItemId);
      if (item && !hasActiveReturn(item.id)) {
        setSelectedItems([item.id]);
      }
    }
  }, [initialItemId, order, hasActiveReturn]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (images.length >= 5) {
        toast.error("En fazla 5 fotoğraf yükleyebilirsiniz");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleItem = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getEligibleItems = () => {
    if (!order) return [];
    return order.items.filter(
      (item) => item.status === "delivered" && !hasActiveReturn(item.id)
    );
  };

  const calculateRefundTotal = () => {
    if (!order) return 0;
    return order.items
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Lütfen en az bir ürün seçin");
      return;
    }
    if (!reason) {
      toast.error("Lütfen iade nedeninizi seçin");
      return;
    }
    setSubmitting(true);

    try {
      // Create return request for each selected item
      for (const itemId of selectedItems) {
        const item = order.items.find((i) => i.id === itemId);
        if (!item) continue;
        createRequest({
          orderId: order.id,
          orderNumber: order.order_number,
          orderItem: item,
          reason: reason as ReturnReason,
          reasonDetail: reasonDetail || undefined,
          status: "pending",
          refundAmount: item.total,
          refundMethod,
          images: images.length > 0 ? images : undefined,
        });
      }
      toast.success("İade talebiniz oluşturuldu!");
      router.push("/account/returns");
    } catch (error) {
      toast.error("İade talebi oluşturulurken hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const eligibleItems = getEligibleItems();

  return (
    <div className="min-h-screen bg-secondary pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">İade Talebi Oluştur</h1>
            <p className="text-muted-foreground">Sipariş #{order.order_number}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Selection */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                İade Edilecek Ürünleri Seçin
              </h2>
              {eligibleItems.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Bu siparişte iade edilebilecek ürün bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eligibleItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                        selectedItems.includes(item.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleItem(item.id)}
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <Image
                        src={item.product.images?.[0]?.url || ""}
                        alt={item.product.name || ''}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name} • Adet: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Return Reason */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="font-semibold mb-4">İade Nedeninizi Seçin</h2>
                <RadioGroup
                  value={reason}
                  onValueChange={(v) => setReason(v as ReturnReason)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      Object.entries(returnReasonLabels) as [
                        ReturnReason,
                        string,
                      ][]
                    ).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem value={key} id={key} />
                        <Label htmlFor={key} className="cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <div className="mt-4">
                  <Label htmlFor="detail">Ek Açıklama (İsteğe Bağlı)</Label>
                  <Textarea
                    id="detail"
                    placeholder="İade nedeninizi detaylı açıklayın..."
                    value={reasonDetail}
                    onChange={(e) => setReasonDetail(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Photo Upload */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Fotoğraf Ekleyin (İsteğe Bağlı)
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Hasarlı veya kusurlu ürünler için fotoğraf eklemeniz iade
                  sürecinizi hızlandıracaktır.
                </p>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <Image
                        src={img}
                        alt={`Upload ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Ekle
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Refund Method */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="font-semibold mb-4">İade Yöntemi</h2>
                <div className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary" />
                    </div>
                    <div>
                      <Label className="font-medium">
                        Orijinal Ödeme Yöntemine İade
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ödeme yaptığınız karta/hesaba iade edilir (3-10 iş
                        günü)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-4">
              <h2 className="font-semibold mb-4">İade Özeti</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seçilen Ürün</span>
                  <span>{selectedItems.length} adet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İade Yöntemi</span>
                  <span>Orijinal Ödeme</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>İade Tutarı</span>
                    <span className="text-primary">
                      {formatPrice(calculateRefundTotal())}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-6"
                size="lg"
                disabled={
                  selectedItems.length === 0 || !reason || submitting
                }
                onClick={handleSubmit}
              >
                {submitting ? "Gönderiliyor..." : "İade Talebi Oluştur"}
              </Button>
              {/* Info Box */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">İade Süreci</p>
                    <ul className="space-y-1">
                      <li>• Talebiniz 24 saat içinde incelenir</li>
                      <li>• Onay sonrası kargo kodu gönderilir</li>
                      <li>• Ürün teslim alındıktan sonra iade yapılır</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

