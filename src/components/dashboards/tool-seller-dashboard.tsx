"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, ShoppingCart, TrendingUp, RefreshCw, DollarSign, Wrench, PlusCircle, BarChart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

export function ToolSellerDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    revenue: 0,
    activeOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      // Get user ID from localStorage (real logged-in user)
      const userStr = localStorage.getItem('azmera_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || '5'; // Default to tool seller user ID from sample data
      
      // Fetch real data from PostgreSQL
      let totalProducts = 0;
      let totalSales = 0;
      let revenue = 0;
      let activeOrders = 0;
      
      try {
        // Fetch products in Agricultural Technologies category
        const productsResponse = await fetch(`/api/products?sellerId=${userId}&category=Agricultural Technologies`);
        if (productsResponse.ok) {
          const products = await productsResponse.json();
          totalProducts = Array.isArray(products) ? products.length : 0;
        }
      } catch (apiError) {
        console.log('Products API error:', apiError);
      }
      
      try {
        // Fetch orders where this seller has sold items
        const ordersResponse = await fetch(`/api/orders/seller/${userId}`);
        if (ordersResponse.ok) {
          const orders = await ordersResponse.json();
          
          if (Array.isArray(orders)) {
            // Count completed sales
            totalSales = orders.filter((o: any) => o.status === 'delivered').length;
            
            // Count active orders
            activeOrders = orders.filter((o: any) => 
              ['paid', 'processing', 'shipped'].includes(o.status)
            ).length;
            
            // Calculate revenue from completed orders
            revenue = orders
              .filter((o: any) => o.status === 'delivered')
              .reduce((sum: number, o: any) => {
                const amount = parseFloat(o.seller_amount) || parseFloat(o.total_amount) || 0;
                return sum + amount;
              }, 0);
          }
        }
      } catch (apiError) {
        console.log('Orders API error:', apiError);
      }

      setStats({ totalProducts, totalSales, revenue, activeOrders });

      // Generate real activity messages
      const activity: string[] = [];
      
      if (totalProducts > 0) {
        activity.push(`${totalProducts} ${totalProducts === 1 ? 'tool' : 'tools'} and equipment listed`);
      }
      
      if (totalSales > 0) {
        activity.push(`${totalSales} total ${totalSales === 1 ? 'sale' : 'sales'} completed`);
      }
      
      if (activeOrders > 0) {
        activity.push(`${activeOrders} ${activeOrders === 1 ? 'order' : 'orders'} currently being processed`);
      }
      
      if (revenue > 0) {
        activity.push(`Generated ${revenue.toFixed(2)} Birr in revenue`);
      }
      
      // Show helpful message if no data
      if (activity.length === 0) {
        activity.push('No products listed yet - Start by adding your first tool!');
        activity.push('List agricultural tools and equipment to start selling');
      }
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading tool seller dashboard:', error);
      setRecentActivity(['Error loading data. Please refresh.']);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { title: t('dashboard.total_products'), value: stats.totalProducts.toString(), icon: Package, trend: stats.totalProducts > 0 ? 'Listed' : 'Add products', trendColor: 'text-blue-500', link: '/tools/inventory' },
    { title: t('dashboard.total_sales'), value: stats.totalSales.toString(), icon: ShoppingCart, trend: stats.totalSales > 0 ? `${stats.totalSales} sold` : 'No sales yet', trendColor: 'text-green-500', link: '/tools/orders' },
    { title: t('dashboard.revenue'), value: stats.revenue.toFixed(0) + ' Birr', icon: DollarSign, trend: stats.revenue > 0 ? 'Total revenue' : 'No revenue yet', trendColor: 'text-green-500', link: '/earnings' },
    { title: t('dashboard.active_orders'), value: stats.activeOrders.toString(), icon: TrendingUp, trend: stats.activeOrders > 0 ? 'Processing' : 'No orders', trendColor: stats.activeOrders > 0 ? 'text-yellow-500' : 'text-gray-500', link: '/tools/orders' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => loadDashboardData(true)} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && <p className={`text-xs ${stat.trendColor}`}>{stat.trend} {t('dashboard.from_last')}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
            <CardDescription>{t('dashboard.tool_seller_actions_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/tools/add"><PlusCircle className="mr-2 h-4 w-4" />{t('dashboard.add_product')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/tools/inventory"><Package className="mr-2 h-4 w-4" />{t('dashboard.manage_inventory')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/tools/orders"><ShoppingCart className="mr-2 h-4 w-4" />{t('dashboard.view_orders')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/earnings"><BarChart className="mr-2 h-4 w-4" />{t('dashboard.view_analytics')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
            <CardDescription>{t('dashboard.business_stats')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Wrench className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
