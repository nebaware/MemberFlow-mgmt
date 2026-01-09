/**
 * Payment Provider Integration for Azmera Platform
 * Supports: Chapa, Telebirr, Stripe (for international)
 */

import axios from 'axios';
import { logger } from '@/lib/logger';

// Payment provider types
export type PaymentProvider = 'chapa' | 'telebirr' | 'stripe' | 'wallet';

export interface PaymentInitiationRequest {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  orderId: string;
  returnUrl: string;
  callbackUrl: string;
  description?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  checkoutUrl?: string;
  transactionRef?: string;
  error?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: 'success' | 'failed' | 'pending';
  amount?: number;
  currency?: string;
  transactionRef?: string;
  error?: string;
}

/**
 * Chapa Payment Gateway (Ethiopian)
 * https://chapa.co
 */
export class ChapaProvider {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = process.env.CHAPA_SECRET_KEY || '';
    this.baseUrl = 'https://api.chapa.co/v1';
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    try {
      logger.payment('Chapa initiate', {
        orderId: request.orderId,
        amount: request.amount,
        payload: {
          amount: request.amount,
          currency: request.currency,
          email: request.email,
          first_name: request.firstName,
          last_name: request.lastName,
          tx_ref: request.orderId,
        }
      });

      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: request.amount,
          currency: request.currency,
          email: request.email,
          first_name: request.firstName,
          last_name: request.lastName,
          phone_number: request.phoneNumber,
          tx_ref: request.orderId,
          callback_url: request.callbackUrl,
          return_url: request.returnUrl,
          customization: {
            title: 'Azmera AgriTech',
            description: request.description || 'Product Purchase',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.debug('Chapa response received', { status: response.data.status });

      if (response.data.status === 'success') {
        return {
          success: true,
          checkoutUrl: response.data.data.checkout_url,
          transactionRef: request.orderId,
        };
      }

      // console.log('🟡 Chapa Non-Success:', response.data);
      return {
        success: false,
        error: response.data.message || 'Payment initiation failed',
      };
    } catch (error: any) {
      logger.error('Chapa payment initiation failed', {
        error: error.message,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      // Extract the most specific error message
      let errorMessage = 'Payment initiation failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async verifyPayment(transactionRef: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${transactionRef}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      if (response.data.status === 'success') {
        const data = response.data.data;
        return {
          success: true,
          status: data.status === 'success' ? 'success' : 'failed',
          amount: parseFloat(data.amount),
          currency: data.currency,
          transactionRef: data.tx_ref,
        };
      }

      return {
        success: false,
        status: 'failed',
        error: response.data.message || 'Verification failed',
      };
    } catch (error: any) {
      logger.error('Chapa verification failed', error);
      return {
        success: false,
        status: 'failed',
        error: error.response?.data?.message || error.message || 'Verification failed',
      };
    }
  }
}

/**
 * Telebirr Payment Gateway (Ethiopian)
 * https://www.ethiotelecom.et/telebirr/
 */
export class TelebirrProvider {
  private appId: string;
  private appKey: string;
  private baseUrl: string;

