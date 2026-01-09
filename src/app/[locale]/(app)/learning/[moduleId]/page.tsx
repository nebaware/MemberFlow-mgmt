"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LearningModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  return (
    <>
      <PageTitle title="Learning Module" description={`Module ID: ${resolvedParams.moduleId}`}>
        <Button variant="outline" onClick={() => router.push('/learning')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Module content for ID: {resolvedParams.moduleId}</p>
        </CardContent>
      </Card>
    </>
  );
}
