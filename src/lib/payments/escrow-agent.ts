/**
 * Escrow Payment Agent
 * Automated agent for managing escrow payments, releases, and disputes
 */

export interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  transporterId?: string;
  amount: number;
  status: 'held' | 'released' | 'disputed' | 'refunded';
  orderId: string;
  createdAt: Date;
  releaseConditions: ReleaseCondition[];
  autoReleaseDate?: Date;
}

export interface ReleaseCondition {
  type: 'delivery_confirmed' | 'time_elapsed' | 'manual_approval' | 'dispute_resolved';
  met: boolean;
  metAt?: Date;
}

export interface DisputeCase {
  id: string;
  transactionId: string;
  raisedBy: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved';
  resolution?: 'refund_buyer' | 'release_seller' | 'partial_refund';
  createdAt: Date;
}

/**
 * Escrow Agent - Manages automated escrow operations
 */
export class EscrowAgent {
  private static instance: EscrowAgent;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): EscrowAgent {
    if (!EscrowAgent.instance) {
      EscrowAgent.instance = new EscrowAgent();
    }
    return EscrowAgent.instance;
  }

  /**
   * Start the escrow agent monitoring
   */
  startMonitoring(intervalMs: number = 60000) {
    if (this.checkInterval) {
      return; // Already running
    }

    // Escrow monitoring started
    
    this.checkInterval = setInterval(() => {
      this.checkPendingEscrows();
    }, intervalMs);

    // Run immediately
    this.checkPendingEscrows();
  }

  /**
   * Stop the escrow agent
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      // Escrow monitoring stopped
    }
  }

  /**
   * Check all pending escrow transactions
   */
  private async checkPendingEscrows() {
    try {
      const escrows = this.getHeldEscrows();
      
      for (const escrow of escrows) {
        await this.evaluateEscrow(escrow);
      }
    } catch (error) {
      // Escrow check failed - will retry on next interval
    }
  }

  /**
   * Evaluate if escrow should be released
   */
  private async evaluateEscrow(escrow: EscrowTransaction) {
    // Check if all release conditions are met
    const allConditionsMet = escrow.releaseConditions.every(c => c.met);

    if (allConditionsMet) {
      await this.releaseEscrow(escrow.id, 'conditions_met');
      return;
    }

    // Check auto-release date
    if (escrow.autoReleaseDate && new Date() >= escrow.autoReleaseDate) {
      await this.releaseEscrow(escrow.id, 'auto_release');
      return;
    }

    // Check for disputes
    const dispute = this.getActiveDispute(escrow.id);
    if (dispute && dispute.status === 'resolved') {
      await this.handleDisputeResolution(escrow, dispute);
    }
  }

  /**
   * Hold payment in escrow
   */
  async holdInEscrow(params: {
    buyerId: string;
    sellerId: string;
    transporterId?: string;
    amount: number;
    orderId: string;
    autoReleaseDays?: number;
  }): Promise<EscrowTransaction> {
    const escrowId = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const autoReleaseDate = params.autoReleaseDays
      ? new Date(Date.now() + params.autoReleaseDays * 24 * 60 * 60 * 1000)
      : undefined;

    const escrow: EscrowTransaction = {
      id: escrowId,
      buyerId: params.buyerId,
      sellerId: params.sellerId,
      transporterId: params.transporterId,
      amount: params.amount,
      status: 'held',
      orderId: params.orderId,
      createdAt: new Date(),
      releaseConditions: [
        { type: 'delivery_confirmed', met: false },
      ],
      autoReleaseDate,
    };

    // Store in localStorage (in production, use database)
    this.saveEscrow(escrow);

    return escrow;
  }

  /**
   * Confirm delivery and check release conditions
   */
  async confirmDelivery(escrowId: string, confirmedBy: string): Promise<boolean> {
    const escrow = this.getEscrow(escrowId);
    
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'held') {
      throw new Error('Escrow not in held status');
    }

    // Update delivery condition
    const deliveryCondition = escrow.releaseConditions.find(
      c => c.type === 'delivery_confirmed'
    );

    if (deliveryCondition) {
      deliveryCondition.met = true;
      deliveryCondition.metAt = new Date();
    }

    this.saveEscrow(escrow);

    // Check if should release
    await this.evaluateEscrow(escrow);

    return true;
  }

  /**
   * Release escrow payment
   */
  async releaseEscrow(escrowId: string, reason: string): Promise<void> {
    const escrow = this.getEscrow(escrowId);
    
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'held') {
      throw new Error('Escrow not in held status');
    }

    // Calculate distribution
    const distribution = this.calculateDistribution(escrow);

    // Update wallets
    await this.updateWallet(escrow.sellerId, distribution.sellerAmount);
    
    if (escrow.transporterId && distribution.transporterAmount) {
      await this.updateWallet(escrow.transporterId, distribution.transporterAmount);
    }

    // Update escrow status
    escrow.status = 'released';
    this.saveEscrow(escrow);

    // Record release transaction
    this.recordEscrowRelease(escrow, reason);
  }

  /**
   * Raise a dispute
   */
  async raiseDispute(params: {
    transactionId: string;
    raisedBy: string;
    reason: string;
  }): Promise<DisputeCase> {
    const dispute: DisputeCase = {
      id: `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: params.transactionId,
      raisedBy: params.raisedBy,
      reason: params.reason,
      status: 'open',
      createdAt: new Date(),
    };

    this.saveDispute(dispute);

    return dispute;
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(
    disputeId: string,
    resolution: 'refund_buyer' | 'release_seller' | 'partial_refund',
    partialAmount?: number
  ): Promise<void> {
    const dispute = this.getDispute(disputeId);
    
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    this.saveDispute(dispute);

    const escrow = this.getEscrow(dispute.transactionId);
    if (escrow) {
      await this.handleDisputeResolution(escrow, dispute, partialAmount);
    }
  }

  /**
   * Handle dispute resolution
   */
  private async handleDisputeResolution(
    escrow: EscrowTransaction,
    dispute: DisputeCase,
    partialAmount?: number
  ): Promise<void> {
    switch (dispute.resolution) {
      case 'refund_buyer':
        await this.updateWallet(escrow.buyerId, escrow.amount);
        escrow.status = 'refunded';
        break;

      case 'release_seller':
        await this.releaseEscrow(escrow.id, 'dispute_resolved_seller');
        break;

      case 'partial_refund':
        if (partialAmount) {
          await this.updateWallet(escrow.buyerId, partialAmount);
          await this.updateWallet(escrow.sellerId, escrow.amount - partialAmount);
          escrow.status = 'released';
        }
        break;
    }

    this.saveEscrow(escrow);
  }

  /**
   * Calculate payment distribution
   */
  private calculateDistribution(escrow: EscrowTransaction): {
    sellerAmount: number;
    transporterAmount: number;
    platformFee: number;
  } {
    const platformFeeRate = 0.05; // 5% platform fee
    const platformFee = escrow.amount * platformFeeRate;
    const netAmount = escrow.amount - platformFee;

    if (escrow.transporterId) {
      // 80% to seller, 20% to transporter
      return {
        sellerAmount: netAmount * 0.8,
        transporterAmount: netAmount * 0.2,
        platformFee,
      };
    }

    return {
      sellerAmount: netAmount,
      transporterAmount: 0,
      platformFee,
    };
  }

  /**
   * Get escrow from storage
   */
  private getEscrow(escrowId: string): EscrowTransaction | null {
    if (typeof window === 'undefined') return null;
    
    const escrows = JSON.parse(localStorage.getItem('escrow_transactions') || '[]');
    return escrows.find((e: EscrowTransaction) => e.id === escrowId) || null;
  }

  /**
   * Get all held escrows
   */
  private getHeldEscrows(): EscrowTransaction[] {
    if (typeof window === 'undefined') return [];
    
    const escrows = JSON.parse(localStorage.getItem('escrow_transactions') || '[]');
    return escrows.filter((e: EscrowTransaction) => e.status === 'held');
  }

  /**
   * Save escrow to storage
   */
  private saveEscrow(escrow: EscrowTransaction): void {
    if (typeof window === 'undefined') return;
    
    const escrows = JSON.parse(localStorage.getItem('escrow_transactions') || '[]');
    const index = escrows.findIndex((e: EscrowTransaction) => e.id === escrow.id);
    
    if (index >= 0) {
      escrows[index] = escrow;
    } else {
      escrows.push(escrow);
    }
    
    localStorage.setItem('escrow_transactions', JSON.stringify(escrows));
  }

  /**
   * Get dispute
   */
  private getDispute(disputeId: string): DisputeCase | null {
    if (typeof window === 'undefined') return null;
    
    const disputes = JSON.parse(localStorage.getItem('escrow_disputes') || '[]');
    return disputes.find((d: DisputeCase) => d.id === disputeId) || null;
  }

  /**
   * Get active dispute for transaction
   */
  private getActiveDispute(transactionId: string): DisputeCase | null {
    if (typeof window === 'undefined') return null;
    
    const disputes = JSON.parse(localStorage.getItem('escrow_disputes') || '[]');
    return disputes.find(
      (d: DisputeCase) => d.transactionId === transactionId && d.status !== 'resolved'
    ) || null;
  }

  /**
   * Save dispute
   */
  private saveDispute(dispute: DisputeCase): void {
    if (typeof window === 'undefined') return;
    
    const disputes = JSON.parse(localStorage.getItem('escrow_disputes') || '[]');
    const index = disputes.findIndex((d: DisputeCase) => d.id === dispute.id);
    
    if (index >= 0) {
      disputes[index] = dispute;
    } else {
      disputes.push(dispute);
    }
    
    localStorage.setItem('escrow_disputes', JSON.stringify(disputes));
  }

  /**
   * Update wallet balance
   */
  private async updateWallet(userId: string, amount: number): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const wallets = JSON.parse(localStorage.getItem('wallets') || '{}');
    wallets[userId] = (wallets[userId] || 0) + amount;
    localStorage.setItem('wallets', JSON.stringify(wallets));
  }

  /**
   * Record escrow release transaction
   */
  private recordEscrowRelease(escrow: EscrowTransaction, reason: string): void {
    if (typeof window === 'undefined') return;
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      id: `TXN-${Date.now()}`,
      type: 'EscrowRelease',
      escrowId: escrow.id,
      amount: escrow.amount,
      reason,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  /**
   * Get escrow statistics
   */
  getStatistics(): {
    totalHeld: number;
    totalReleased: number;
    totalDisputed: number;
    activeEscrows: number;
  } {
    if (typeof window === 'undefined') {
      return { totalHeld: 0, totalReleased: 0, totalDisputed: 0, activeEscrows: 0 };
    }
    
    const escrows = JSON.parse(localStorage.getItem('escrow_transactions') || '[]');
    
    return {
      totalHeld: escrows.filter((e: EscrowTransaction) => e.status === 'held').length,
      totalReleased: escrows.filter((e: EscrowTransaction) => e.status === 'released').length,
      totalDisputed: escrows.filter((e: EscrowTransaction) => e.status === 'disputed').length,
      activeEscrows: escrows.filter((e: EscrowTransaction) => e.status === 'held').length,
    };
  }
}

// Export singleton instance
export const escrowAgent = EscrowAgent.getInstance();
