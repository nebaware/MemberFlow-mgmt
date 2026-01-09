"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Smartphone, Building2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function PaymentGatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  
  const method = searchParams.get('method');
  const txId = searchParams.get('txId');
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');

  // Payment method details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const getMethodDetails = () => {
    switch (method) {
      case 'telebirr':
        return {
          name: 'Telebirr',
          icon: Smartphone,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          description: 'Mobile Money Payment',
        };
      case 'cbe_birr':
        return {
          name: 'CBE Birr',
          icon: Building2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Commercial Bank of Ethiopia',
        };
      case 'bank_transfer':
        return {
          name: 'Bank Transfer',
          icon: Building2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Direct Bank Transfer',
        };
      default:
        return {
          name: 'Payment',
          icon: CreditCard,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: 'Payment Gateway',
        };
    }
  };

  const methodDetails = getMethodDetails();
  const Icon = methodDetails.icon;

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Process payment through API
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount || '0'),
          currency: 'ETB',
          buyerId: 'buyer-' + Date.now(), // In production, use actual user ID
          sellerId: orderId || 'seller-demo',
          productId: orderId,
          serviceType: 'product',
          paymentMethod: method,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus('success');
        
        // Store transaction ID
        const realTxId = data.transaction.id;
        
        // Redirect back to callback URL after 2 seconds
        setTimeout(() => {
          router.push(`/payment/callback?status=success&txId=${realTxId}&method=${method}&amount=${amount}&breakdown=${encodeURIComponent(JSON.stringify(data.transaction.breakdown))}`);
        }, 2000);
      } else {
        setPaymentStatus('failed');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push(`/payment/callback?status=cancelled&txId=${txId}&method=${method}`);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
            <CardDescription>Your payment has been processed successfully</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Transaction ID: {txId}</p>
            <p className="text-2xl font-bold text-green-600">{amount} Birr</p>
            <p className="text-sm text-muted-foreground">Redirecting to confirmation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700">Payment Failed</CardTitle>
            <CardDescription>There was an error processing your payment</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Transaction ID: {txId}</p>
            <p className="text-sm text-muted-foreground">Please try again or use a different payment method</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => setPaymentStatus('pending')} className="flex-1">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${methodDetails.bgColor}`}>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full ${methodDetails.bgColor} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${methodDetails.color}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{methodDetails.name}</CardTitle>
              <CardDescription>{methodDetails.description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">Demo Payment Gateway</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment Details */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-semibold">{amount} Birr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transaction ID:</span>
              <span className="text-xs font-mono">{txId}</span>
            </div>
            {orderId && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Order ID:</span>
                <span className="text-xs">{orderId}</span>
              </div>
            )}
          </div>

          {/* Payment Form */}
          {method === 'telebirr' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+251 9XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pin">Telebirr PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          )}

          {method === 'cbe_birr' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="account">CBE Birr Account</Label>
                <Input
                  id="account"
                  type="text"
                  placeholder="Enter your account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            </div>
          )}

          {method === 'bank_transfer' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900">Bank Transfer Details:</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Bank:</span> Commercial Bank of Ethiopia</p>
                <p><span className="font-medium">Account Name:</span> Azmera Platform</p>
                <p><span className="font-medium">Account Number:</span> 1000123456789</p>
                <p><span className="font-medium">Reference:</span> {txId}</p>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Please include the reference number in your transfer description
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="font-semibold text-yellow-800 mb-1">Demo Mode</p>
            <p>This is a simulated payment gateway. No real money will be charged.</p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            disabled={processing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={processing}
            className="flex-1"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${amount} Birr`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Loading Payment Gateway...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentGatewayContent />
    </Suspense>
  );
}
