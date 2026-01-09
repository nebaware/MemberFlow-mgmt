
"use client";

import { PageTitle } from '@/components/shared/page-title';
import { RegistrationTabs } from '@/components/join/registration-tabs';
import { APP_NAME } from '@/lib/constants';
import { useTranslations } from 'next-intl';

export default function JoinPage() {
  const t = useTranslations();

  return (
    <>
      <PageTitle
        title={`${t('join.title')}`}
        description={t('join.description')}
      />
      <RegistrationTabs />
    </>
  );
}
