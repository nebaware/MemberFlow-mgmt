'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function WalletManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Management
        </CardTitle>
        <CardDescription>Manage user wallets and balances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Wallet CRUD interface</p>
          <p className="text-sm mt-2">View balances, adjust funds, and manage transactions</p>
          <Button className="mt-4" onClick={() => window.location.href = '/admin/revenue'}>
            Go to Wallet Management
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
