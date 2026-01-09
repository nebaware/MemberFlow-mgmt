import { dbQuery } from '@/lib/db/db';

export interface GroupPurchaseParams {
  productId: number;
  organizerId: number;
  title: string;
  description?: string;
  totalQuantity: number;
  minQuantityPerBuyer: number;
  maxQuantityPerBuyer?: number;
  unitPrice: number;
  targetParticipants: number;
  deadline: Date;
  deliveryLocation?: string;
  deliveryInstructions?: string;
  groupDiscountPercentage?: number;
}

export interface JoinGroupParams {
  groupPurchaseId: number;
  buyerId: number;
  quantity: number;
  deliveryPreference?: string;
  notes?: string;
}

export interface GroupPurchaseStatus {
  id: number;
  status: string;
  currentParticipants: number;
  targetParticipants: number;
  totalCommittedQuantity: number;
  totalQuantity: number;
  deadline: Date;
  isExpired: boolean;
  isFull: boolean;
  canJoin: boolean;
  remainingQuantity: number;
  remainingSlots: number;
  minQuantityPerBuyer: number;
  maxQuantityPerBuyer?: number;
}

export class GroupPurchaseManager {

  /**
   * Create a new group purchase
   */
  async createGroupPurchase(params: GroupPurchaseParams): Promise<{ success: boolean; groupPurchaseId?: number; error?: string }> {
    try {
      // Validate product exists and has sufficient stock
      const product = await dbQuery(
        'SELECT * FROM products WHERE id = $1 AND stock_quantity >= $2',
        [params.productId, params.totalQuantity]
      );

      if (!product.length) {
        return { success: false, error: 'Product not found or insufficient stock' };
      }

      // Validate organizer
      const organizer = await dbQuery(
        'SELECT * FROM users WHERE id = $1 AND verification_level = $2',
        [params.organizerId, 'verified']
      );

      if (!organizer.length) {
        return { success: false, error: 'Organizer must be a verified user' };
      }

      // Calculate completion deadline (7 days after group is full)
      const completionDeadline = new Date(params.deadline);
      completionDeadline.setDate(completionDeadline.getDate() + 7);

      // Create group purchase
      const result = await dbQuery(
        `INSERT INTO group_purchases (
          product_id, organizer_id, title, description, total_quantity,
          min_quantity_per_buyer, max_quantity_per_buyer, unit_price,
          target_participants, deadline, completion_deadline,
          delivery_location, delivery_instructions, group_discount_percentage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          params.productId,
          params.organizerId,
          params.title,
          params.description || null,
          params.totalQuantity,
          params.minQuantityPerBuyer,
          params.maxQuantityPerBuyer || null,
          params.unitPrice,
          params.targetParticipants,
          params.deadline,
          completionDeadline,
          params.deliveryLocation || null,
          params.deliveryInstructions || null,
          params.groupDiscountPercentage || 0
        ]
      );

      const groupPurchaseId = result[0].id;

      // Create system message
      await this.createSystemMessage(
        groupPurchaseId,
        `Group purchase "${params.title}" has been created! Looking for ${params.targetParticipants} participants to buy ${params.totalQuantity}kg total.`
      );

      // Notify potential buyers based on their preferences
      await this.notifyPotentialBuyers(groupPurchaseId, params.productId);

      return { success: true, groupPurchaseId };

    } catch (error: any) {
      console.error('Create group purchase error:', error);
      return { success: false, error: error.message || 'Failed to create group purchase' };
    }
  }

  /**
   * Join a group purchase
   */
  async joinGroupPurchase(params: JoinGroupParams): Promise<{ success: boolean; participantId?: number; error?: string }> {
    try {
      // Get group purchase details
      const groupPurchase = await this.getGroupPurchaseStatus(params.groupPurchaseId);
      if (!groupPurchase) {
        return { success: false, error: 'Group purchase not found' };
      }

      // Validate can join
      if (!groupPurchase.canJoin) {
        return { success: false, error: 'Cannot join this group purchase' };
      }

      // Validate quantity limits
      if (params.quantity < groupPurchase.minQuantityPerBuyer) {
        return { success: false, error: `Minimum quantity is ${groupPurchase.minQuantityPerBuyer}kg` };
      }

      if (groupPurchase.maxQuantityPerBuyer && params.quantity > groupPurchase.maxQuantityPerBuyer) {
        return { success: false, error: `Maximum quantity is ${groupPurchase.maxQuantityPerBuyer}kg` };
      }

      // Check if quantity would exceed total
      if (groupPurchase.totalCommittedQuantity + params.quantity > groupPurchase.totalQuantity) {
        const remaining = groupPurchase.totalQuantity - groupPurchase.totalCommittedQuantity;
        return { success: false, error: `Only ${remaining}kg remaining in this group purchase` };
      }

      // Check if user already joined
      const existingParticipant = await dbQuery(
        'SELECT id FROM group_purchase_participants WHERE group_purchase_id = $1 AND buyer_id = $2',
        [params.groupPurchaseId, params.buyerId]
      );

      if (existingParticipant.length > 0) {
        return { success: false, error: 'You have already joined this group purchase' };
      }

      // Get group purchase details for pricing
      const groupDetails = await dbQuery(
        'SELECT unit_price, group_discount_percentage FROM group_purchases WHERE id = $1',
        [params.groupPurchaseId]
      );

      const unitPrice = groupDetails[0].unit_price;
      const discountPercentage = groupDetails[0].group_discount_percentage || 0;
      const discountedPrice = unitPrice * (1 - discountPercentage / 100);
      const totalAmount = params.quantity * discountedPrice;

      // Set payment deadline (24 hours from now)
      const paymentDeadline = new Date();
      paymentDeadline.setHours(paymentDeadline.getHours() + 24);

      // Add participant
      const result = await dbQuery(
        `INSERT INTO group_purchase_participants (
          group_purchase_id, buyer_id, quantity, unit_price, total_amount,
          delivery_preference, notes, payment_deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          params.groupPurchaseId,
          params.buyerId,
          params.quantity,
          discountedPrice,
          totalAmount,
          params.deliveryPreference || null,
          params.notes || null,
          paymentDeadline
        ]
      );

      const participantId = result[0].id;

      // Create escrow hold for payment
      await this.createEscrowHold(participantId, params.buyerId, totalAmount);

      // Create system message
      const user = await dbQuery('SELECT name FROM users WHERE id = $1', [params.buyerId]);
      await this.createSystemMessage(
        params.groupPurchaseId,
        `${user[0].name} joined the group purchase with ${params.quantity}kg!`
      );

      // Notify other participants
      await this.notifyGroupParticipants(
        params.groupPurchaseId,
        'new_participant',
        'New Participant Joined',
        `${user[0].name} has joined the group purchase. ${groupPurchase.remainingSlots - 1} spots remaining.`,
        params.buyerId
      );

      return { success: true, participantId };

    } catch (error: any) {
      console.error('Join group purchase error:', error);
      return { success: false, error: error.message || 'Failed to join group purchase' };
    }
  }

