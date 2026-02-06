"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Truck, 
  Users, 
  ChevronRight, 
  MessageCircle, 
  ShieldCheck,
  Package,
  Clock,
  Bookmark,
  Plus,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Product, Vendor } from '@/types';
import type { ProductSellersResponse } from '@/actions/product-sellers.actions';
import { toast } from 'sonner';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { followVendor, unfollowVendor, checkVendorFollow } from '@/actions/vendor.actions';
import { askQuestion } from '@/actions/question.actions';
import { SellerRatingPopup } from './SellerRatingPopup';

interface ProductSidebarProps {
  product: Product;
  vendor?: Vendor | null;
  sellers?: ProductSellersResponse | null;
}

export function ProductSidebar({ product, vendor, sellers }: ProductSidebarProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Default vendor values if not provided - use mock data similar to Downloads/bazaar-hub-main
  const vendorData = vendor || {
    id: 0,
    name: 'Nike',
    slug: 'nike',
    logo: null,
    rating: 4.9,
    follower_count: 3200000,
    is_official: true,
    product_count: 4500,
    response_time: '30 dakika içinde',
    review_count: 85000,
    years_on_platform: 6,
  };

  // Check follow status on mount
  useEffect(() => {
    if (vendorData.slug && isAuthenticated) {
      checkVendorFollow(vendorData.slug).then((following) => {
        setIsFollowing(following);
      });
    }
  }, [vendorData.slug, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Lütfen önce giriş yapın");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!vendorData.slug) {
      toast.error("Mağaza bilgisi bulunamadı");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowVendor(vendorData.slug);
        if (result.success) {
          setIsFollowing(false);
          toast.success(result.message || "Mağaza takipten çıkarıldı");
        } else {
          toast.error(result.message || "Takipten çıkarılırken bir hata oluştu");
        }
      } else {
        const result = await followVendor(vendorData.slug);
        if (result.success) {
          setIsFollowing(true);
          toast.success(result.message || "Mağaza takip edildi");
        } else {
          toast.error(result.message || "Takip edilirken bir hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Lütfen sorunuzu yazın');
      return;
    }

    if (!isAuthenticated) {
      toast.error("Soru sormak için giriş yapmanız gerekiyor");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}#qa`);
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const result = await askQuestion(product.id, question);
      if (result.success) {
        toast.success('Sorunuz satıcıya iletildi!');
        setQuestion('');
        setQuestionOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Soru gönderilirken bir hata oluştu');
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error('Soru gönderilirken bir hata oluştu');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Campaign Card */}
      <div className="bg-card rounded-xl border p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Ürünün Kampanyaları
        </h3>
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">200 TL ve Üzeri Kargo Bedava</p>
            <p className="text-xs text-muted-foreground">(Satıcı Karşılar)</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
        </div>
      </div>

      {/* Seller Card */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {vendorData.logo ? (
                <img src={vendorData.logo} alt={vendorData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {vendorData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {vendorData.slug ? (
                  <Link 
                    href={`/store/${vendorData.slug}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {vendorData.name}
                  </Link>
                ) : (
                  <span className="font-semibold">{vendorData.name}</span>
                )}
                {vendorData.is_official && (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                )}
                <SellerRatingPopup vendor={vendorData}>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-700 text-xs cursor-pointer hover:bg-green-200 transition-colors"
                  >
                    <Star className="h-3 w-3 fill-current mr-0.5" />
                    {Number(vendorData.rating || 0).toFixed(1)}
                  </Badge>
                </SellerRatingPopup>
              </div>
              <p className="text-sm text-muted-foreground">
                {(vendorData.follower_count / 1000).toFixed(1)}B Takipçi
              </p>
            </div>
          </div>

          {/* Follow Button */}
          <Button 
            variant={isFollowing ? 'default' : 'outline'} 
            className="w-full mt-4" 
            size="sm"
            onClick={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? (
              "..."
            ) : isFollowing ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Takip Ediliyor
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Takip Et Kazan
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Seller Questions - Dialog */}
        <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors w-full text-left"
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Satıcıya Soru Sor</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Satıcıya Soru Sor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Ürün</Label>
                <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
              </div>
              <div>
                <Label>Satıcı</Label>
                <p className="text-sm text-muted-foreground mt-1">{vendorData.name}</p>
              </div>
              <div>
                <Label htmlFor="question">Sorunuz</Label>
                <Textarea
                  id="question"
                  placeholder="Ürün hakkında merak ettiklerinizi yazın..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleAskQuestion}
                disabled={isSubmittingQuestion || !question.trim()}
              >
                {isSubmittingQuestion ? "Gönderiliyor..." : "Soruyu Gönder"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Separator />

        {/* Go to Store */}
        {vendorData.slug && (
          <div className="p-4">
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/store/${vendorData.slug}`}>
                Mağazaya Git
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Other Sellers Section */}
      {sellers && sellers.sellers && sellers.sellers.length > 0 && (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold">
              Ürünün Diğer Satıcıları
            </h3>
          </div>
          
          {/* Show alternative sellers (excluding buybox winner) */}
          {sellers.sellers
            .filter(s => !s.is_buybox_winner)
            .slice(0, 2)
            .map((seller) => (
              <div key={seller.id} className="p-4 border-b">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/store/${seller.vendor.slug}`}
                        className="font-semibold text-sm text-primary hover:underline cursor-pointer"
                      >
                        {seller.vendor.name}
                      </Link>
                      <Badge className={`text-xs ${
                        seller.vendor.rating >= 4.5 
                          ? 'bg-green-100 text-green-700' 
                          : seller.vendor.rating >= 4.0
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {Number(seller.vendor?.rating || 0).toFixed(1)}
                      </Badge>
                      {seller.vendor.is_official && (
                        <ShieldCheck className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      {seller.estimated_delivery_days <= 1 ? (
                        <>
                          <Truck className="h-3 w-3 text-success" />
                          <span>
                            <strong className="text-success">{seller.shipping_time}</strong> içinde sipariş verirsen bugün kargoda!
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{seller.shipping_time}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-3 flex-wrap">
                      {seller.shipping_cost === 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                          <Truck className="h-3 w-3 mr-1" />
                          Kargo Bedava
                        </Badge>
                      )}
                      {seller.badges?.map((badge, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {badge.icon && <span className="mr-1">{badge.icon}</span>}
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {seller.price.toFixed(2)} TL
                      </span>
                      <Link href={`/store/${seller.vendor.slug}`}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Ürüne Git
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          
          {sellers.sellers.filter(s => !s.is_buybox_winner).length > 2 && (
            <div className="p-3">
              <Button 
                variant="ghost" 
                className="w-full text-primary"
                onClick={() => toast.info("Tüm satıcılar sayfası yakında eklenecek")}
              >
                Tüm Satıcıları Gör ({sellers.sellers.filter(s => !s.is_buybox_winner).length})
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Seller Stats */}
      <div className="bg-card rounded-xl border p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Satıcı Bilgileri
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Ürün Sayısı</p>
              <p className="text-sm font-semibold">{(vendorData.product_count || 0).toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Yanıt Süresi</p>
              <p className="text-sm font-semibold">{vendorData.response_time || '24 saat'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Değerlendirme</p>
              <p className="text-sm font-semibold">{(vendorData.review_count || 0).toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Platform Süresi</p>
              <p className="text-sm font-semibold">{vendorData.years_on_platform || 0} Yıl</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Collection (Favorites) */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          if (!isAuthenticated) {
            toast.error("Koleksiyona eklemek için lütfen giriş yapın");
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
          }
          toggleFavorite(product as any);
          toast.success(
            isFavorite(product.id) 
              ? "Koleksiyondan çıkarıldı" 
              : "Koleksiyona eklendi"
          );
        }}
      >
        <Bookmark className={`h-4 w-4 mr-2 ${isFavorite(product.id) ? 'fill-primary text-primary' : ''}`} />
        {isFavorite(product.id) ? 'Koleksiyondan Çıkar' : 'Koleksiyona Ekle'}
        <Plus className="h-4 w-4 ml-auto" />
      </Button>
    </div>
  );
}
