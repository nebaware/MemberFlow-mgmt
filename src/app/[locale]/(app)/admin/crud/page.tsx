'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Users, Package, ShoppingCart, Wallet, FileText, AlertTriangle } from 'lucide-react';
import { UserManagement } from '@/components/admin/crud/user-management';
import { ProductManagement } from '@/components/admin/crud/product-management';
import { OrderManagement } from '@/components/admin/crud/order-management';
import { WalletManagement } from '@/components/admin/crud/wallet-management';
import { DisputeManagement } from '@/components/admin/crud/dispute-management';
import { NotificationManagement } from '@/components/admin/crud/notification-management';

export default function AdminCRUDPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Database Management (CRUD)
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete control over all database entities - Create, Read, Update, Delete
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Disputes
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="wallets">
          <WalletManagement />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