  /**
   * Process payment for group purchase participant
   */
  async processParticipantPayment(participantId: number, paymentTransactionId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Update participant payment status
      await dbQuery(
        `UPDATE group_purchase_participants SET 
          payment_status = 'held',
          payment_transaction_id = $1
         WHERE id = $2`,
        [paymentTransactionId, participantId]
      );

      // Check if group is now full and all payments are held
      const participant = await dbQuery(
        'SELECT group_purchase_id FROM group_purchase_participants WHERE id = $1',
        [participantId]
      );

      const groupPurchaseId = participant[0].group_purchase_id;

      // Check if group is ready for completion
      const readyForCompletion = await this.checkGroupReadyForCompletion(groupPurchaseId);
      if (readyForCompletion) {
        await this.completeGroupPurchase(groupPurchaseId);
      }

      return { success: true };

    } catch (error: any) {
      console.error('Process participant payment error:', error);
      return { success: false, error: error.message || 'Failed to process payment' };
    }
  }

  /**
   * Complete a group purchase
   */
  async completeGroupPurchase(groupPurchaseId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get group purchase details
      const groupPurchase = await dbQuery(
        `SELECT gp.*, p.farmer_id, p.name as product_name
         FROM group_purchases gp
         JOIN products p ON gp.product_id = p.id
         WHERE gp.id = $1`,
        [groupPurchaseId]
      );

      if (!groupPurchase.length) {
        return { success: false, error: 'Group purchase not found' };
      }

      const group = groupPurchase[0];

      // Get all participants with held payments
      const participants = await dbQuery(
        `SELECT gpp.*, u.name as buyer_name, u.email as buyer_email
         FROM group_purchase_participants gpp
         JOIN users u ON gpp.buyer_id = u.id
         WHERE gpp.group_purchase_id = $1 AND gpp.payment_status = 'held'`,
        [groupPurchaseId]
      );

      if (participants.length === 0) {
        return { success: false, error: 'No participants with held payments' };
      }

      // Create individual orders for each participant
      const orderIds = [];
      for (const participant of participants) {
        const orderResult = await dbQuery(
          `INSERT INTO orders (
            product_id, buyer_id, seller_id, quantity, total_price,
            status, delivery_address, pickup_location, payment_method
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id`,
          [
            group.product_id,
            participant.buyer_id,
            group.farmer_id,
            participant.quantity,
            participant.total_amount,
            'PaymentCompleted',
            participant.delivery_preference || group.delivery_location,
            group.delivery_location,
            'GroupPurchase'
          ]
        );

        orderIds.push(orderResult[0].id);

        // Update participant payment status
        await dbQuery(
          'UPDATE group_purchase_participants SET payment_status = $1 WHERE id = $2',
          ['paid', participant.id]
        );

        // Release escrow payment to seller
        await this.releaseEscrowPayment(participant.id, group.farmer_id);
      }

      // Update group purchase status
      await dbQuery(
        'UPDATE group_purchases SET status = $1, updated_at = NOW() WHERE id = $2',
        ['completed', groupPurchaseId]
      );

      // Update product stock
      await dbQuery(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [group.total_committed_quantity, group.product_id]
      );

      // Create completion message
      await this.createSystemMessage(
        groupPurchaseId,
        `🎉 Group purchase completed successfully! ${participants.length} orders have been created and payments processed.`
      );

      // Notify all participants
      await this.notifyGroupParticipants(
        groupPurchaseId,
        'completion',
        'Group Purchase Completed!',
        `Your group purchase for ${group.product_name} has been completed. Individual orders have been created and you will receive delivery updates soon.`
      );

      return { success: true };

    } catch (error: any) {
      console.error('Complete group purchase error:', error);
      return { success: false, error: error.message || 'Failed to complete group purchase' };
    }
  }

  /**
   * Cancel a group purchase
   */
  async cancelGroupPurchase(groupPurchaseId: number, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get participants with held payments
      const participants = await dbQuery(
        'SELECT * FROM group_purchase_participants WHERE group_purchase_id = $1 AND payment_status = $2',
        [groupPurchaseId, 'held']
      );

      // Refund all participants
      for (const participant of participants) {
        await dbQuery(
          'UPDATE group_purchase_participants SET payment_status = $1 WHERE id = $2',
          ['refunded', participant.id]
        );

        // Process refund transaction
        await this.processRefund(participant.id, participant.total_amount);
      }

      // Update group purchase status
      await dbQuery(
        'UPDATE group_purchases SET status = $1, updated_at = NOW() WHERE id = $2',
        ['cancelled', groupPurchaseId]
      );

      // Create cancellation message
      await this.createSystemMessage(
        groupPurchaseId,
        `❌ Group purchase has been cancelled. Reason: ${reason}. All payments have been refunded.`
      );

      // Notify all participants
      await this.notifyGroupParticipants(
        groupPurchaseId,
        'cancellation',
        'Group Purchase Cancelled',
        `The group purchase has been cancelled: ${reason}. Your payment has been refunded and will appear in your account within 3-5 business days.`
      );

      return { success: true };

    } catch (error: any) {
      console.error('Cancel group purchase error:', error);
      return { success: false, error: error.message || 'Failed to cancel group purchase' };
    }
  }

  /**
   * Get group purchase status
   */
  async getGroupPurchaseStatus(groupPurchaseId: number): Promise<GroupPurchaseStatus | null> {
    try {
      const result = await dbQuery(
        `SELECT gp.*, p.name as product_name, p.stock_quantity
         FROM group_purchases gp
         JOIN products p ON gp.product_id = p.id
         WHERE gp.id = $1`,
        [groupPurchaseId]
      );

      if (!result.length) return null;

      const group = result[0];
      const now = new Date();
      const deadline = new Date(group.deadline);

      const isExpired = deadline < now;
      const isFull = group.current_participants >= group.target_participants;
      const canJoin = !isExpired && !isFull && group.status === 'open';
      const remainingQuantity = group.total_quantity - group.total_committed_quantity;
      const remainingSlots = group.target_participants - group.current_participants;

      return {
        id: group.id,
        status: group.status,
        currentParticipants: group.current_participants,
        targetParticipants: group.target_participants,
        totalCommittedQuantity: group.total_committed_quantity,
        totalQuantity: group.total_quantity,
        deadline,
        isExpired,
        isFull,
        canJoin,
        remainingQuantity,
        remainingSlots,
        minQuantityPerBuyer: group.min_quantity_per_buyer,
        maxQuantityPerBuyer: group.max_quantity_per_buyer
      };

    } catch (error: any) {
      console.error('Get group purchase status error:', error);
      return null;
    }
  }

  /**
   * Find matching group purchases for a buyer
   */
  async findMatchingGroupPurchases(buyerId: number, filters: {
    category?: string;
    maxPrice?: number;
    location?: string;
    maxQuantity?: number;
  } = {}): Promise<any[]> {
    try {
      let query = `
        SELECT gp.*, p.name as product_name, p.category, p.location,
               u.name as organizer_name, u.verification_level as organizer_verification,
               (gp.target_participants - gp.current_participants) as remaining_slots,
               (gp.total_quantity - gp.total_committed_quantity) as remaining_quantity
        FROM group_purchases gp
        JOIN products p ON gp.product_id = p.id
        JOIN users u ON gp.organizer_id = u.id
        WHERE gp.status = 'open' AND gp.deadline > NOW()
        AND gp.id NOT IN (
          SELECT group_purchase_id FROM group_purchase_participants WHERE buyer_id = $1
        )
      `;

      const params: any[] = [buyerId];
      let paramIndex = 2;

      if (filters.category) {
        query += ` AND p.category = $${paramIndex}`;
        params.push(filters.category);
        paramIndex++;
      }

      if (filters.maxPrice) {
        query += ` AND gp.unit_price <= $${paramIndex}`;
        params.push(filters.maxPrice);
        paramIndex++;
      }

      if (filters.location) {
        query += ` AND (p.location ILIKE $${paramIndex} OR gp.delivery_location ILIKE $${paramIndex})`;
        params.push(`%${filters.location}%`);
        paramIndex++;
      }

      if (filters.maxQuantity) {
        query += ` AND gp.min_quantity_per_buyer <= $${paramIndex}`;
        params.push(filters.maxQuantity);
        paramIndex++;
      }

      query += ` ORDER BY gp.deadline ASC, gp.current_participants DESC LIMIT 20`;

      const results = await dbQuery(query, params);
      return results;

    } catch (error: any) {
      console.error('Find matching group purchases error:', error);
      return [];
    }
  }

  // Helper methods

  private async createSystemMessage(groupPurchaseId: number, content: string) {
    await dbQuery(
      `INSERT INTO group_purchase_messages (group_purchase_id, message_type, content, is_system_message)
       VALUES ($1, $2, $3, $4)`,
      [groupPurchaseId, 'system', content, true]
    );
  }

  private async notifyGroupParticipants(
    groupPurchaseId: number,
    notificationType: string,
    title: string,
    message: string,
    excludeUserId?: number
  ) {
    const participants = await dbQuery(
      `SELECT DISTINCT buyer_id FROM group_purchase_participants 
       WHERE group_purchase_id = $1 ${excludeUserId ? 'AND buyer_id != $2' : ''}`,
      excludeUserId ? [groupPurchaseId, excludeUserId] : [groupPurchaseId]
    );

    for (const participant of participants) {
      await dbQuery(
        `INSERT INTO group_purchase_notifications (group_purchase_id, user_id, notification_type, title, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [groupPurchaseId, participant.buyer_id, notificationType, title, message]
      );
    }
  }

  private async notifyPotentialBuyers(groupPurchaseId: number, productId: number) {
    // Get product details
    const product = await dbQuery('SELECT category, location FROM products WHERE id = $1', [productId]);
    if (!product.length) return;

    // Find buyers with matching preferences
    const matchingBuyers = await dbQuery(
      `SELECT user_id FROM buyer_matching_preferences 
       WHERE preferred_categories @> $1 OR preferred_categories = '[]'`,
      [JSON.stringify([product[0].category])]
    );

    // Notify matching buyers
    for (const buyer of matchingBuyers) {
      await dbQuery(
        `INSERT INTO group_purchase_notifications (group_purchase_id, user_id, notification_type, title, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          groupPurchaseId,
          buyer.user_id,
          'new_group_available',
          'New Group Purchase Available',
          `A new group purchase for ${product[0].category} is available in ${product[0].location}. Join now to get bulk pricing!`
        ]
      );
    }
  }

  private async createEscrowHold(participantId: number, buyerId: number, amount: number) {
    // Create escrow transaction (simplified - integrate with actual payment system)
    const escrowResult = await dbQuery(
      `INSERT INTO transactions (user_id, type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [buyerId, 'EscrowHold', amount, `Group purchase escrow hold for participant ${participantId}`, 'Pending']
    );

    // Update participant with escrow transaction
    await dbQuery(
      'UPDATE group_purchase_participants SET escrow_transaction_id = $1 WHERE id = $2',
      [escrowResult[0].id, participantId]
    );
  }

  private async releaseEscrowPayment(participantId: number, sellerId: number) {
    // Get participant details
    const participant = await dbQuery(
      'SELECT * FROM group_purchase_participants WHERE id = $1',
      [participantId]
    );

    if (!participant.length) return;

    // Release escrow to seller
    await dbQuery(
      `INSERT INTO transactions (user_id, type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        sellerId,
        'EscrowRelease',
        participant[0].total_amount,
        `Group purchase payment for participant ${participantId}`,
        'Completed'
      ]
    );

    // Update escrow transaction status
    if (participant[0].escrow_transaction_id) {
      await dbQuery(
        'UPDATE transactions SET status = $1 WHERE id = $2',
        ['Completed', participant[0].escrow_transaction_id]
      );
    }
  }

  private async processRefund(participantId: number, amount: number) {
    const participant = await dbQuery(
      'SELECT buyer_id FROM group_purchase_participants WHERE id = $1',
      [participantId]
    );

    if (!participant.length) return;

    // Create refund transaction
    await dbQuery(
      `INSERT INTO transactions (user_id, type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        participant[0].buyer_id,
        'Refund',
        amount,
        `Group purchase refund for participant ${participantId}`,
        'Completed'
      ]
    );
  }

  private async checkGroupReadyForCompletion(groupPurchaseId: number): Promise<boolean> {
    const result = await dbQuery(
      `SELECT 
         gp.target_participants,
         COUNT(gpp.id) as paid_participants
       FROM group_purchases gp
       LEFT JOIN group_purchase_participants gpp ON gp.id = gpp.group_purchase_id AND gpp.payment_status = 'held'
       WHERE gp.id = $1
       GROUP BY gp.target_participants`,
      [groupPurchaseId]
    );

    if (!result.length) return false;

    return result[0].paid_participants >= result[0].target_participants;
  }
}

export const groupPurchaseManager = new GroupPurchaseManager();