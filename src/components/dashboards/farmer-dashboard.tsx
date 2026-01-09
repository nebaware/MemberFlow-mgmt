"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import {
  ArrowRight, ShoppingBag, Users, DollarSign, BarChart, Bell, Leaf,
  ShieldCheck, TrendingUp, Package, AlertCircle, RefreshCw, Eye,
  Plus, CheckCircle, Clock, Truck, Sprout
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { getOrders, getOrderStats } from '@/lib/managers/order-manager';
import { format } from 'date-fns';
import { OverviewChart } from './overview-chart';

export function FarmerDashboard() {
  const t = useTranslations();
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    newOrders: 0,
    totalSales: 0,
    productsListed: 0,
    pendingEscrow: 0,
    availableBalance: 0,
    completedOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      const userId = user?.id || '1';

      // Get orders data
      const allOrders = await getOrders('sales');
      const userSales = allOrders;

      // Calculate stats
      const totalSales = userSales.reduce((sum, order) => {
        const sellerItems = order.items.filter(item => item.sellerId === userId);
        return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.sellerAmount || 0), 0);
      }, 0);

      const pendingEscrow = userSales
        .filter(order => order.paymentStatus === 'in_escrow')
        .reduce((sum, order) => {
          const sellerItems = order.items.filter(item => item.sellerId === userId);
          return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.sellerAmount || 0), 0);
        }, 0);

      const availableBalance = totalSales - pendingEscrow;

      // Get products count
      let productsCount = 0;
      try {
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          const products = await productsRes.json();
          productsCount = products.filter((p: any) => p.farmerId === userId).length;
        }
      } catch (error) {
        productsCount = 5;
      }

      setStats({
        newOrders: userSales.filter(o => o.status === 'pending' || o.status === 'paid').length,
        totalSales,
        productsListed: productsCount,
        pendingEscrow,
        availableBalance,
        completedOrders: userSales.filter(o => o.status === 'delivered').length,
      });

      // Generate recent activity
      const activities = userSales.slice(0, 5).map(order => ({
        id: order.id,
        type: order.status,
        message: generateActivityMessage(order, userId),
        timestamp: order.createdAt,
        icon: getActivityIcon(order.status),
        color: getActivityColor(order.status),
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);
    const handleOrderUpdate = () => loadDashboardData(true);
    window.addEventListener('ordersUpdated', handleOrderUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
    };
  }, [user]);

  const generateActivityMessage = (order: any, userId: string) => {
    const sellerItems = order.items.filter((item: any) => item.sellerId === userId);
    const productNames = sellerItems.map((item: any) => item.productName).join(', ');

    switch (order.status) {
      case 'pending': return `New order #${order.orderNumber} - ${productNames}`;
      case 'paid': return `Payment received for order #${order.orderNumber} - Held in escrow`;
      case 'processing': return `Order #${order.orderNumber} is being processed`;
      case 'shipped': return `Order #${order.orderNumber} has been shipped`;
      case 'delivered': return `Order #${order.orderNumber} delivered - Payment released!`;
      case 'cancelled': return `Order #${order.orderNumber} was cancelled`;
      default: return `Order #${order.orderNumber} - ${productNames}`;
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'paid': return ShieldCheck;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return ShoppingBag;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'paid': return 'text-blue-500';
      case 'processing': return 'text-purple-500';
      case 'shipped': return 'text-indigo-500';
      case 'delivered': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const statCards = [
    {
      title: t('farmer_dash.total_sales'),
      value: `${Number(stats.totalSales).toFixed(0)}`,
      icon: DollarSign,
      trend: stats.completedOrders > 0 ? `+${stats.completedOrders} orders` : '0',
      trendColor: 'text-emerald-500',
      href: '/earnings',
      gradient: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/10'
    },
    {
      title: t('farmer_dash.new_orders'),
      value: stats.newOrders.toString(),
      icon: ShoppingBag,
      trend: stats.newOrders > 0 ? 'Action needed' : 'All caught up',
      trendColor: 'text-blue-500',
      href: '/orders',
      gradient: 'from-blue-600/20 to-indigo-600/10 border-blue-500/10'
    },
    {
      title: t('farmer_dash.pending_escrow'),
      value: `${Number(stats.pendingEscrow).toFixed(0)}`,
      icon: ShieldCheck,
      trend: 'Securely held',
      trendColor: 'text-amber-500',
      href: '/earnings',
      gradient: 'from-amber-600/20 to-orange-600/10 border-amber-500/10'
    },
    {
      title: t('farmer_dash.products_listed'),
      value: stats.productsListed.toString(),
      icon: Sprout,
      trend: 'Active listings',
      trendColor: 'text-green-500',
      href: '/products/add',
      gradient: 'from-green-600/20 to-lime-600/10 border-green-500/10'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 lg:p-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
          <Skeleton className="lg:col-span-8 h-[400px] rounded-3xl" />
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-[200px] rounded-3xl" />
            <Skeleton className="h-[200px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight font-outfit uppercase bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t('farmer_dash.welcome')}
          </h1>
          <p className="text-lg font-medium text-muted-foreground">{t('farmer_dash.overview')}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            className="rounded-2xl glass border-white/20 h-12 px-6"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl hover:shadow-green-500/20 rounded-2xl h-12 px-6 font-bold"
          >
            <Link href="/products/add">
              <Plus className="mr-2 h-5 w-5" />
              {t('farmer_dash.list_product')}
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href} className="group">
            <Card className={`h-full bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2rem] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.title}</span>
                <div className="h-10 w-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <div className="space-y-1 font-outfit">
                <p className="text-3xl font-black tracking-tight">
                  <span className="text-sm font-bold text-muted-foreground mr-1 uppercase">{t('common.birr')}</span>
                  {stat.value}
                </p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${stat.trendColor} flex items-center gap-1`}>
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-8 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
              <BarChart className="h-7 w-7 text-emerald-600" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[400px]">
              <OverviewChart />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black font-outfit flex items-center gap-3">
                <Package className="h-6 w-6 text-emerald-600" />
                {t('farmer_dash.quick_actions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 grid grid-cols-2 gap-4">
              {[
                { label: t('farmer_dash.list_product'), href: '/products/add', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                { label: t('farmer_dash.view_sales'), href: '/orders', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                { label: t('farmer_dash.ai_advisor'), href: '/ai-advisor', icon: Leaf, color: 'text-purple-600', bg: 'bg-purple-500/10' },
                { label: t('farmer_dash.earnings'), href: '/earnings', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10' },
              ].map((action) => (
                <Button
                  key={action.label}
                  asChild
                  variant="ghost"
                  className="h-auto py-6 flex flex-col gap-3 rounded-[2rem] border border-white/10 hover:bg-white/10"
                >
                  <Link href={action.href}>
                    <div className={`h-12 w-12 rounded-2xl ${action.bg} flex items-center justify-center`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black font-outfit flex items-center gap-3">
                <Bell className="h-6 w-6 text-blue-600" />
                {t('farmer_dash.recent_activity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-4 group">
                        <div className={`h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${activity.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{activity.message}</p>
                          <time className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 transition-opacity">
                            {format(new Date(activity.timestamp), 'MMM d, p')}
                          </time>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/20" />
                  <p className="text-sm font-bold text-muted-foreground">{t('farmer_dash.no_activity')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
