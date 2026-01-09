"use client";

import { PageTitle } from '@/components/shared/page-title';
import { TransportationRequestForm } from '@/components/transportation/transportation-request-form';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

function TransportationRequestFormWrapper() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <TransportationRequestForm />
    </Suspense>
  );
}


export default function TransportationPage() {
  const t = useTranslations();

  return (
    <>
      <PageTitle
        title={t('transport.title')}
        description={t('transport.description')}
      />
      <TransportationRequestFormWrapper />
    </>
  );
}
