"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wallet, Building2, DollarSign, ShieldCheck, Truck } from 'lucide-react';
import type { DeliveryAgent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface DeliveryPaymentDialogProps {
  agent: DeliveryAgent;
  productName: string;
  quantity: string;
  totalProductPrice: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeliveryPaymentDialog({
  agent,
  productName,
  quantity,
  totalProductPrice,
  open,
  onOpenChange
}: DeliveryPaymentDialogProps) {
  const t = useTranslations('delivery_payment');
  const { toast } = useToast();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('escrow');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = agent.priceRate;
  const totalCost = totalProductPrice + deliveryFee;

  const PAYMENT_METHODS = [
    {
      id: 'escrow',
      name: t('escrow_name'),
      icon: ShieldCheck,
      description: t('escrow_desc')
    },
    {
      id: 'telebirr',
      name: 'Telebirr',
      icon: Wallet,
      description: t('telebirr_desc')
    },
    {
      id: 'cbe_birr',
      name: 'CBE Birr',
      icon: Building2,
      description: t('cbe_desc')
    },
    {
      id: 'cash',
      name: t('cash_name'),
      icon: DollarSign,
      description: t('cash_desc')
    },
  ];

  const handleConfirmDelivery = async () => {
    setIsProcessing(true);

    try {
      // Get current user ID (in a real app, this would come from auth context)
      const userId = 1; // Demo user ID - replace with actual auth

      // Process payment via API
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: totalCost,
          paymentMethod: paymentMethod === 'escrow' ? 'Escrow Payment' : PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name,
          transactionType: 'delivery',
          referenceId: null, // Would be order ID in real app
          description: `Delivery payment for ${quantity} x ${productName} with ${agent.name}`
        })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        throw new Error(paymentData.error || 'Payment failed');
      }

      // If payment gateway returns a URL, redirect to it
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
        return;
      }

      // For escrow or cash payments, show confirmation
      if (paymentMethod === 'escrow') {
        toast({
          title: t('confirmed_escrow'),
          description: `Your order for ${quantity} x ${productName} with ${agent.name} is confirmed. Payment (${totalCost.toFixed(2)} Birr) is held in escrow and will be released upon delivery confirmation. Transaction ID: ${paymentData.transaction.id}`,
          action: <ShieldCheck className="text-green-500" />,
        });
      } else {
        toast({
          title: t('confirmed'),
          description: `Your order for ${quantity} x ${productName} with ${agent.name} is confirmed. Payment method: ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}. Total: ${totalCost.toFixed(2)} Birr. Transaction ID: ${paymentData.transaction.id}`,
        });
      }

      onOpenChange(false);

      // Redirect to orders page
      router.push('/orders');
    } catch (error: any) {
      console.error('Delivery payment error:', error);
      toast({
        title: t('failed'),
        description: error.message || t('failed_desc'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Delivery Agent Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-primary" />
              <p className="font-semibold">{agent.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{agent.vehicleType}</p>
            <p className="text-sm text-muted-foreground">{agent.location}</p>
          </div>

          {/* Order Summary */}
          <div className="space-y-2 rounded-lg border p-3">
            <h4 className="font-semibold text-sm">{t('order_summary')}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('product')}:</span>
                <span className="font-medium">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('quantity')}:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('product_price')}:</span>
                <span className="font-medium">{totalProductPrice.toFixed(2)} Birr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('delivery_fee')}:</span>
                <span className="font-medium">{deliveryFee.toFixed(2)} Birr</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">{t('total')}:</span>
                <span className="font-bold text-primary">{totalCost.toFixed(2)} Birr</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>{t('payment_method')}</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.id} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {paymentMethod === 'escrow' && (
            <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900 dark:text-green-100">{t('secure_escrow')}</p>
                  <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                    {t('secure_escrow_desc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmDelivery} disabled={isProcessing}>
            {isProcessing ? t('processing') : t('confirm_pay')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
