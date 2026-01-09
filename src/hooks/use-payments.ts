import { useMutation, useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface PaymentInitiationData {
  orderId: string;
  paymentMethod: 'chapa' | 'telebirr' | 'wallet';
  amount: number;
  deliveryFee?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface PaymentVerificationData {
  transactionRef: string;
  paymentMethod: string;
}

// Helper to create auth headers
function getAuthHeaders(user: any): Record<string, string> {
  if (!user) return {};

  const headers: Record<string, string> = {};
  if (user.id) headers['x-user-id'] = String(user.id);
  if (user.role) headers['x-user-role'] = String(user.role);
  if (user.email) headers['x-user-email'] = String(user.email);

  return headers as unknown as Record<string, string>;
}

/**
 * Initiate payment
 */
export function useInitiatePayment() {
  const { user } = useApp();
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: PaymentInitiationData) => {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(user),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Payment initiation failed');
      }

      return res.json();
    },
    onSuccess: (data) => {
      if (data.paymentMethod === 'wallet') {
        toast({
          title: 'Payment Successful',
          description: 'Payment completed using wallet balance',
        });
        router.push(`/orders/${data.transactionRef.replace('WALLET-', '')}`);
      } else if (data.checkoutUrl) {
        // Redirect to payment gateway
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: Error) => {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred during payment',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Verify payment
 */
export function useVerifyPayment() {
  const { user } = useApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: PaymentVerificationData) => {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(user),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Payment verification failed');
      }

      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Payment Verified',
          description: 'Your payment has been confirmed',
        });
      } else {
        toast({
          title: 'Payment Failed',
          description: data.error || 'Payment verification failed',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get user wallet balance
 */
export function useWalletBalance() {
  const { user } = useApp();

  return useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user) return { balance: 0, escrowBalance: 0 };

      const res = await fetch(`/api/users/${user.id}/wallet`, {
        headers: getAuthHeaders(user),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch wallet balance');
      }

      return res.json();
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Fresh for 30 seconds
  });
}

/**
 * Get payment history
 */
export function usePaymentHistory(userId?: string) {
  const { user } = useApp();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['payments', targetUserId],
    queryFn: async () => {
      const res = await fetch(`/api/payments/history?userId=${targetUserId}`, {
        headers: getAuthHeaders(user),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch payment history');
      }

      return res.json();
    },
    enabled: !!targetUserId,
  });
}

/**
 * Top up wallet
 */
export function useTopUpWallet() {
  const { user } = useApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(user),
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Top-up failed');
      }

      return res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to payment gateway for top-up
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: 'Top-up Initiated',
          description: 'Please complete the payment',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Top-up Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
