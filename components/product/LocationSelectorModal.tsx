"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Check, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface LocationSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: {
    city: string;
    district: string;
    cityId: number;
    districtId: number;
  }) => void;
}

interface City {
  id: number;
  name: string;
  slug: string;
  plate_code: number;
}

interface District {
  id: number;
  name: string;
  slug: string;
  city_id: number;
}

export function LocationSelectorModal({
  open,
  onOpenChange,
  onLocationSelect,
}: LocationSelectorModalProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [searchCity, setSearchCity] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch cities
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoadingCities(true);

    api
      .get<{ data: City[] }>("/locations/cities")
      .then((response) => {
        if (!isMounted) return;
        // API response structure: { data: City[] }
        const citiesData = Array.isArray(response)
          ? response
          : (response as { data?: City[] }).data || [];
        console.log("Fetched cities:", citiesData.length, "cities");
        setCities(citiesData);
      })
      .catch((error) => {
        console.error("Error fetching cities:", error);
        setCities([]);
      })
      .finally(() => {
        if (isMounted) setLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Fetch districts when city is selected
  useEffect(() => {
    if (!selectedCityId || !open) {
      setDistricts([]);
      return;
    }

    let isMounted = true;
    setLoadingDistricts(true);

    api
      .get<{ data: District[] }>(
        `/locations/cities/${selectedCityId}/districts`
      )
      .then((response) => {
        if (!isMounted) return;
        // API response structure: { data: District[] }
        const districtsData = Array.isArray(response)
          ? response
          : (response as { data?: District[] }).data || [];
        console.log("Fetched districts:", districtsData.length, "districts");
        setDistricts(districtsData);
      })
      .catch((error) => {
        console.error("Error fetching districts:", error);
        setDistricts([]);
      })
      .finally(() => {
        if (isMounted) setLoadingDistricts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCityId, open]);

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchCity.toLowerCase())
  );

  const selectedCity = cities.find((c) => c.id === selectedCityId);
  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  const handleConfirm = () => {
    if (selectedCity && selectedDistrict) {
      onLocationSelect({
        city: selectedCity.name,
        district: selectedDistrict.name,
        cityId: selectedCity.id,
        districtId: selectedDistrict.id,
      });
      onOpenChange(false);
    }
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(Number(cityId));
    setSelectedDistrictId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Konumunu Seç
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Teslimat tarihini öğrenmek için il ve ilçe seçin.
          </p>

          {/* City Selection */}
          <div className="space-y-2">
            <Label>İl</Label>
            {loadingCities ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedCityId?.toString() || ""}
                onValueChange={handleCitySelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="İl seçin" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 sticky top-0 bg-background z-10 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="İl ara..."
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        className="pl-8"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        {searchCity ? "İl bulunamadı" : "Yükleniyor..."}
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* District Selection */}
          <div className="space-y-2">
            <Label>İlçe</Label>
            {loadingDistricts ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedDistrictId?.toString() || ""}
                onValueChange={(value) => setSelectedDistrictId(Number(value))}
                disabled={!selectedCityId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedCityId ? "İlçe seçin" : "Önce il seçin"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {districts.length > 0 ? (
                    districts.map((district) => (
                      <SelectItem
                        key={district.id}
                        value={district.id.toString()}
                      >
                        {district.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      {loadingDistricts ? "Yükleniyor..." : "İlçe bulunamadı"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Location Preview */}
          {selectedCity && selectedDistrict && (
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success mb-2">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Seçilen Konum</span>
              </div>
              <p className="text-sm font-medium">
                {selectedDistrict.name}, {selectedCity.name}
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={!selectedCity || !selectedDistrict}
          >
            Teslimat Tarihini Göster
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
