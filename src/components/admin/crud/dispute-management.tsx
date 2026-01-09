'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function DisputeManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Dispute Management
        </CardTitle>
        <CardDescription>Manage and resolve order disputes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Dispute CRUD interface</p>
          <p className="text-sm mt-2">View, resolve, and manage disputes</p>
          <Button className="mt-4" onClick={() => window.location.href = '/admin/disputes'}>
            Go to Dispute Management
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
