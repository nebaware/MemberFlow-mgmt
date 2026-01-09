"use client";

import { PageTitle } from '@/components/shared/page-title';
import { PricingForm } from '@/components/pricing-assistant/pricing-form';
import { useTranslations } from 'next-intl';

export default function PricingAssistantPage() {
  const t = useTranslations();

  return (
    <>
      <PageTitle
        title={t('pricing.title')}
        description={t('pricing.description')}
      />
      <PricingForm />
    </>
  );
}
