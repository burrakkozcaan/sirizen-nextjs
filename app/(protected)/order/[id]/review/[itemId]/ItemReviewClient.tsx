"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  CheckCircle,
  Package,
  Store,
  Truck,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StarRatingInput } from "@/components/review/StarRatingInput";
import { PhotoUploadGrid } from "@/components/review/PhotoUploadGrid";
import { api, ApiError } from "@/lib/api";
import type { Order, OrderItem } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormData {
  productRating: number;
  productTitle: string;
  productComment: string;
  photos: File[];
  sellerDeliveryRating: number;
  sellerPackagingRating: number;
  sellerCommunicationRating: number;
  sellerComment: string;
}

const initialFormData: ReviewFormData = {
  productRating: 0,
  productTitle: "",
  productComment: "",
  photos: [],
  sellerDeliveryRating: 0,
  sellerPackagingRating: 0,
  sellerCommunicationRating: 0,
  sellerComment: "",
};

interface ItemReviewClientProps {
  order: Order;
  item: OrderItem;
}

export function ItemReviewClient({ order, item }: ItemReviewClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>(initialFormData);
  const [activeSection, setActiveSection] = useState<"product" | "seller">(
    "product"
  );

  const updateFormData = <K extends keyof ReviewFormData>(
    key: K,
    value: ReviewFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isProductReviewValid =
    formData.productRating > 0 &&
    formData.productComment.trim().length >= 10;

  const isSellerReviewValid =
    formData.sellerDeliveryRating > 0 &&
    formData.sellerPackagingRating > 0 &&
    formData.sellerCommunicationRating > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProductReviewValid) {
      toast.error(
        "Lütfen ürün puanını ve yorumunuzu girin (en az 10 karakter)"
      );
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append("order_id", order.id.toString());
      formDataToSend.append("order_item_id", item.id.toString());
      formDataToSend.append("product_rating", formData.productRating.toString());
      formDataToSend.append("product_title", formData.productTitle);
      formDataToSend.append("product_comment", formData.productComment);

      // Append photos
      formData.photos.forEach((photo, index) => {
        formDataToSend.append(`photos[${index}]`, photo);
      });

      // Seller review (optional)
      if (isSellerReviewValid) {
        formDataToSend.append(
          "seller_delivery_rating",
          formData.sellerDeliveryRating.toString()
        );
        formDataToSend.append(
          "seller_packaging_rating",
          formData.sellerPackagingRating.toString()
        );
        formDataToSend.append(
          "seller_communication_rating",
          formData.sellerCommunicationRating.toString()
        );
        formDataToSend.append("seller_comment", formData.sellerComment);
      }

      // Use fetch directly for FormData (don't set Content-Type header)
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token') 
        : null;

      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reviews`,
        {
          method: 'POST',
          headers,
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Bir hata oluştu',
          errors: data.errors,
        };
      }

      setSubmitting(false);
      setSubmitted(true);
      toast.success("Değerlendirmeniz başarıyla gönderildi!");
    } catch (error) {
      setSubmitting(false);
      const apiError = error as ApiError;
      toast.error(
        apiError.message || "Değerlendirme gönderilirken bir hata oluştu"
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Teşekkürler!</h1>
              <p className="text-muted-foreground mb-8">
                Değerlendirmeniz başarıyla gönderildi. Diğer müşterilere
                yardımcı olduğunuz için teşekkür ederiz.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href={`/order/${order.id}`}>
                    Sipariş Detayına Dön
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/">Alışverişe Devam Et</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">
              Ürün Değerlendirmesi
            </h1>
            <p className="text-muted-foreground text-sm">
              {order.order_number}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Product Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link href={`/product/${item.product.slug}`}>
                      <Image
                        src={item.product.images[0]?.url || ""}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-medium hover:text-primary line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.product.brand}
                      </p>
                      <Link
                        href={`/store/${item.vendor.slug}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Store className="h-3 w-3" />
                        {item.vendor.name}
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section Tabs */}
              <div className="flex gap-2 bg-card rounded-lg p-1 shadow-card">
                <button
                  type="button"
                  onClick={() => setActiveSection("product")}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                    activeSection === "product"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  Ürün Değerlendirmesi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("seller")}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                    activeSection === "seller"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Store className="h-4 w-4 inline mr-2" />
                  Satıcı Değerlendirmesi
                </button>
              </div>

              {/* Product Review Section */}
              {activeSection === "product" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Ürün Değerlendirmesi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Star Rating */}
                    <div className="text-center py-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Bu ürünü nasıl değerlendirirsiniz?
                      </p>
                      <div className="flex justify-center">
                        <StarRatingInput
                          value={formData.productRating}
                          onChange={(value) =>
                            updateFormData("productRating", value)
                          }
                          size="lg"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Başlık (opsiyonel)</Label>
                      <Input
                        id="title"
                        placeholder="Değerlendirmenize bir başlık ekleyin"
                        value={formData.productTitle}
                        onChange={(e) =>
                          updateFormData("productTitle", e.target.value)
                        }
                        maxLength={100}
                      />
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                      <Label htmlFor="comment">
                        Yorumunuz <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="comment"
                        placeholder="Ürün hakkında düşüncelerinizi paylaşın. Kalite, kullanım, beden/boyut uyumu gibi konularda bilgi verebilirsiniz..."
                        value={formData.productComment}
                        onChange={(e) =>
                          updateFormData("productComment", e.target.value)
                        }
                        rows={5}
                        maxLength={1000}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>En az 10 karakter</span>
                        <span>{formData.productComment.length}/1000</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Photo Upload */}
                    <PhotoUploadGrid
                      photos={formData.photos}
                      onPhotosChange={(photos) =>
                        updateFormData("photos", photos)
                      }
                      maxPhotos={5}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Seller Review Section */}
              {activeSection === "seller" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Satıcı Değerlendirmesi
                      <Badge variant="outline" className="ml-2">
                        Opsiyonel
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Satıcıyı teslimat, paketleme ve iletişim açısından
                      değerlendirin.
                    </p>

                    {/* Delivery Rating */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Teslimat Hızı</p>
                          <p className="text-xs text-muted-foreground">
                            Ürün zamanında teslim edildi mi?
                          </p>
                        </div>
                      </div>
                      <StarRatingInput
                        value={formData.sellerDeliveryRating}
                        onChange={(value) =>
                          updateFormData("sellerDeliveryRating", value)
                        }
                        size="sm"
                      />
                    </div>

                    {/* Packaging Rating */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Paketleme</p>
                          <p className="text-xs text-muted-foreground">
                            Ürün güvenli paketlenmiş miydi?
                          </p>
                        </div>
                      </div>
                      <StarRatingInput
                        value={formData.sellerPackagingRating}
                        onChange={(value) =>
                          updateFormData("sellerPackagingRating", value)
                        }
                        size="sm"
                      />
                    </div>

                    {/* Communication Rating */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">İletişim</p>
                          <p className="text-xs text-muted-foreground">
                            Satıcı ile iletişim nasıldı?
                          </p>
                        </div>
                      </div>
                      <StarRatingInput
                        value={formData.sellerCommunicationRating}
                        onChange={(value) =>
                          updateFormData("sellerCommunicationRating", value)
                        }
                        size="sm"
                      />
                    </div>

                    <Separator />

                    {/* Seller Comment */}
                    <div className="space-y-2">
                      <Label htmlFor="sellerComment">
                        Satıcı Hakkında Yorum (opsiyonel)
                      </Label>
                      <Textarea
                        id="sellerComment"
                        placeholder="Satıcı deneyiminizi paylaşın..."
                        value={formData.sellerComment}
                        onChange={(e) =>
                          updateFormData("sellerComment", e.target.value)
                        }
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.sellerComment.length}/500
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Review Summary */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Değerlendirme Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Review Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Ürün Değerlendirmesi</span>
                    </div>
                    {isProductReviewValid ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Tamam
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Gerekli
                      </Badge>
                    )}
                  </div>

                  {/* Seller Review Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Satıcı Değerlendirmesi</span>
                    </div>
                    {isSellerReviewValid ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Tamam
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Opsiyonel
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Photo Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Eklenen Fotoğraf
                    </span>
                    <span className="font-medium">
                      {formData.photos.length} adet
                    </span>
                  </div>

                  <Separator />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={!isProductReviewValid || submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Değerlendirmeyi Gönder
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Değerlendirmeniz onaylandıktan sonra yayınlanacaktır.
                  </p>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">İpuçları</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        Ürünün kalitesi, bedeni ve kullanımı hakkında detaylı
                        bilgi verin
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        Fotoğraf eklemek değerlendirmenizi daha faydalı kılar
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                      <span>Nazik ve yapıcı bir dil kullanın</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
