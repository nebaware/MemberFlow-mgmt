"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/shared/page-title';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Shield, Package, MapPin, ArrowLeft
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  platformFee: number;
  paymentGatewayFee: number;
  netAmount: number;
  shippingAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    subtotal: number;
    sellerId: string;
  }>;
}

export default function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations();
  const { toast } = useToast();

  // Helper to safely format numbers
  const formatAmount = (value: any, decimals: number = 2): string => {
    const num = parseFloat(value as any) || 0;
    return num.toFixed(decimals);
  };
  const { user } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        // Fetch order from API
        const res = await fetch(`/api/orders/${resolvedParams.orderId}`);
        if (!res.ok) {
          throw new Error('Order not found');
        }
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        toast({
          title: "Order Not Found",
          description: "The order you're looking for doesn't exist",
          variant: "destructive",
        });
        router.push('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [resolvedParams.orderId, router, toast]);

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <PageTitle
        title="Checkout"
        description={`Order #${order.orderNumber}`}
      >
        <Button variant="outline" size="sm" onClick={() => router.push('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </PageTitle>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Method Selection */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentMethodSelector
            orderId={order.id}
            amount={order.totalAmount}
            deliveryFee={0}
            onSuccess={() => {
              router.push(`/orders/${order.id}`);
            }}
          />

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                      <Image
                        src={item.productImage || 'https://placehold.co/100x100.png'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">
                        {formatAmount(item.subtotal)} Birr
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.shippingAddress}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatAmount(order.totalAmount)} Birr</span>
                </div>

                {order.platformFee > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Platform Fee (5%)</span>
                    <span>{formatAmount(order.platformFee)} Birr</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total to Pay</span>
                  <span className="text-primary">{formatAmount(order.totalAmount)} Birr</span>
                </div>

                {order.netAmount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Seller Receives</span>
                    <span className="font-semibold text-green-600">{formatAmount(order.netAmount)} Birr</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Escrow Protection */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Escrow Protection</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your payment will be held securely until you confirm delivery.
                      Seller gets paid only after you're satisfied.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
