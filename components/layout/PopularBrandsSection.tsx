"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Vendor } from "@/types";
import { mockVendors } from "@/data/mock-data";
import { Pill, PillAvatar } from "@/components/ui/pill";

export function PopularBrandsSection() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<any>("/vendors?limit=50");

      console.log("API Response:", response);

      // Handle different response formats
      let vendorsList: Vendor[] = [];

      if (Array.isArray(response)) {
        vendorsList = response;
      } else if (response && Array.isArray(response.data)) {
        vendorsList = response.data;
      } else if (
        response &&
        response.vendors &&
        Array.isArray(response.vendors)
      ) {
        vendorsList = response.vendors;
      }

      console.log("Parsed vendors list:", vendorsList.length);

      // Sort by follower_count if available
      const sortedVendors = [...vendorsList]
        .filter((v) => v && v.id && v.name) // Filter out invalid entries
        .sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0))
        .slice(0, 50);

      setVendors(sortedVendors);
      console.log("Final vendors:", sortedVendors.length);
    } catch (error: any) {
      console.error("Error loading vendors:", error);
      console.error("Error details:", error.message);
      // Fallback to mock data if API fails
      console.log("Using fallback mock vendors, count:", mockVendors.length);
      const fallbackVendors = [...mockVendors].sort(
        (a, b) => (b.follower_count || 0) - (a.follower_count || 0)
      );
      console.log("Fallback vendors set:", fallbackVendors.length);
      setVendors(fallbackVendors);
      setIsLoading(false); // Set loading to false here as well
      return; // Return early to prevent finally from running again
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-t border-white/50 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Popular Brands */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Popüler Marka ve Mağazalar
            </h2>
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-muted animate-pulse rounded-full"
                  />
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                {vendors.slice(0, 25).map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={vendor.slug ? `/store/${vendor.slug}` : "#"}
                  >
                    <Pill
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      {vendor.logo ? (
                        <PillAvatar
                          src={vendor.logo}
                          fallback={vendor.name.charAt(0).toUpperCase()}
                        />
                      ) : null}
                      {vendor.name}
                    </Pill>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Popular Pages - Satıcı Sayfaları */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Popüler Sayfalar</h2>
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-muted animate-pulse rounded-full"
                  />
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : vendors.length > 25 ? (
              <div className="flex flex-wrap gap-2 items-center">
                {vendors.slice(25).map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={vendor.slug ? `/store/${vendor.slug}` : "#"}
                  >
                    <Pill
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      {vendor.logo ? (
                        <PillAvatar
                          src={vendor.logo}
                          fallback={vendor.name.charAt(0).toUpperCase()}
                        />
                      ) : null}
                      {vendor.name}
                    </Pill>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Daha fazla satıcı yüklendiğinde burada görüntülenecek.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
