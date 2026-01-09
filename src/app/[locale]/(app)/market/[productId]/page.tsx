"use client";

import { use, useEffect, useState } from 'react';
// Removed mock data import - using only real PostgreSQL data
import type { Product } from '@/lib/types';
import { PageTitle } from '@/components/shared/page-title';
import { ProductDetailClient } from '@/components/market/product-detail-client';
import { notFound, useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

interface ProductDetailPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default function ProductDetailPage(props: ProductDetailPageProps) {
  const params = use(props.params) as { productId: string };
  const router = useRouter();
  const t = useTranslations();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProduct = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      const res = await fetch(`/api/products/${params.productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    const interval = setInterval(() => {
      fetchProduct(true);
    }, 45000);
    return () => clearInterval(interval);
  }, [params.productId]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="h-16 flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="h-12 w-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-outfit">{t('common.not_found')}</h2>
          <p className="text-muted-foreground max-w-sm">{t('product.not_found_desc')}</p>
        </div>
        <Button size="lg" className="rounded-xl px-10" asChild>
          <Link href="/market">{t('market.browse_products')}</Link>
        </Button>
      </div>
    );
  }

  const displayTitle = product.title || product.name || 'Product';

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button variant="ghost" className="w-fit rounded-xl hover:bg-primary/5 -ml-2" asChild>
          <Link href="/market">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back_to_market') || 'Back to Marketplace'}
          </Link>
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl glass border-white/20"
            onClick={() => fetchProduct(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      <ProductDetailClient product={product} />
    </div>
  );
}
