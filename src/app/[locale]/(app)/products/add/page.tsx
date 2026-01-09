
"use client";

import { PageTitle } from '@/components/shared/page-title';
import { AddProductForm } from '@/components/products/add-product-form';
import { useTranslations } from 'next-intl';

export default function AddProductPage() {
  const t = useTranslations();

  return (
    <>
      <PageTitle
        title={t('product.add_product')}
        description={t('product.add_desc')}
      />
      <AddProductForm />
    </>
  );
}
