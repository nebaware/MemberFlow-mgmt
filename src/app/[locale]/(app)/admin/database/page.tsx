'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Users, Package, ShoppingCart, Wallet, FileText, AlertTriangle, BookOpen, MessageSquare } from 'lucide-react';
import { UserManagement } from '@/components/admin/user-management';
import { ProductManagement } from '@/components/admin/product-management';
import { OrderManagement } from '@/components/admin/order-management';
import { WalletManagement } from '@/components/admin/wallet-management';
import { DisputeManagement } from '@/components/admin/dispute-management';
import { NotificationManagement } from '@/components/admin/notification-management';

export default function AdminDatabasePage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <>
      <PageTitle
        title="Database Management"
        description="Full CRUD operations for all database entities"
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Admin Database Control Panel
          </CardTitle>
          <CardDescription>
            Create, Read, Update, and Delete records across all database tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto">
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

            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <ProductManagement />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrderManagement />
            </TabsContent>

            <TabsContent value="wallets" className="mt-6">
              <WalletManagement />
            </TabsContent>

            <TabsContent value="disputes" className="mt-6">
              <DisputeManagement />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <NotificationManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