  constructor() {
    this.appId = process.env.TELEBIRR_APP_ID || '';
    this.appKey = process.env.TELEBIRR_APP_KEY || '';
    this.baseUrl = process.env.TELEBIRR_BASE_URL || 'https://app.ethiotelecom.et:9443/ammapi';
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    try {
      // Telebirr requires specific payload format
      const payload = {
        appId: this.appId,
        nonce: this.generateNonce(),
        notifyUrl: request.callbackUrl,
        outTradeNo: request.orderId,
        returnUrl: request.returnUrl,
        subject: request.description || 'Azmera Product Purchase',
        timeoutExpress: '30', // 30 minutes
        totalAmount: request.amount.toString(),
        timestamp: Date.now().toString(),
      };

      // Sign the payload
      const signature = this.signPayload(payload);

      const response = await axios.post(
        `${this.baseUrl}/payment/v1/merchant/preOrder`,
        {
          ...payload,
          sign: signature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.code === '0') {
        return {
          success: true,
          checkoutUrl: response.data.data.toPayUrl,
          transactionRef: request.orderId,
        };
      }

      return {
        success: false,
        error: response.data.msg || 'Payment initiation failed',
      };
    } catch (error: any) {
      logger.error('Telebirr initiation failed', error);
      return {
        success: false,
        error: error.response?.data?.msg || error.message || 'Payment initiation failed',
      };
    }
  }

  async verifyPayment(transactionRef: string): Promise<PaymentVerificationResponse> {
    try {
      const payload = {
        appId: this.appId,
        nonce: this.generateNonce(),
        outTradeNo: transactionRef,
        timestamp: Date.now().toString(),
      };

      const signature = this.signPayload(payload);

      const response = await axios.post(
        `${this.baseUrl}/payment/v1/merchant/query`,
        {
          ...payload,
          sign: signature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.code === '0') {
        const data = response.data.data;
        return {
          success: true,
          status: data.tradeStatus === 'TRADE_SUCCESS' ? 'success' : 'failed',
          amount: parseFloat(data.totalAmount),
          currency: 'ETB',
          transactionRef: data.outTradeNo,
        };
      }

      return {
        success: false,
        status: 'failed',
        error: response.data.msg || 'Verification failed',
      };
    } catch (error: any) {
      logger.error('Telebirr verification failed', error);
      return {
        success: false,
        status: 'failed',
        error: error.response?.data?.msg || error.message || 'Verification failed',
      };
    }
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private signPayload(payload: any): string {
    // Implement HMAC-SHA256 signature
    const crypto = require('crypto');
    const sortedKeys = Object.keys(payload).sort();
    const signString = sortedKeys.map(key => `${key}=${payload[key]}`).join('&');
    return crypto.createHmac('sha256', this.appKey).update(signString).digest('hex');
  }
}

/**
 * Wallet Payment (Internal)
 * Uses platform wallet balance
 */
export class WalletProvider {
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    // Wallet payments are instant, no checkout URL needed
    return {
      success: true,
      transactionRef: `WALLET-${request.orderId}`,
    };
  }

  async verifyPayment(transactionRef: string): Promise<PaymentVerificationResponse> {
    // Wallet payments are instant, already verified
    return {
      success: true,
      status: 'success',
      transactionRef,
    };
  }

  async processPayment(userId: string, amount: number, orderId: string): Promise<PaymentVerificationResponse> {
    // This will be handled by the wallet API endpoint
    return {
      success: true,
      status: 'success',
      amount,
      currency: 'ETB',
      transactionRef: orderId,
    };
  }
}

/**
 * Payment Provider Factory
 */
export function getPaymentProvider(provider: PaymentProvider) {
  switch (provider) {
    case 'chapa':
      return new ChapaProvider();
    case 'telebirr':
      return new TelebirrProvider();
    case 'wallet':
      return new WalletProvider();
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}

/**
 * Calculate payment breakdown with commission
 */
export function calculatePaymentBreakdown(
  subtotal: number,
  deliveryFee: number = 0,
  commissionRate: number = 0.05
) {
  // Safely parse to numbers
  const subtotalNum = parseFloat(subtotal as any) || 0;
  const deliveryFeeNum = parseFloat(deliveryFee as any) || 0;
  const commissionRateNum = parseFloat(commissionRate as any) || 0.05;

  const totalAmount = subtotalNum + deliveryFeeNum;
  const platformFee = subtotalNum * commissionRateNum;
  const sellerAmount = subtotalNum - platformFee;

  return {
    subtotal: parseFloat(subtotalNum.toFixed(2)),
    deliveryFee: parseFloat(deliveryFeeNum.toFixed(2)),
    platformFee: parseFloat(platformFee.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    sellerAmount: parseFloat(sellerAmount.toFixed(2)),
  };
}
