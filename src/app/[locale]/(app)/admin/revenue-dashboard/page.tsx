"use client";

import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign, TrendingUp, CreditCard, Users,
  ShoppingBag, Package, Truck, Wrench, RefreshCw
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface RevenueStats {
  total: number;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
}

export default function RevenueDashboardPage() {
  const t = useTranslations();
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/revenue/stats');
      const data = await response.json();
      if (data.success) {
        setRevenue(data.revenue);
      }
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getRevenueByType = (type: string) => {
    return revenue?.byType[type] || 0;
  };

  const getCurrentMonthRevenue = () => {
    if (!revenue) return 0;
    const currentMonth = new Date().toISOString().slice(0, 7);
    return revenue.byMonth[currentMonth] || 0;
  };

  const getLastMonthRevenue = () => {
    if (!revenue) return 0;
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthKey = lastMonth.toISOString().slice(0, 7);
    return revenue.byMonth[lastMonthKey] || 0;
  };

  const calculateGrowth = () => {
    const current = getCurrentMonthRevenue();
    const last = getLastMonthRevenue();
    if (last === 0) return 0;
    return ((current - last) / last) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        title="Revenue Dashboard"
        description="Platform revenue and commission tracking"
      >
        <Button onClick={fetchRevenue} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageTitle>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {formatCurrency(revenue?.total || 0)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              All-time platform earnings
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              This Month
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {formatCurrency(getCurrentMonthRevenue())}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {calculateGrowth() >= 0 ? '+' : ''}{calculateGrowth().toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Commissions
            </CardTitle>
            <CreditCard className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {formatCurrency(getRevenueByType('commission'))}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Transaction fees collected
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Avg Commission
            </CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              5-10%
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Based on service type
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Service Type */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
            <CardDescription>Breakdown of revenue sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Marketplace Sales</p>
                  <p className="text-xs text-muted-foreground">5% commission</p>
                </div>
              </div>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(getRevenueByType('commission'))}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Storage Bookings</p>
                  <p className="text-xs text-muted-foreground">10% commission</p>
                </div>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(getRevenueByType('storage_commission') || 0)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Transportation</p>
                  <p className="text-xs text-muted-foreground">10% commission</p>
                </div>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(getRevenueByType('transport_commission') || 0)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold">Tool Rentals</p>
                  <p className="text-xs text-muted-foreground">10% commission</p>
                </div>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(getRevenueByType('tool_commission') || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {revenue && Object.keys(revenue.byMonth).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(revenue.byMonth)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, amount]) => (
                    <div key={month} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(month + '-01').toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((amount / (revenue.total || 1)) * 100 * 6, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-24 text-right">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No revenue data available yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission Structure */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
          <CardDescription>How the platform generates revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Transaction Fees</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm">Marketplace Products</span>
                  <span className="font-bold text-green-700">5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Storage Services</span>
                  <span className="font-bold text-blue-700">10%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm">Transportation</span>
                  <span className="font-bold text-purple-700">10%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm">Tool Rentals</span>
                  <span className="font-bold text-orange-700">10%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Additional Revenue</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Premium Listings</span>
                  <span className="font-bold">50-200 Birr/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Subscriptions</span>
                  <span className="font-bold">200-500 Birr/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">AI Services</span>
                  <span className="font-bold">5-20 Birr/use</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Minimum Fee</span>
                  <span className="font-bold">5 Birr</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
