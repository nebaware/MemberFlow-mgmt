"use client";

import { PageTitle } from '@/components/shared/page-title';
import { DiagnosisForm } from '@/components/ai-advisor/diagnosis-form';
import { useTranslations } from 'next-intl';

export default function AiAdvisorPage() {
  const t = useTranslations();

  return (
    <>
      <PageTitle
        title={t('ai.title')}
        description={t('ai.description')}
      />
      <DiagnosisForm />
    </>
  );
}
