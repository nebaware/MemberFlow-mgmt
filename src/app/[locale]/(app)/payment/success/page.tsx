"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Package } from 'lucide-react';
import { useVerifyPayment } from '@/hooks/use-payments';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const verifyPayment = useVerifyPayment();

  const orderId = searchParams?.get('orderId');
  const txRef = searchParams?.get('tx_ref');
  const status = searchParams?.get('status');

  useEffect(() => {
    if (!orderId && !txRef) {
      setVerificationStatus('failed');
      return;
    }

    // Auto-verify payment
    const transactionRef = txRef || `ORD-${orderId}`;
    const paymentMethod = searchParams?.get('method') || 'chapa';

    verifyPayment.mutate(
      {
        transactionRef,
        paymentMethod,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setVerificationStatus('success');
          } else {
            setVerificationStatus('failed');
          }
        },
        onError: () => {
          setVerificationStatus('failed');
        },
      }
    );
  }, [orderId, txRef]);

  if (verificationStatus === 'loading') {
    return (
      <>
        <PageTitle title="Verifying Payment" description="Please wait..." />
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Verifying your payment...</h3>
              <p className="text-sm text-muted-foreground">
                This may take a few moments. Please don't close this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <>
        <PageTitle title="Payment Successful" description="Your order has been confirmed" />
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Your payment has been processed successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Order ID: <span className="font-mono font-semibold">{orderId}</span>
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">What's Next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Your order is now confirmed</li>
                <li>✓ Seller will prepare your items</li>
                <li>✓ You'll receive updates via notifications</li>
                <li>✓ Payment is held in escrow until delivery</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href={`/orders/${orderId}`}>
                  <Package className="mr-2 h-4 w-4" />
                  View Order Details
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/market">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Payment Failed" description="There was an issue with your payment" />
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              We couldn't process your payment. This could be due to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Insufficient funds</li>
              <li>• Payment was cancelled</li>
              <li>• Network connection issues</li>
              <li>• Invalid payment details</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={() => router.push(`/checkout?orderId=${orderId}`)}>
              Try Again
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/orders">View My Orders</Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            If you continue to experience issues, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
