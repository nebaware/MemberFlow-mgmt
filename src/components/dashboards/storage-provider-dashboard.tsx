"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Warehouse, Users, TrendingUp, RefreshCw, DollarSign, Package, PlusCircle, BarChart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

export function StorageProviderDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalFacilities: 0,
    activeBookings: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
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
      const userId = user?.id || '6'; // Default to storage provider user ID from sample data
      
      // Fetch real data from PostgreSQL
      let totalFacilities = 0;
      let activeBookings = 0;
      let occupancyRate = 0;
      let monthlyRevenue = 0;
      let totalCapacity = 0;
      let usedCapacity = 0;
      
      try {
        // Fetch storage facilities
        const facilitiesResponse = await fetch(`/api/storage?providerId=${userId}`);
        if (facilitiesResponse.ok) {
          const facilities = await facilitiesResponse.json();
          totalFacilities = Array.isArray(facilities) ? facilities.length : 0;
          
          // Calculate total capacity
          if (Array.isArray(facilities)) {
            totalCapacity = facilities.reduce((sum: number, f: any) => {
              return sum + (parseFloat(f.capacity) || 0);
            }, 0);
          }
        }
      } catch (apiError) {
        console.log('Facilities API error:', apiError);
      }
      
      try {
        // Fetch bookings
        const bookingsResponse = await fetch(`/api/storage/bookings?providerId=${userId}`);
        if (bookingsResponse.ok) {
          const bookings = await bookingsResponse.json();
          
          if (Array.isArray(bookings)) {
            // Count active bookings
            activeBookings = bookings.filter((b: any) => 
              b.booking_status === 'Active' || b.booking_status === 'active'
            ).length;
            
            // Calculate monthly revenue from active bookings
            monthlyRevenue = bookings
              .filter((b: any) => b.booking_status === 'Active' || b.booking_status === 'active')
              .reduce((sum: number, b: any) => {
                const totalCost = parseFloat(b.total_cost) || 0;
                const durationMonths = parseInt(b.duration_months) || 1;
                return sum + (totalCost / durationMonths); // Monthly revenue
              }, 0);
            
            // Calculate used capacity
            usedCapacity = bookings
              .filter((b: any) => b.booking_status === 'Active' || b.booking_status === 'active')
              .reduce((sum: number, b: any) => sum + (parseFloat(b.quantity) || 0), 0);
          }
        }
      } catch (apiError) {
        console.log('Bookings API error:', apiError);
      }
      
      // Calculate occupancy rate
      if (totalCapacity > 0) {
        occupancyRate = (usedCapacity / totalCapacity) * 100;
      }

      setStats({ totalFacilities, activeBookings, occupancyRate, monthlyRevenue });

      // Generate real activity messages
      const activity: string[] = [];
      
      if (totalFacilities > 0) {
        activity.push(`${totalFacilities} storage ${totalFacilities === 1 ? 'facility' : 'facilities'} available`);
      }
      
      if (activeBookings > 0) {
        activity.push(`${activeBookings} active ${activeBookings === 1 ? 'booking' : 'bookings'} currently`);
      }
      
      if (occupancyRate > 0) {
        activity.push(`${occupancyRate.toFixed(1)}% average occupancy rate`);
      }
      
      if (monthlyRevenue > 0) {
        activity.push(`Generating ${monthlyRevenue.toFixed(2)} Birr monthly revenue`);
      }
      
      // Show helpful message if no data
      if (activity.length === 0) {
        activity.push('No facilities added yet - Start by adding your first storage facility!');
        activity.push('Offer storage space to farmers and earn revenue');
      }
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading storage provider dashboard:', error);
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
    { title: t('dashboard.total_facilities'), value: stats.totalFacilities.toString(), icon: Warehouse, trend: stats.totalFacilities > 0 ? 'Available' : 'Add facility', trendColor: 'text-blue-500', link: '/storage/my-facilities' },
    { title: t('dashboard.active_bookings'), value: stats.activeBookings.toString(), icon: Users, trend: stats.activeBookings > 0 ? `${stats.activeBookings} active` : 'No bookings yet', trendColor: 'text-blue-500', link: '/storage/bookings' },
    { title: t('dashboard.occupancy_rate'), value: stats.occupancyRate.toFixed(1) + '%', icon: Package, trend: stats.occupancyRate > 0 ? 'Occupancy' : 'No data', trendColor: 'text-green-500', link: '/storage/my-facilities' },
    { title: t('dashboard.monthly_revenue'), value: stats.monthlyRevenue.toFixed(0) + ' Birr', icon: DollarSign, trend: stats.monthlyRevenue > 0 ? 'Monthly' : 'No revenue yet', trendColor: 'text-green-500', link: '/earnings' },
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
            <CardDescription>{t('dashboard.storage_provider_actions_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/storage/add-facility"><PlusCircle className="mr-2 h-4 w-4" />{t('dashboard.add_facility')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/storage/my-facilities"><Warehouse className="mr-2 h-4 w-4" />{t('dashboard.manage_facilities')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/storage/bookings"><Users className="mr-2 h-4 w-4" />{t('dashboard.view_bookings')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/earnings"><BarChart className="mr-2 h-4 w-4" />{t('dashboard.view_analytics')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
            <CardDescription>{t('dashboard.facility_stats')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
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
