"use client";

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, ShoppingBag, Package, 
  Percent, Calendar, ArrowUpRight 
} from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function AdminRevenueContent() {
  const { user } = useApp();
  const [revenue, setRevenue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch revenue data
      const revenueRes = await fetch('/api/admin/revenue');
      if (revenueRes.ok) {
        const data = await revenueRes.json();
        setRevenue(data.revenue || []);
        setStats(data.stats || {});
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const avgCommission = stats?.avgCommission || 0;
  const todayRevenue = stats?.todayRevenue || 0;

  return (
    <>
      <PageTitle 
        title="Platform Revenue" 
        description="Monitor platform earnings and commission rates"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} Birr</div>
            <p className="text-xs text-muted-foreground">All-time platform earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayRevenue.toFixed(2)} Birr</div>
            <p className="text-xs text-muted-foreground">Earnings today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCommission.toFixed(2)} Birr</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Commission Rates</CardTitle>
          <CardDescription>Current platform commission structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Marketplace</span>
                <Badge>{settings.marketplace_commission || 5}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Commission on product sales</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Transport</span>
                <Badge>{settings.transport_commission || 10}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Commission on delivery services</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage</span>
                <Badge>{settings.storage_commission || 8}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Commission on storage bookings</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Escrow Fee</span>
                <Badge>{settings.escrow_fee || 2}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Fee for secure transactions</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Premium Listing</span>
                <Badge>{settings.premium_listing_fee || 50} Birr</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Fee for featured products</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Minimum</span>
                <Badge>{settings.minimum_commission || 10} Birr</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Minimum commission per order</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Revenue</CardTitle>
          <CardDescription>Latest platform earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No revenue data yet</p>
          ) : (
            <div className="space-y-4">
              {revenue.slice(0, 10).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.percentage && (
                          <>
                            <Percent className="h-3 w-3 ml-2" />
                            <span>{item.percentage}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{item.amount.toFixed(2)} Birr</p>
                    <Badge variant="outline" className="text-xs">
                      {item.revenueType.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminRevenuePage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminRevenueContent />
    </ProtectedRoute>
  );
}
