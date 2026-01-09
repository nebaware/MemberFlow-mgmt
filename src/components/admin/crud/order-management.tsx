'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export function OrderManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Management
        </CardTitle>
        <CardDescription>Manage all orders and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Order CRUD interface</p>
          <p className="text-sm mt-2">View, update order status, and manage transactions</p>
          <Button className="mt-4" onClick={() => window.location.href = '/admin/data'}>
            Go to Order Management
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
