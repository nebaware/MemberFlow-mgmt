"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, UserCircle, ShoppingCart, Eye } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();

  const displayTitle = product.title || product.name || 'Product';
  const displayImage = product.image_url || product.imageUrl || (product as any).imagePreview || '/images/azmera-icon.svg';
  const displaySeller = (product as any).farmerName || (product as any).seller || t('product.seller');

  return (
    <Card className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={displayImage}
          alt={displayTitle}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
          <Button size="sm" variant="secondary" className="rounded-full glass border border-white/40 shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300" asChild>
            <Link href={`/market/${product.id}`}>
              <Eye className="h-4 w-4 mr-2" /> {t('market.view_details')}
            </Link>
          </Button>
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary/90 backdrop-blur-md text-white border-none shadow-lg px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
            {product.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-3 relative">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-xl leading-tight line-clamp-1 group-hover:text-primary transition-colors font-outfit">
            {displayTitle}
          </h3>
          <div className="flex flex-col items-end">
            <p className="font-bold text-xl text-primary font-outfit">
              {Number(product.price || 0).toLocaleString()}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground uppercase">{t('common.birr')}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between text-xs font-medium pt-3 border-t border-white/10 dark:border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-4 w-4 text-primary/70" />
            </div>
            <span className="truncate max-w-[120px]">
              {displaySeller}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground px-2 py-1 rounded-full bg-muted/30">
            <MapPin className="h-3 w-3 text-accent" />
            <span className="truncate max-w-[90px]">{product.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/20 group-hover:-translate-y-1 transition-all duration-300 font-bold" asChild>
          <Link href={`/market/${product.id}`}>
            <ShoppingCart className="h-4 w-4 mr-2" /> {t('market.add_to_cart')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

