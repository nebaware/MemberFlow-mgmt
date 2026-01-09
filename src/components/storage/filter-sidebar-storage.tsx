
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { ETHIOPIAN_LOCATIONS, STORAGE_TYPES, STORAGE_FEATURES } from "@/lib/constants";
import { useTranslations } from "next-intl";

interface StorageFilters {
  searchName: string;
  location: string;
  storageType: string;
  availability: string;
  maxPrice: number;
  features: string[];
}

interface FilterSidebarStorageProps {
  filters: StorageFilters;
  onFilterChange: (filters: Partial<StorageFilters>) => void;
}

export function FilterSidebarStorage({ filters, onFilterChange }: FilterSidebarStorageProps) {
  const t = useTranslations('storage_filter');
  const [localSearchName, setLocalSearchName] = useState(filters.searchName);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ searchName: localSearchName });
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchName]);

  const handleReset = () => {
    setLocalSearchName('');
    onFilterChange({
      searchName: '',
      location: 'All',
      storageType: 'All',
      availability: 'All',
      maxPrice: 2000,
      features: [],
    });
  };

  const handleFeatureChange = (feature: string, checked: boolean | string) => {
    const newFeatures = checked
      ? [...filters.features, feature]
      : filters.features.filter(f => f !== feature);
    onFilterChange({ features: newFeatures });
  };

  return (
    <Card className="sticky top-20 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" /> {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="search-storage-name" className="text-sm font-medium">
            {t('search_label')}
          </Label>
          <Input
            id="search-storage-name"
            placeholder={t('search_placeholder')}
            className="mt-1"
            value={localSearchName}
            onChange={(e) => setLocalSearchName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="storage-location" className="text-sm font-medium">
            {t('location_label')}
          </Label>
          <Select
            value={filters.location}
            onValueChange={(value) => onFilterChange({ location: value })}
          >
            <SelectTrigger id="storage-location" className="mt-1">
              <SelectValue placeholder={t('location_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t('all_locations')}</SelectItem>
              {ETHIOPIAN_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="storage-type" className="text-sm font-medium">
            {t('type_label')}
          </Label>
          <Select
            value={filters.storageType}
            onValueChange={(value) => onFilterChange({ storageType: value })}
          >
            <SelectTrigger id="storage-type" className="mt-1">
              <SelectValue placeholder={t('type_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t('all_types')}</SelectItem>
              {STORAGE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="storage-availability" className="text-sm font-medium">
            {t('availability_label')}
          </Label>
          <Select
            value={filters.availability}
            onValueChange={(value) => onFilterChange({ availability: value })}
          >
            <SelectTrigger id="storage-availability" className="mt-1">
              <SelectValue placeholder={t('availability_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t('any_availability')}</SelectItem>
              <SelectItem value="Available">{t('available')}</SelectItem>
              <SelectItem value="Limited Space">{t('limited')}</SelectItem>
              <SelectItem value="Full">{t('full')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price-range-storage" className="text-sm font-medium">
            {t('max_price')}: {filters.maxPrice} {t('unit_month')}
          </Label>
          <Slider
            id="price-range-storage"
            value={[filters.maxPrice]}
            max={2000}
            step={25}
            onValueChange={(value) => onFilterChange({ maxPrice: value[0] })}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">{t('features_label')}</Label>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {STORAGE_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${index}`}
                  onCheckedChange={(checked) => handleFeatureChange(feature, checked)}
                  checked={filters.features.includes(feature)}
                />
                <Label htmlFor={`feature-${index}`} className="text-sm font-normal cursor-pointer">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleReset}
          >
            <X className="mr-1 h-4 w-4" />
            {t('clear_all')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
