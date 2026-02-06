"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ProductFilters } from '@/types';

interface CategoryFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
}

const brands = ['Koton', 'LC Waikiki', 'Nike', 'Zara', 'Mavi', 'Adidas', 'H&M', 'Defacto'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = [
  { name: 'Siyah', value: 'black', hex: '#000000' },
  { name: 'Beyaz', value: 'white', hex: '#FFFFFF' },
  { name: 'Mavi', value: 'blue', hex: '#3B82F6' },
  { name: 'Kırmızı', value: 'red', hex: '#EF4444' },
  { name: 'Yeşil', value: 'green', hex: '#22C55E' },
  { name: 'Sarı', value: 'yellow', hex: '#EAB308' },
];

export function CategoryFilters({ filters, onFilterChange }: CategoryFiltersProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.min_price || 0,
    filters.max_price || 5000,
  ]);

  // Update price range when filters change
  useEffect(() => {
    setPriceRange([
      filters.min_price || 0,
      filters.max_price || 5000,
    ]);
  }, [filters.min_price, filters.max_price]);

  const [openSections, setOpenSections] = useState({
    brand: true,
    price: true,
    size: false,
    color: false,
    rating: false,
    shipping: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredBrands = brands.filter(b => 
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleBrandChange = (brand: string, checked: boolean) => {
    const currentBrands = filters.brand || [];
    const newBrands = checked
      ? [...currentBrands, brand]
      : currentBrands.filter(b => b !== brand);
    onFilterChange({ brand: newBrands });
  };

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    // Apply filter immediately when slider changes
    onFilterChange({
      min_price: newRange[0] > 0 ? newRange[0] : undefined,
      max_price: newRange[1] < 5000 ? newRange[1] : undefined,
    });
  };

  const applyPriceFilter = () => {
    onFilterChange({
      min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
      max_price: priceRange[1] < 5000 ? priceRange[1] : undefined,
    });
  };

  const handlePriceInputChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      const newRange: [number, number] = [value, priceRange[1]];
      setPriceRange(newRange);
      onFilterChange({
        min_price: value > 0 ? value : undefined,
        max_price: priceRange[1] < 5000 ? priceRange[1] : undefined,
      });
    } else {
      const newRange: [number, number] = [priceRange[0], value];
      setPriceRange(newRange);
      onFilterChange({
        min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
        max_price: value < 5000 ? value : undefined,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Brand Filter */}
      <Collapsible open={openSections.brand} onOpenChange={() => toggleSection('brand')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Marka
          {openSections.brand ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          <Input
            placeholder="Marka ara..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.brand?.includes(brand) || false}
                  onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Filter */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium border-t pt-4">
          Fiyat Aralığı
          {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-4">
          <Slider
            value={priceRange}
            min={0}
            max={5000}
            step={50}
            onValueChange={handlePriceChange}
            className="py-4"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0] || ''}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                handlePriceInputChange('min', value);
              }}
              min={0}
              max={5000}
              className="h-8 text-sm"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1] || ''}
              onChange={(e) => {
                const value = Number(e.target.value) || 5000;
                handlePriceInputChange('max', value);
              }}
              min={0}
              max={5000}
              className="h-8 text-sm"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Size Filter */}
      <Collapsible open={openSections.size} onOpenChange={() => toggleSection('size')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium border-t pt-4">
          Beden
          {openSections.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant="outline"
                size="sm"
                className="h-8 w-10 text-xs"
              >
                {size}
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Color Filter */}
      <Collapsible open={openSections.color} onOpenChange={() => toggleSection('color')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium border-t pt-4">
          Renk
          {openSections.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-primary transition-colors"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating Filter */}
      <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium border-t pt-4">
          Puan
          {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.rating === rating}
                onCheckedChange={(checked) => onFilterChange({ rating: checked ? rating : undefined })}
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">ve üzeri</span>
              </div>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Shipping & Stock */}
      <Collapsible open={openSections.shipping} onOpenChange={() => toggleSection('shipping')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium border-t pt-4">
          Kargo & Stok
          {openSections.shipping ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.has_free_shipping || false}
              onCheckedChange={(checked) => onFilterChange({ has_free_shipping: checked as boolean })}
            />
            <span className="text-sm">Ücretsiz Kargo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.is_in_stock || false}
              onCheckedChange={(checked) => onFilterChange({ is_in_stock: checked as boolean })}
            />
            <span className="text-sm">Stokta Var</span>
          </label>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
