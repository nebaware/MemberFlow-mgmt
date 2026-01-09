"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, Search, Heart, Truck, RefreshCw, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrders, getOrderStats } from '@/lib/managers/order-manager';

export function BuyerDashboard() {
  const t = useTranslations();
  const [stats, setStats] = useState({
    productsViewed: 0,
    savedFavorites: 0,
    ordersPlaced: 0,
    deliveriesInProgress: 0,
    totalSpent: 0,
  });
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      const userId = '1';
      const orderStats = await getOrderStats(userId, 'purchases');
      const favorites = JSON.parse(localStorage.getItem('azmera_favorites') || '[]');
      const viewedProducts = JSON.parse(localStorage.getItem('azmera_viewed_products') || '[]');
      const cartItems = JSON.parse(localStorage.getItem('azmera_cart') || '[]');

      setStats({
        productsViewed: viewedProducts.length || 0,
        savedFavorites: favorites.length || 0,
        ordersPlaced: orderStats.total || 0,
        deliveriesInProgress: (orderStats.shipped || 0) + (orderStats.processing || 0),
        totalSpent: orderStats.totalSpent || 0,
      });

      const activity: string[] = [];
      if (cartItems.length > 0) activity.push(`${cartItems.length} item(s) in your cart`);
      if (orderStats.shipped > 0) activity.push(`${orderStats.shipped} order(s) out for delivery`);
      if (orderStats.pending > 0) activity.push(`${orderStats.pending} order(s) pending payment`);
      if (orderStats.delivered > 0) activity.push(`${orderStats.delivered} order(s) delivered successfully`);
      if (favorites.length > 0) activity.push(`${favorites.length} products saved to favorites`);
      if (viewedProducts.length > 0) activity.push(`Viewed ${viewedProducts.length} products recently`);
      if (activity.length === 0) activity.push('No recent activity - Start browsing the marketplace!');

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading buyer dashboard:', error);
      setRecentActivity(['Error loading activity. Please refresh.']);
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
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: t('dashboard.products_viewed'),
      value: stats.productsViewed.toString(),
      icon: Search,
      trend: '+' + Math.floor(stats.productsViewed * 0.15),
      trendColor: 'text-blue-500',
      link: '/market',
      gradient: 'from-blue-600/20 to-indigo-600/10 border-blue-500/10'
    },
    {
      title: t('dashboard.saved_favorites'),
      value: stats.savedFavorites.toString(),
      icon: Heart,
      trend: '+' + Math.floor(stats.savedFavorites * 0.1),
      trendColor: 'text-pink-500',
      link: '/favorites',
      gradient: 'from-pink-600/20 to-rose-600/10 border-pink-500/10'
    },
    {
      title: t('dashboard.orders_placed'),
      value: stats.ordersPlaced.toString(),
      icon: ShoppingCart,
      trend: stats.ordersPlaced > 0 ? '+' + Math.floor(stats.ordersPlaced * 0.2) : '',
      trendColor: 'text-green-500',
      link: '/orders',
      gradient: 'from-green-600/20 to-emerald-600/10 border-green-500/10'
    },
    {
      title: t('dashboard.deliveries_progress'),
      value: stats.deliveriesInProgress.toString(),
      icon: Truck,
      trend: '',
      trendColor: '',
      link: '/orders',
      gradient: 'from-purple-600/20 to-indigo-600/10 border-purple-500/10'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 lg:p-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
          <Skeleton className="lg:col-span-8 h-[300px] rounded-3xl" />
          <Skeleton className="lg:col-span-4 h-[300px] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight font-outfit uppercase bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('dashboard.buyer_welcome')}
          </h1>
          <p className="text-lg font-medium text-muted-foreground">{t('dashboard.buyer_overview')}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadDashboardData(true)}
          disabled={isRefreshing}
          className="rounded-2xl glass border-white/20 h-12 px-6"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.link} className="group">
            <Card className={`h-full bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2rem] p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.title}</span>
                <div className="h-10 w-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <div className="space-y-1 font-outfit">
                <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                {stat.trend && (
                  <p className={`text-[10px] font-black uppercase tracking-widest ${stat.trendColor} flex items-center gap-1`}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend} {t('dashboard.from_last')}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/10 backdrop-blur-xl border border-green-500/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-sm font-black uppercase tracking-widest text-green-600/80">{t('dashboard.total_spent')}</span>
            <p className="text-6xl font-black font-outfit text-green-600 flex items-baseline gap-2">
              {Number(stats.totalSpent).toLocaleString()}
              <span className="text-xl font-bold opacity-60 uppercase">{t('common.birr')}</span>
            </p>
            <p className="text-lg font-medium text-muted-foreground">{t('dashboard.lifetime_purchases')}</p>
          </div>
          <div className="h-32 w-32 rounded-full bg-green-500/10 border-4 border-dashed border-green-500/20 flex items-center justify-center animate-spin-slow">
            <DollarSign className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
      </Card>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 items-start">
        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
              <ShoppingCart className="h-7 w-7 text-blue-600" />
              {t('dashboard.quick_actions')}
            </CardTitle>
            <CardDescription className="text-lg">{t('dashboard.buyer_actions_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 grid grid-cols-2 gap-4">
            {[
              { label: t('dashboard.browse_marketplace'), href: '/market', icon: Search, color: 'text-blue-600', bg: 'bg-blue-500/10' },
              { label: t('dashboard.view_orders'), href: '/orders', icon: Package, color: 'text-green-600', bg: 'bg-green-500/10' },
              { label: t('dashboard.my_favorites'), href: '/favorites', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-500/10' },
              { label: t('dashboard.view_cart'), href: '/cart', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-500/10' },
            ].map((action) => (
              <Button
                key={action.label}
                asChild
                variant="ghost"
                className="h-auto py-8 flex flex-col gap-4 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
              >
                <Link href={action.href}>
                  <div className={`h-14 w-14 rounded-2xl ${action.bg} flex items-center justify-center shadow-inner`}>
                    <action.icon className={`h-7 w-7 ${action.color}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{action.label}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden min-h-full">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-purple-600" />
              {t('dashboard.recent_activity')}
            </CardTitle>
            <CardDescription className="text-lg">{t('dashboard.track_interactions')}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{activity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
