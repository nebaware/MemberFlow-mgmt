"use client";

import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart, CheckCircle, ShieldCheck, Clock, Truck,
  Package, DollarSign, TrendingUp, AlertCircle, RefreshCw,
  Eye, XCircle, ArrowUpRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import {
  getOrders,
  confirmDelivery,
  cancelOrder,
  getOrderStats,
  type Order
} from '@/lib/managers/order-manager';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyOrdersPage() {
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('purchases');
  const { toast } = useToast();
  const t = useTranslations();
  const { user } = useApp();

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadOrders(true);
    }, 30000);

    // Listen for order updates
    const handleOrderUpdate = () => loadOrders(true);
    window.addEventListener('ordersUpdated', handleOrderUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
    };
  }, [user]);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const userId = user?.id;
      if (!userId) return;

      // Fetch orders using the manager (which now calls API)
      const [userPurchases, userSales] = await Promise.all([
        getOrders('purchases'),
        getOrders('sales')
      ]);

      setPurchases(userPurchases);
      setSales(userSales);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: t('error.title') || 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const updatedOrder = await confirmDelivery(orderId);

      if (updatedOrder) {
        toast({
          title: "Delivery Confirmed!",
          description: "Payment has been released from escrow to the seller.",
          action: <CheckCircle className="text-green-500" />,
        });

        loadOrders(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const updatedOrder = await cancelOrder(orderId);

      if (updatedOrder) {
        toast({
          title: "Order Cancelled",
          description: "Your order has been cancelled and refund processed.",
        });

        loadOrders(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'paid':
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 mr-1 text-yellow-500" />;
      case 'paid':
      case 'processing':
        return <ShieldCheck className="h-4 w-4 mr-1 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 mr-1 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 mr-1 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 mr-1 text-red-500" />;
      default:
        return <Package className="h-4 w-4 mr-1" />;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: Order['paymentStatus']) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending Payment' },
      paid: { variant: 'default', label: 'Paid' },
      in_escrow: { variant: 'default', label: 'In Escrow' },
      released: { variant: 'outline', label: 'Released' },
      refunded: { variant: 'destructive', label: 'Refunded' },
    };

    const config = variants[paymentStatus] || variants.pending;
    return <Badge variant={config.variant} className="ml-2">{config.label}</Badge>;
  };

  // Helper to safely format numbers
  const formatAmount = (value: any, decimals: number = 2): string => {
    const num = parseFloat(value as any) || 0;
    return num.toFixed(decimals);
  };

  const calculateStats = (orders: Order[]) => {
    const total = orders.length;
    const totalAmount = orders.reduce((sum, order) => {
      const amount = parseFloat(order.totalAmount as any) || 0;
      return sum + amount;
    }, 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing' || o.status === 'paid').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;

    return { total, totalAmount, pending, processing, shipped, delivered };
  };

  const purchaseStats = calculateStats(purchases);
  const salesStats = calculateStats(sales);

  if (loading) {
    return (
      <>
        <PageTitle title="My Orders & Sales" description="Loading..." />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={t('orders.title') || "My Orders & Sales"}
        description={t('orders.description') || "Track your purchases and manage your sales"}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadOrders()}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </PageTitle>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            My Purchases ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            My Sales ({sales.length})
          </TabsTrigger>
        </TabsList>

        {/* PURCHASES TAB */}
        <TabsContent value="purchases" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Orders</CardDescription>
                <CardTitle className="text-3xl">{purchaseStats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Spent</CardDescription>
                <CardTitle className="text-3xl">{(purchaseStats.totalAmount || 0).toFixed(0)} Birr</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl">{purchaseStats.processing + purchaseStats.shipped}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Delivered</CardDescription>
                <CardTitle className="text-3xl text-green-600">{purchaseStats.delivered}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Orders List */}
          {purchases.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No purchases yet</p>
                  <p className="text-sm">When you buy products, they will appear here</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/market'}>
                    Browse Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {purchases.map((order) => (
                <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Order #{order.orderNumber}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {format(new Date(order.createdAt), "PPP p")} • {formatAmount(order.totalAmount)} Birr
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <Image
                          src={item.productImage || 'https://placehold.co/100x100.png'}
                          alt={item.productName}
                          width={60}
                          height={60}
                          className="rounded-md object-cover aspect-square"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatAmount(item.price)} Birr
                          </p>
                          <p className="text-sm text-muted-foreground">Seller: {item.sellerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatAmount(item.subtotal)} Birr</p>
                        </div>
                      </div>
                    ))}

                    {order.shippingAddress && (
                      <div className="text-sm text-muted-foreground pt-2 border-t">
                        <strong>Shipping:</strong> {order.shippingAddress}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {order.status === 'shipped' && (
                      <Button onClick={() => handleConfirmDelivery(order.id)} className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" /> Confirm Delivery
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Badge variant="outline" className="flex-1 justify-center py-2">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Completed on {order.deliveryDate ? format(new Date(order.deliveryDate), "PPP") : 'N/A'}
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SALES TAB */}
        <TabsContent value="sales" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
                <CardTitle className="text-3xl">{salesStats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-3xl text-green-600">{(salesStats.totalAmount || 0).toFixed(0)} Birr</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-3xl">{salesStats.pending + salesStats.processing}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-3xl text-green-600">{salesStats.delivered}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Sales List */}
          {sales.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-10 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No sales yet</p>
                  <p className="text-sm">When customers buy your products, they will appear here</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/products/add'}>
                    List a Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sales.map((order) => {
                // Calculate seller's earnings from this order
                const sellerItems = order.items.filter(item => item.sellerId === (user?.id || '1'));
                const sellerEarnings = sellerItems.reduce((sum, item) => sum + (item.sellerAmount || 0), 0);

                return (
                  <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            Sale #{order.orderNumber}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {format(new Date(order.createdAt), "PPP p")} • Your Earnings: {formatAmount(sellerEarnings)} Birr
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {sellerItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          <Image
                            src={item.productImage || 'https://placehold.co/100x100.png'}
                            alt={item.productName}
                            width={60}
                            height={60}
                            className="rounded-md object-cover aspect-square"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatAmount(item.price)} Birr
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                              Your Earnings: {formatAmount(item.sellerAmount || 0)} Birr
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatAmount(item.subtotal || 0)} Birr</p>
                            <p className="text-xs text-muted-foreground">Subtotal</p>
                          </div>
                        </div>
                      ))}

                      {order.paymentStatus === 'in_escrow' && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <ShieldCheck className="h-5 w-5 text-yellow-600" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Payment is held in escrow. It will be released when the buyer confirms delivery.
                          </p>
                        </div>
                      )}

                      {order.paymentStatus === 'released' && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Payment released! {formatAmount(sellerEarnings)} Birr has been added to your wallet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>Platform Fee: {formatAmount(order.platformFee)} Birr</span>
                      {order.paymentStatus === 'released' && order.deliveryDate && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Completed: {format(new Date(order.deliveryDate), "PPP")}</span>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
