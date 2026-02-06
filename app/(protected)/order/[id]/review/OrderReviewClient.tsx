"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Order } from "@/types";

interface OrderReviewClientProps {
  order: Order;
}

export function OrderReviewClient({ order }: OrderReviewClientProps) {
  const [reviewedItems, setReviewedItems] = useState<number[]>([]);

  const canReviewItems = order.items.filter(
    (item) => item.status === "delivered" && !reviewedItems.includes(item.id)
  );

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/order/${order.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Sipariş Değerlendirme</h1>
            <p className="text-muted-foreground">Sipariş #{order.order_number}</p>
          </div>
        </div>

        {canReviewItems.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Tüm ürünler değerlendirildi
            </h2>
            <p className="text-muted-foreground mb-6">
              Bu siparişteki tüm ürünleri değerlendirdiniz.
            </p>
            <Link href={`/order/${order.id}`}>
              <Button>Sipariş Detayına Dön</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {canReviewItems.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex gap-4">
                  <Image
                    src={item.product.images?.[0]?.url || ""}
                    alt={item.product.name}
                    width={120}
                    height={120}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.product.brand} • Adet: {item.quantity}
                    </p>
                    <Link href={`/order/${order.id}/review/${item.id}`}>
                      <Button className="gap-2">
                        <Star className="h-4 w-4" />
                        Ürünü Değerlendir
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

