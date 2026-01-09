
"use client";

import type { Product } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Heart, ShoppingCart, Minus, Plus, Truck, CreditCard, PackageCheck, ShieldCheck, Info, RefreshCw } from 'lucide-react'; // Added Info and RefreshCw icon
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { addToCart, isInCart } from '@/lib/managers/cart-manager';
import { createOrder } from '@/lib/managers/order-manager';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBuyNowOptions, setShowBuyNowOptions] = useState(false);
  const [needsDelivery, setNeedsDelivery] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations();

  const displayTitle = product.title || product.name || 'Product';
  const displayImage = product.image_url || product.imageUrl || '/images/azmera-icon.svg';

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = () => {
    try {
      addToCart({
        productId: product.id,
        productName: displayTitle,
        productImage: displayImage,
        price: product.price,
        sellerId: product.sellerId || product.farmerId?.toString() || 'seller-1',
        sellerName: product.farmerName || t('common.unknown_seller'),
        category: product.category,
        location: product.location,
      });

      toast({
        title: "Added to Cart!",
        description: `${quantity} x ${displayTitle} added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    toast({
      title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: `${displayTitle} has been ${isFavorite ? "removed from" : "added to"} your favorites.`,
    });
  };

  const handleBuyNow = () => {
    setShowBuyNowOptions(true);
    // Scroll smoothly to options
    setTimeout(() => {
      const el = document.getElementById('purchase-options');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleConfirmPurchase = async () => {
    if (!needsDelivery) {
      toast({ title: "Error", description: "Please select a delivery option.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const items = [{
        productId: product.id,
        productName: displayTitle,
        price: product.price,
        quantity: quantity,
        sellerId: product.sellerId || product.farmerId || '1',
      }];

      const deliveryAddress = needsDelivery === 'yes'
        ? `Delivery to your registered location from ${product.location}`
        : 'Self-pickup at seller location';

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '2', // Demo ID
          'x-user-role': 'buyer',
        },
        body: JSON.stringify({
          items,
          deliveryAddress,
          deliveryType: needsDelivery === 'yes' ? 'delivery' : 'pickup',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();

      toast({
        title: "Order Processed!",
        description: `Your order #${data.order.id} has been created. Redirecting to payment...`,
      });

      router.push(`/checkout/${data.order.id}`);

    } catch (error: any) {
      console.error('Order error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      {/* Visual Section */}
      <div className="space-y-6">
        <div className="relative aspect-square md:aspect-[4/5] w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
          <Image
            src={displayImage}
            alt={displayTitle}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-8 left-8">
            <Badge className="bg-primary/90 backdrop-blur-xl text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-none shadow-lg mb-4">
              {product.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-white font-outfit tracking-tight">
              {displayTitle}
            </h1>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleFavorite}
            className="absolute top-6 right-6 h-12 w-12 rounded-2xl glass border-white/20 shadow-xl hover:scale-110 transition-transform duration-300"
          >
            <Heart className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-muted/30 border border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('product.seller')}</span>
            <p className="font-bold text-sm truncate">{product.farmerName}</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('product.location')}</span>
            <p className="font-bold text-sm truncate">{product.location}</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('product.stock')}</span>
            <p className="font-bold text-sm truncate">{product.stockQuantity} {product.unit}</p>
          </div>
        </div>
      </div>

      {/* Info & Action Section */}
      <div className="space-y-8 h-full flex flex-col justify-center">
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black font-outfit text-primary tracking-tighter">
              {Number(product.price).toLocaleString()}
            </span>
            <span className="text-xl font-bold text-muted-foreground uppercase font-outfit">{t('common.birr')}</span>
          </div>

          <div className="flex items-center gap-2 py-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted"></div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">12 {t('market.recent_views')}</span>
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-3">
            <h3 className="text-lg font-bold font-outfit uppercase tracking-wider text-muted-foreground/60">{t('product.description')}</h3>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-4" id="purchase-options">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center p-1 rounded-2xl bg-muted/30 border border-white/10 w-full sm:w-auto">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-black text-xl font-outfit">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleQuantityChange(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button size="lg" onClick={handleAddToCart} variant="secondary" className="w-full sm:flex-1 h-14 rounded-2xl font-bold text-lg hover:bg-muted/50 transition-all border border-white/10">
              <ShoppingCart className="mr-3 h-5 w-5" /> {t('market.add_to_cart')}
            </Button>
          </div>

          <Button size="lg" onClick={handleBuyNow} className="w-full h-16 rounded-[1.25rem] bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl hover:shadow-green-500/20 text-xl font-black font-outfit tracking-tight hover:-translate-y-1 transition-all duration-300">
            {t('market.buy_now')}
          </Button>
        </div>

        {showBuyNowOptions && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 fade-in duration-500 p-8 rounded-[2rem] glass-card border-primary/20 bg-primary/5">
            <div className="space-y-4">
              <h3 className="text-2xl font-black font-outfit flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" /> {t('market.delivery_payment')}
              </h3>

              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t('market.select_delivery')}</Label>
                <RadioGroup value={needsDelivery} onValueChange={setNeedsDelivery} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${needsDelivery === 'yes' ? 'border-primary bg-primary/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                    <RadioGroupItem value="yes" id="delivery-yes" className="sr-only" />
                    <Label htmlFor="delivery-yes" className="flex items-center gap-3 cursor-pointer w-full">
                      <Truck className={`h-5 w-5 ${needsDelivery === 'yes' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-bold">{t('market.delivery')}</span>
                    </Label>
                  </div>
                  <div className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${needsDelivery === 'no' ? 'border-primary bg-primary/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                    <RadioGroupItem value="no" id="delivery-no" className="sr-only" />
                    <Label htmlFor="delivery-no" className="flex items-center gap-3 cursor-pointer w-full">
                      <PackageCheck className={`h-5 w-5 ${needsDelivery === 'no' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-bold">{t('market.pickup')}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleConfirmPurchase}
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-xl"
                  disabled={!needsDelivery || isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-3 h-5 w-5" />
                  )}
                  {t('market.secure_checkout')}
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-green-500" /> {t('market.escrow_protection_active')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-tighter">{t('market.secure_escrow')}</span>
              <span className="text-[10px] text-muted-foreground">{t('market.protection_guaranteed')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Truck className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-tighter">{t('market.smart_logistics')}</span>
              <span className="text-[10px] text-muted-foreground">{t('market.tracking_available')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

