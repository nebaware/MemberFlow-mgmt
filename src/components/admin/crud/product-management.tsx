'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export function ProductManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Management
        </CardTitle>
        <CardDescription>Manage all products in the marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Product CRUD interface</p>
          <p className="text-sm mt-2">View, edit, and delete products</p>
          <Button className="mt-4" onClick={() => window.location.href = '/admin/products'}>
            Go to Product Management
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
