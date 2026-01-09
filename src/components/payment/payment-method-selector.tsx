"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useInitiatePayment, useWalletBalance } from '@/hooks/use-payments';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface PaymentMethodSelectorProps {
  orderId: string;
  amount: number;
  deliveryFee?: number;
  onSuccess?: () => void;
}

export function PaymentMethodSelector({
  orderId,
  amount,
  deliveryFee = 0,
  onSuccess,
}: PaymentMethodSelectorProps) {
  const { user } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'chapa' | 'telebirr'>('wallet');
  const { data: walletData } = useWalletBalance();
  const initiatePayment = useInitiatePayment();

  // Helper to safely format numbers
  const formatAmount = (value: any, decimals: number = 2): string => {
    const num = parseFloat(value as any) || 0;
    return num.toFixed(decimals);
  };

  const totalAmount = parseFloat(amount as any) + parseFloat(deliveryFee as any);
  const platformFee = parseFloat(amount as any) * 0.05; // 5% commission
  const hasInsufficientBalance = walletData && walletData.balance < totalAmount;

  const paymentMethods = [
    {
      id: 'wallet',
      name: 'Wallet Balance',
      description: 'Pay using your Azmera wallet',
      icon: Wallet,
      available: true,
      balance: walletData?.balance || 0,
      recommended: walletData && walletData.balance >= totalAmount,
    },
    {
      id: 'chapa',
      name: 'Chapa',
      description: 'Pay with card, mobile money, or bank',
      icon: CreditCard,
      available: true,
      recommended: false,
    },
    {
      id: 'telebirr',
      name: 'Telebirr',
      description: 'Pay with Telebirr mobile money',
      icon: Smartphone,
      available: true,
      recommended: false,
    },
  ];

  const handlePayment = async () => {
    if (selectedMethod === 'wallet' && hasInsufficientBalance) {
      return;
    }

    initiatePayment.mutate(
      {
        orderId,
        paymentMethod: selectedMethod,
        amount,
        deliveryFee,
        email: user?.email,
        firstName: user?.name.split(' ')[0],
        lastName: user?.name.split(' ').slice(1).join(' '),
        phoneNumber: user?.phone,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Review your order total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatAmount(amount)} Birr</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium">{formatAmount(deliveryFee)} Birr</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee (5%)</span>
            <span className="font-medium">{formatAmount(platformFee)} Birr</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatAmount(totalAmount)} Birr</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose how you want to pay</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="relative">
                  <div
                    className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMethod(method.id as any)}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <method.icon className="h-5 w-5 text-primary" />
                        <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                          {method.name}
                        </Label>
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                      {method.id === 'wallet' && method.balance !== undefined && (
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">Available: </span>
                          <span
                            className={`font-semibold ${
                              method.balance >= totalAmount ? 'text-green-600' : 'text-destructive'
                            }`}
                          >
                            {formatAmount(method.balance)} Birr
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedMethod === 'wallet' && hasInsufficientBalance && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Balance</AlertTitle>
              <AlertDescription>
                Your wallet balance is {formatAmount(walletData?.balance)} Birr. You need{' '}
                {formatAmount(totalAmount)} Birr to complete this purchase.
                <Button variant="link" className="p-0 h-auto ml-1" asChild>
                  <a href="/wallet/topup">Top up your wallet</a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={
                initiatePayment.isPending ||
                (selectedMethod === 'wallet' && hasInsufficientBalance)
              }
            >
              {initiatePayment.isPending
                ? 'Processing...'
                : selectedMethod === 'wallet'
                ? 'Pay with Wallet'
                : 'Proceed to Payment'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By proceeding, you agree to Azmera's terms and conditions. Your payment is secure and
              encrypted.
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedMethod !== 'wallet' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>External Payment</AlertTitle>
          <AlertDescription>
            You will be redirected to {selectedMethod === 'chapa' ? 'Chapa' : 'Telebirr'} to
            complete your payment securely.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
