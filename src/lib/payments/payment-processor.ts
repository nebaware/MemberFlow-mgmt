/**
 * Payment Processing System
 * Handles real-time payments, escrow, and commission calculations
 */

export interface PaymentDetails {
  amount: number;
  currency: string;
  buyerId: string;
  sellerId: string;
  productId?: string;
  serviceType?: 'product' | 'storage' | 'transportation' | 'tool_rental';
  transporterId?: string;
}

export interface PaymentBreakdown {
  totalAmount: number;
  platformCommission: number;
  paymentGatewayFee: number;
  sellerAmount: number;
  transporterAmount?: number;
  escrowAmount: number;
}

export interface Transaction {
  id: string;
  status: 'pending' | 'processing' | 'held_in_escrow' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  breakdown: PaymentBreakdown;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate platform commission based on service type
 */
export function calculateCommission(amount: number, serviceType: string): number {
  const commissionRates: Record<string, number> = {
    product: 0.05, // 5% for marketplace products
    storage: 0.10, // 10% for storage bookings
    transportation: 0.10, // 10% for transportation
    tool_rental: 0.10, // 10% for tool rentals
  };

  const rate = commissionRates[serviceType] || 0.05;
  const commission = amount * rate;
  
  // Minimum commission of 5 Birr
  return Math.max(commission, 5);
}

/**
 * Calculate payment gateway fee (typically 2%)
 */
export function calculateGatewayFee(amount: number): number {
  return amount * 0.02;
}

/**
 * Calculate payment breakdown
 */
export function calculatePaymentBreakdown(
  details: PaymentDetails
): PaymentBreakdown {
  const { amount, serviceType = 'product', transporterId } = details;
  
  // Calculate fees
  const platformCommission = calculateCommission(amount, serviceType);
  const paymentGatewayFee = calculateGatewayFee(amount);
  
  // For orders with transportation, split 80/20 between seller and transporter
  let sellerAmount = amount - platformCommission - paymentGatewayFee;
  let transporterAmount = 0;
  
  if (transporterId) {
    transporterAmount = sellerAmount * 0.20; // 20% to transporter
    sellerAmount = sellerAmount * 0.80; // 80% to seller
  }
  
  // Amount held in escrow (everything except platform commission and gateway fee)
  const escrowAmount = amount - platformCommission - paymentGatewayFee;
  
  return {
    totalAmount: amount,
    platformCommission,
    paymentGatewayFee,
    sellerAmount,
    transporterAmount,
    escrowAmount,
  };
}

/**
 * Process payment through selected gateway
 */
export async function processPayment(
  details: PaymentDetails,
  paymentMethod: 'telebirr' | 'cbe_birr' | 'bank_transfer'
): Promise<Transaction> {
  const breakdown = calculatePaymentBreakdown(details);
  
  // Generate transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate payment processing
  // In production, integrate with actual payment gateways
  const transaction: Transaction = {
    id: transactionId,
    status: 'processing',
    paymentMethod,
    breakdown,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  try {
    // Simulate API call to payment gateway
    await simulatePaymentGateway(paymentMethod, breakdown.totalAmount);
    
    // Move to escrow
    transaction.status = 'held_in_escrow';
    transaction.updatedAt = new Date();
    
    // Store transaction in database
    await storeTransaction(transaction, details);
    
    // Record platform revenue
    await recordPlatformRevenue({
      transactionId: transaction.id,
      revenueType: 'commission',
      amount: breakdown.platformCommission,
      serviceType: details.serviceType || 'product',
    });
    
    return transaction;
  } catch (error) {
    transaction.status = 'failed';
    transaction.updatedAt = new Date();
    throw error;
  }
}

/**
 * Simulate payment gateway processing
 */
async function simulatePaymentGateway(
  method: string,
  amount: number
): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 95% success rate
  if (Math.random() < 0.95) {
    return Promise.resolve();
  } else {
    throw new Error('Payment gateway error');
  }
}

/**
 * Store transaction in database
 */
async function storeTransaction(
  transaction: Transaction,
  details: PaymentDetails
): Promise<void> {
  // In production, store in actual database
  // For now, store in localStorage for demo
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.push({
    ...transaction,
    ...details,
  });
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Record platform revenue
 */
async function recordPlatformRevenue(revenue: {
  transactionId: string;
  revenueType: string;
  amount: number;
  serviceType: string;
}): Promise<void> {
  const revenues = JSON.parse(localStorage.getItem('platform_revenue') || '[]');
  revenues.push({
    ...revenue,
    currency: 'ETB',
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem('platform_revenue', JSON.stringify(revenues));
}

/**
 * Release payment from escrow after delivery confirmation
 */
export async function releaseEscrowPayment(
  transactionId: string
): Promise<void> {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const transaction = transactions.find((t: any) => t.id === transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status !== 'held_in_escrow') {
    throw new Error('Transaction not in escrow');
  }
  
  // Update transaction status
  transaction.status = 'completed';
  transaction.updatedAt = new Date().toISOString();
  
  // Update seller wallet
  await updateWallet(transaction.sellerId, transaction.breakdown.sellerAmount);
  
  // Update transporter wallet if applicable
  if (transaction.transporterId && transaction.breakdown.transporterAmount) {
    await updateWallet(transaction.transporterId, transaction.breakdown.transporterAmount);
  }
  
  // Save updated transactions
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Update user wallet balance
 */
async function updateWallet(userId: string, amount: number): Promise<void> {
  // In production, update actual database
  const wallets = JSON.parse(localStorage.getItem('wallets') || '{}');
  wallets[userId] = (wallets[userId] || 0) + amount;
  localStorage.setItem('wallets', JSON.stringify(wallets));
}

/**
 * Get platform revenue statistics
 */
export function getPlatformRevenue(): {
  total: number;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
} {
  const revenues = JSON.parse(localStorage.getItem('platform_revenue') || '[]');
  
  const total = revenues.reduce((sum: number, r: any) => sum + r.amount, 0);
  
  const byType: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  
  revenues.forEach((r: any) => {
    // By type
    byType[r.revenueType] = (byType[r.revenueType] || 0) + r.amount;
    
    // By month
    const month = new Date(r.createdAt).toISOString().slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + r.amount;
  });
  
  return { total, byType, byMonth };
}

/**
 * Get user transaction history
 */
export function getUserTransactions(userId: string): Transaction[] {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  return transactions.filter(
    (t: any) => t.buyerId === userId || t.sellerId === userId || t.transporterId === userId
  );
}

/**
 * Process refund
 */
export async function processRefund(transactionId: string): Promise<void> {
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const transaction = transactions.find((t: any) => t.id === transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status === 'completed') {
    throw new Error('Cannot refund completed transaction');
  }
  
  // Update transaction status
  transaction.status = 'refunded';
  transaction.updatedAt = new Date().toISOString();
  
  // Refund to buyer (minus gateway fee which is non-refundable)
  const refundAmount = transaction.breakdown.totalAmount - transaction.breakdown.paymentGatewayFee;
  await updateWallet(transaction.buyerId, refundAmount);
  
  // Save updated transactions
  localStorage.setItem('transactions', JSON.stringify(transactions));
}
