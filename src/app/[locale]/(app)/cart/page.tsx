"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart, Trash2, Plus, Minus, ShoppingBag,
  ArrowRight, Package, DollarSign, Shield
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import {
  getCart, removeFromCart, updateQuantity, clearCart,
  type Cart, type CartItem
} from '@/lib/managers/cart-manager';
import { createOrder } from '@/lib/managers/order-manager';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const t = useTranslations();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadCart();

    // Listen for cart updates
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const loadCart = () => {
    const currentCart = getCart();
    setCart(currentCart);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    if (!shippingAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your shipping address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const order = await createOrder(
        'user-' + Date.now(), // In production, use actual user ID
        cart.items,
        shippingAddress
      );

      // Clear cart
      clearCart();

      // Redirect to payment
      router.push(`/checkout/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const calculatePlatformFee = () => {
    if (!cart) return 0;
    return Math.max(cart.totalAmount * 0.05, 5);
  };

  const calculateGatewayFee = () => {
    if (!cart) return 0;
    return cart.totalAmount * 0.02;
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.totalAmount;
  };

  if (!cart) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <>
        <PageTitle title="Shopping Cart" description="Your cart is empty" />
        <Card className="shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some products to get started</p>
            <Button onClick={() => router.push('/market')}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="Shopping Cart"
        description={`${cart.totalItems} item${cart.totalItems > 1 ? 's' : ''} in your cart`}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Sold by: {item.sellerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.location} • {item.category}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      {item.price.toFixed(2)} Birr
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-semibold">
                      Subtotal: {(item.price * item.quantity).toFixed(2)} Birr
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Shipping Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Shipping Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter your delivery address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="h-20"
                  required
                />
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span className="font-semibold">{cart.totalAmount.toFixed(2)} Birr</span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee (5%)</span>
                  <span>-{calculatePlatformFee().toFixed(2)} Birr</span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payment Gateway Fee (2%)</span>
                  <span>-{calculateGatewayFee().toFixed(2)} Birr</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{calculateTotal().toFixed(2)} Birr</span>
                </div>
              </div>

              {/* Escrow Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900">Secure Payment</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your payment will be held securely in escrow until delivery is confirmed
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing || !shippingAddress.trim()}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/market')}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
