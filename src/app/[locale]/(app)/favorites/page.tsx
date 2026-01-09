
"use client";

import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MyFavoritesPage() {
  const t = useTranslations();

  return (
    <>
      <PageTitle
        title={t('favorites.title')}
        description={t('favorites.description')}
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            {t('favorites.title')}
          </CardTitle>
          <CardDescription>
            {t('favorites.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>{t('favorites.no_items')}</p>
            <p className="text-sm">{t('favorites.add_some')}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
