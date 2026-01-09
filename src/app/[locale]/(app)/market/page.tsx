"use client";

import { PageTitle } from '@/components/shared/page-title';
import { ProductCard } from '@/components/market/product-card';
import { FilterSidebar } from '@/components/market/filter-sidebar';
// Removed mock data import - using only real PostgreSQL data
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  maxPrice: number;
}

export default function MarketPage() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const t = useTranslations();

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    category: 'All',
    location: 'All',
    maxPrice: 5000
  });

  const fetchProducts = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        setProducts([]);
        setFilteredProducts([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => {
      fetchProducts(true);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Apply filters in real-time
  useEffect(() => {
    if (!products) return;

    let filtered = [...products];

    // Search term filter - check both title and name for resilience
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        (product.title || product.name || '').toLowerCase().includes(searchLower) ||
        (product.description || '').toLowerCase().includes(searchLower) ||
        (product.farmerName || '').toLowerCase().includes(searchLower)
      );
    }

    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.location && filters.location !== 'All') {
      filtered = filtered.filter(product => product.location === filters.location);
    }

    filtered = filtered.filter(product => product.price <= filters.maxPrice);

    setFilteredProducts(filtered);
  }, [filters, products]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'All',
      location: 'All',
      maxPrice: 5000
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600/20 to-emerald-600/10 p-8 border border-green-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('market.title')}
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              {t('market.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl glass border-white/20 shadow-sm hover:shadow-md transition-all"
              onClick={() => fetchProducts(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg hover:shadow-green-500/20 transition-all font-bold px-6" asChild>
              <Link href="/products/add">
                <PlusCircle className="mr-2 h-5 w-5" /> {t('nav.list_product')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          <div className="sticky top-24">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {/* Results Metadata */}
          {!isLoading && filteredProducts && (
            <div className="flex items-center justify-between text-sm px-2">
              <span className="font-medium text-muted-foreground">
                <span className="text-primary font-bold">{filteredProducts.length}</span> {t('common.products')} {t('common.found')}
              </span>
              {(filters.searchTerm || filters.category !== 'All' || filters.location !== 'All') && (
                <button onClick={handleClearFilters} className="text-primary hover:underline font-bold transition-all">
                  {t('market.clear_filters')}
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4 p-4 rounded-2xl bg-muted/20 animate-pulse">
                  <Skeleton className="h-52 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4 px-4" />
                  <Skeleton className="h-6 w-1/2 px-4" />
                </div>
              ))
            ) : filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-outfit">{t('market.no_results')}</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">
                    {t('market.no_products_desc') || "We couldn't find any products matching your current filters. Try adjusting your search."}
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl px-8" onClick={handleClearFilters}>
                  {t('market.clear_filters')}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
