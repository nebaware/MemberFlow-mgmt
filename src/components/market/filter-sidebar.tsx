"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, X, Filter } from "lucide-react";
import { useTranslations } from 'next-intl';

interface FilterSidebarProps {
  filters: {
    searchTerm: string;
    category: string;
    location: string;
    maxPrice: number;
  };
  onFilterChange: (filters: Partial<FilterSidebarProps['filters']>) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
  const t = useTranslations();

  const categories = [
    { value: "All", label: t('common.all') },
    { value: "Grains", label: t('market.cat_grains') },
    { value: "Coffee", label: t('market.cat_coffee') },
    { value: "Honey", label: t('market.cat_honey') },
    { value: "Spices", label: t('market.cat_spices') },
    { value: "Fruits", label: t('market.cat_fruits') },
    { value: "Vegetables", label: t('market.cat_vegetables') },
    { value: "Agricultural Technologies", label: t('market.cat_tech') }
  ];

  const locations = [
    { value: "All", label: t('common.all') },
    { value: "Addis Ababa", label: t('market.loc_addis') },
    { value: "Amhara Region", label: t('market.loc_amhara') },
    { value: "Oromia Region", label: t('market.loc_oromia') },
    { value: "SNNPR", label: t('market.loc_snnpr') },
    { value: "Tigray Region", label: t('market.loc_tigray') },
    { value: "Sidama Region", label: t('market.loc_sidama') },
    { value: "Harar", label: t('market.loc_harar') },
    { value: "Dire Dawa", label: t('market.loc_diredawa') }
  ];

  const hasActiveFilters = filters.searchTerm || filters.category !== 'All' || filters.location !== 'All' || filters.maxPrice < 5000;

  return (
    <Card className="sticky top-20 shadow-xl border-none bg-white/80 dark:bg-black/40 backdrop-blur-md">
      <CardHeader className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-t-xl">
        <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
          <Filter className="h-5 w-5" /> {t('market.filter')}
          {hasActiveFilters && (
            <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full animate-in fade-in zoom-in">
              {t('common.active')}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Search Term */}
        <div>
          <Label htmlFor="search-term" className="text-sm font-medium">
            {t('market.search_name')}
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-term"
              placeholder={t('market.search_placeholder')}
              className="pl-10 bg-white/50 dark:bg-black/20 border-green-100 dark:border-green-900 focus:border-green-500 transition-all"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-sm font-medium">
            {t('market.category')}
          </Label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFilterChange({ category: value })}
          >
            <SelectTrigger id="category" className="mt-1 bg-white/50 dark:bg-black/20 border-green-100 dark:border-green-900">
              <SelectValue placeholder={t('market.select_category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-sm font-medium">
            {t('market.location')}
          </Label>
          <Select
            value={filters.location}
            onValueChange={(value) => onFilterChange({ location: value })}
          >
            <SelectTrigger id="location" className="mt-1 bg-white/50 dark:bg-black/20 border-green-100 dark:border-green-900">
              <SelectValue placeholder={t('market.select_location')} />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <Label htmlFor="price-range" className="text-sm font-medium flex justify-between">
            <span>{t('market.max_price')}</span>
            <span className="text-green-600 font-bold">{filters.maxPrice} {t('common.birr')}</span>
          </Label>
          <Slider
            id="price-range"
            value={[filters.maxPrice]}
            max={5000}
            step={50}
            onValueChange={(value) => onFilterChange({ maxPrice: value[0] })}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>5000</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            <X className="mr-1 h-4 w-4" />
            {t('market.clear_filters')}
          </Button>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-green-100 dark:border-green-900">
            <p className="text-xs text-muted-foreground mb-2">{t('common.active_filters')}:</p>
            <div className="flex flex-wrap gap-1">
              {filters.searchTerm && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                  {filters.searchTerm}
                </span>
              )}
              {filters.category !== 'All' && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                  {filters.category}
                </span>
              )}
              {filters.location !== 'All' && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                  {filters.location}
                </span>
              )}
              {filters.maxPrice < 5000 && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                  ≤ {filters.maxPrice} Birr
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
