"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFollowedVendors, unfollowVendor } from "@/actions/vendor.actions";
import { toast } from "sonner";
import type { Vendor } from "@/types";

export function FollowedVendorsSection() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowedVendors();
  }, []);

  const loadFollowedVendors = async () => {
    setLoading(true);
    try {
      const followed = await getFollowedVendors();
      setVendors(followed);
    } catch (error) {
      console.error("Error loading followed vendors:", error);
      toast.error("Takip edilen mağazalar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (slug: string) => {
    try {
      const result = await unfollowVendor(slug);
      if (result.success) {
        toast.success(result.message || "Mağaza takipten çıkarıldı");
        loadFollowedVendors();
      } else {
        toast.error(result.message || "Takipten çıkarılırken bir hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-primary font-medium mb-4">
          Takip ettiğiniz mağaza bulunmamaktadır.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">Mağazaları Keşfet</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vendors.map((vendor) => (
        <div
          key={vendor.id}
          className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <Link href={`/store/${vendor.slug}`}>
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                {vendor.logo ? (
                  <Image
                    src={vendor.logo}
                    alt={vendor.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Store className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/store/${vendor.slug}`}
                  className="font-semibold hover:text-primary transition-colors truncate"
                >
                  {vendor.name}
                </Link>
                {vendor.is_official && (
                  <Badge className="bg-blue-500 text-xs">Resmi</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{vendor.rating || 0}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{(vendor.follower_count || 0).toLocaleString()}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleUnfollow(vendor.slug)}
              >
                Takipten Çıkar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

