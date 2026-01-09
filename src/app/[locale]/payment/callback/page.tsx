"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Shield, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [processing, setProcessing] = useState(true);
  const [escrowConfirmed, setEscrowConfirmed] = useState(false);
  
  const status = searchParams.get('status');
  const txId = searchParams.get('txId');
  const method = searchParams.get('method');
  const amount = searchParams.get('amount');
  const breakdownParam = searchParams.get('breakdown');
  
  const breakdown = breakdownParam ? JSON.parse(decodeURIComponent(breakdownParam)) : null;

  useEffect(() => {
    if (status === 'success') {
      // Simulate escrow confirmation
      setTimeout(() => {
        setProcessing(false);
        setEscrowConfirmed(true);
        
        toast({
          title: "Payment Confirmed!",
          description: "Your payment has been secured in escrow and will be released upon delivery confirmation.",
          action: <Shield className="text-green-500" />,
        });
      }, 2000);
    } else {
      setProcessing(false);
    }
  }, [status, toast]);

  const handleContinue = () => {
    // Redirect to appropriate page based on context
    router.push('/orders');
  };

  const handleRetry = () => {
    router.back();
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Processing Payment</CardTitle>
            <CardDescription>Confirming your payment and securing funds in escrow...</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Transaction ID: {txId}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure Escrow Protection</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success' && escrowConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Payment Secured in Escrow!</CardTitle>
            <CardDescription>Your payment has been successfully processed and secured</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Payment Details */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="font-semibold text-green-600">{amount} Birr</span>
              </div>
              {breakdown && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Platform Fee (5%):</span>
                    <span className="text-red-600">-{breakdown.platformCommission.toFixed(2)} Birr</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Payment Gateway Fee:</span>
                    <span className="text-red-600">-{breakdown.paymentGatewayFee.toFixed(2)} Birr</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-sm font-medium">Seller Receives:</span>
                    <span className="font-bold text-green-600">{breakdown.sellerAmount.toFixed(2)} Birr</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{method?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID:</span>
                <span className="text-xs font-mono">{txId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                  <Shield className="h-4 w-4" />
                  Held in Escrow
                </span>
              </div>
            </div>

            {/* Escrow Information */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-900 text-sm">Secure Escrow Protection</p>
                  <p className="text-xs text-blue-700">
                    Your payment is now held securely in escrow. The funds will be released to the seller and transporter only after you confirm successful delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-2">
              <p className="font-semibold text-sm">Next Steps:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Seller will prepare your order</li>
                <li>Transporter will pick up and deliver</li>
                <li>You confirm delivery in "My Orders"</li>
                <li>Payment is released from escrow</li>
              </ol>
            </div>
          </CardContent>

          <CardFooter>
            <Button onClick={handleContinue} className="w-full">
              View My Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === 'cancelled' || status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700">
              {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'cancelled' 
                ? 'You cancelled the payment process' 
                : 'There was an error processing your payment'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID:</span>
                <span className="text-xs font-mono">{txId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{method?.replace('_', ' ')}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {status === 'cancelled' 
                ? 'No charges were made to your account.' 
                : 'Please try again or use a different payment method.'}
            </p>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
              Go to Dashboard
            </Button>
            <Button onClick={handleRetry} className="flex-1">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
