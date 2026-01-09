/**
 * Order Management System
 * Real-time order processing and tracking
 */

import { CartItem } from './cart-manager';
import { logger } from '@/lib/logger';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  items: OrderItem[];
  totalAmount: number;
  platformFee: number;
  paymentGatewayFee: number;
  netAmount: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  escrowStatus: string;
  shippingAddress?: string;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  seller?: { name: string; email: string };
  buyer?: { name: string; email: string };
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string; // Note: API might not return this directly if not joined, but we'll try to map it
  productImage?: string;
  price: number;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
  sellerAmount?: number;
  subtotal?: number;
}

/**
 * Get all orders
 */
export async function getOrders(type: 'purchases' | 'sales' = 'purchases'): Promise<Order[]> {
  try {
    const res = await fetch(`/api/orders?type=${type}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const orders = await res.json();
    return orders;
  } catch (error) {
    logger.error('Failed to fetch orders', error);
    return [];
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    // We can reuse the list endpoint or add a specific one. 
    // For now, let's assume we fetch all and find (inefficient but works for demo)
    // OR better, create a specific endpoint. 
    // Let's use the existing checkout endpoint logic which fetches by ID
    const res = await fetch(`/api/orders/${orderId}`); // We need to ensure this endpoint exists!
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    logger.error('Failed to fetch order', error);
    return null;
  }
}

/**
 * Create order from cart
 */
export async function createOrder(
  buyerId: string, // Unused in API call (session used), but kept for signature compatibility if needed
  cartItems: CartItem[],
  shippingAddress?: string
): Promise<Order> {
  try {
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        shippingAddress,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create order');
    }

    const data = await res.json();
    // API returns { success: true, orders: [...] } because of multi-vendor splitting
    // For the UI, we might want to return the first order or a summary.
    // If multiple orders are created, we should probably redirect to a "Order Placed" page listing them.
    // For now, let's return the first one to satisfy the signature.
    return data.orders[0];
  } catch (error) {
    logger.error('Failed to create order', error);
    throw error;
  }
}

/**
 * Update payment status (Pay)
 */
export async function payForOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}/pay`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Payment failed');
    const data = await res.json();
    return data.order;
  } catch (error) {
    logger.error('Failed to pay for order', error);
    throw error;
  }
}

/**
 * Mark as shipped
 */
export async function markAsShipped(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}/ship`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to mark as shipped');
    const data = await res.json();
    return data.order;
  } catch (error) {
    logger.error('Failed to mark as shipped', error);
    throw error;
  }
}

/**
 * Confirm delivery
 */
export async function confirmDelivery(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}/confirm`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to confirm delivery');
    const data = await res.json();
    return data.order;
  } catch (error) {
    logger.error('Failed to confirm delivery', error);
    throw error;
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to cancel order');
    const data = await res.json();
    return data.order;
  } catch (error) {
    logger.error('Failed to cancel order', error);
    throw error;
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(userId: string, type: 'purchases' | 'sales' = 'purchases'): Promise<{
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalSpent: number;
}> {
  const orders = await getOrders(type);

  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length, // 'confirmed' is used in pay API
    shipped: orders.filter(o => o.deliveryStatus === 'shipped').length,
    delivered: orders.filter(o => o.deliveryStatus === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalSpent: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };
}

