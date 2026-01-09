/**
 * Real-Time Dashboard Data Hook
 * Fetches and auto-refreshes dashboard statistics
 */

import { useState, useEffect } from 'react';
import { Order } from '@/lib/managers/order-manager';

export interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  pendingDeliveries: number;
  revenue: number;
  escrowBalance: number;
  availableBalance: number;
  productsListed?: number;
  potentialBuyers?: number;
  completedDeliveries?: number;
  activeRequests?: number;
  studentsEnrolled?: number;
  coursesCreated?: number;
  toolsSold?: number;
  inventoryCount?: number;
  facilitiesManaged?: number;
  bookingsReceived?: number;
}

export interface DashboardActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  amount?: number;
  status?: string;
}

export function useDashboardData(role: string, userId: string = '1') {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);
    setError(null);

    try {
      // Fetch stats from API
      const statsResponse = await fetch(`/api/dashboard/stats?userId=${userId}&role=${role}`);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        // Fallback to calculated stats from local data
        const calculatedStats = await calculateStatsFromLocalData(role, userId);
        setStats(calculatedStats);
      }

      // Fetch recent activities
      const activitiesResponse = await fetch(`/api/dashboard/activities?userId=${userId}&role=${role}&limit=10`);

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })));
      } else {
        // Fallback to local activities
        const localActivities = await getLocalActivities(role, userId);
        setActivities(localActivities);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');

      // Fallback to local data
      try {
        const calculatedStats = await calculateStatsFromLocalData(role, userId);
        setStats(calculatedStats);
        const localActivities = await getLocalActivities(role, userId);
        setActivities(localActivities);
      } catch (fallbackErr) {
        console.error('Fallback data fetch failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    // Listen for data updates
    const handleDataUpdate = () => fetchDashboardData(true);
    window.addEventListener('dashboardDataUpdated', handleDataUpdate);
    window.addEventListener('ordersUpdated', handleDataUpdate);
    window.addEventListener('cartUpdated', handleDataUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardDataUpdated', handleDataUpdate);
      window.removeEventListener('ordersUpdated', handleDataUpdate);
      window.removeEventListener('cartUpdated', handleDataUpdate);
    };
  }, [role, userId]);

  const refresh = () => fetchDashboardData();

  return {
    stats,
    activities,
    isLoading,
    isRefreshing,
    error,
    refresh
  };
}

/**
 * Calculate stats from local data (orders, cart, etc.)
 */
async function calculateStatsFromLocalData(role: string, userId: string): Promise<DashboardStats> {
  // Import order manager
  const { getOrders, getOrderStats } = await import('@/lib/managers/order-manager');
  const { getCart } = await import('@/lib/managers/cart-manager');

  const orders = await getOrders();
  const cart = getCart();

  // Calculate based on role
  switch (role) {
    case 'farmer':
    case 'tool_seller':
      // Seller stats
      const sellerOrders = orders.filter(o =>
        o.items.some(item => item.sellerId === userId)
      );
      const totalSales = sellerOrders.filter(o => o.status === 'delivered').length;
      const activeOrders = sellerOrders.filter(o =>
        ['paid', 'processing', 'shipped'].includes(o.status)
      ).length;
      const revenue = sellerOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => {
          const sellerItems = o.items.filter(item => item.sellerId === userId);
          return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.sellerAmount || 0), 0);
        }, 0);
      const escrowBalance = sellerOrders
        .filter(o => o.paymentStatus === 'in_escrow')
        .reduce((sum, o) => {
          const sellerItems = o.items.filter(item => item.sellerId === userId);
          return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.sellerAmount || 0), 0);
        }, 0);

      return {
        totalSales,
        activeOrders,
        pendingDeliveries: sellerOrders.filter(o => o.status === 'shipped').length,
        revenue,
        escrowBalance,
        availableBalance: revenue - escrowBalance,
        productsListed: 0, // Would need products API
        potentialBuyers: 0,
      };

    case 'buyer':
      // Buyer stats
      const buyerOrders = orders.filter(o => o.buyerId === userId);
      const buyerStats = await getOrderStats(userId);

      return {
        totalSales: buyerStats.total,
        activeOrders: buyerStats.processing + buyerStats.shipped,
        pendingDeliveries: buyerStats.shipped,
        revenue: buyerStats.totalSpent,
        escrowBalance: buyerOrders
          .filter(o => o.paymentStatus === 'in_escrow')
          .reduce((sum, o) => sum + o.totalAmount, 0),
        availableBalance: 0,
      };

    case 'transporter':
      // Transporter stats
      return {
        totalSales: 0,
        activeOrders: 0,
        pendingDeliveries: 0,
        revenue: 0,
        escrowBalance: 0,
        availableBalance: 0,
        completedDeliveries: 0,
        activeRequests: 0,
      };

    default:
      return {
        totalSales: 0,
        activeOrders: 0,
        pendingDeliveries: 0,
        revenue: 0,
        escrowBalance: 0,
        availableBalance: 0,
      };
  }
}

/**
 * Get recent activities from local data
 */
async function getLocalActivities(role: string, userId: string): Promise<DashboardActivity[]> {
  const { getOrders } = await import('@/lib/managers/order-manager');
  const orders = await getOrders();

  // Get user's relevant orders
  let relevantOrders: Order[] = [];
  if (role === 'farmer' || role === 'tool_seller') {
    relevantOrders = orders.filter(o =>
      o.items.some(item => item.sellerId === userId)
    );
  } else if (role === 'buyer') {
    relevantOrders = orders.filter(o => o.buyerId === userId);
  }

  // Convert to activities
  const activities: DashboardActivity[] = relevantOrders
    .slice(0, 10)
    .map(order => ({
      id: order.id,
      type: role === 'buyer' ? 'purchase' : 'sale',
      description: `Order #${order.orderNumber} - ${order.status}`,
      timestamp: order.updatedAt,
      amount: order.totalAmount,
      status: order.status,
    }));

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
