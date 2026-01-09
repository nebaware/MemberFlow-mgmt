/**
 * Payment Gateway Integration
 * Supports multiple Ethiopian payment providers
 */

export interface PaymentGatewayConfig {
  apiKey: string;
  apiSecret: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
  callbackUrl: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  message: string;
  error?: string;
}

/**
 * Telebirr Payment Gateway
 * Official Telebirr API integration
 */
export class TelebirrGateway {
  private config: PaymentGatewayConfig;
  private baseUrl: string;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.telebirr.com/v1'
      : 'https://sandbox.telebirr.com/v1';
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Generate unique transaction reference
      const txRef = `TLB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare payment payload
      const payload = {
        merchant_id: this.config.merchantId,
        transaction_ref: txRef,
        amount: request.amount,
        currency: request.currency,
        customer_name: request.customerName,
        customer_phone: request.customerPhone,
        customer_email: request.customerEmail,
        description: request.description,
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        callback_url: this.config.callbackUrl,
        timestamp: new Date().toISOString(),
      };

      // Generate signature (HMAC-SHA256)
      const signature = await this.generateSignature(payload);

      // Make API request
      const response = await fetch(`${this.baseUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Signature': signature,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          transactionId: txRef,
          paymentUrl: data.payment_url,
          message: 'Payment initiated successfully',
        };
      } else {
        return {
          success: false,
          transactionId: txRef,
          message: 'Payment initiation failed',
          error: data.error || 'Unknown error',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        message: 'Payment initiation failed',
        error: error.message,
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; data?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.config.apiKey,
        },
      });

      const data = await response.json();

      return {
        success: response.ok,
        status: data.status || 'unknown',
        data,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
      };
    }
  }

  private async generateSignature(payload: any): Promise<string> {
    // In production, use proper HMAC-SHA256 signing
    // For now, return a placeholder
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.config.apiSecret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }
}

/**
 * CBE Birr Payment Gateway
 * Commercial Bank of Ethiopia mobile payment
 */
export class CBEBirrGateway {
  private config: PaymentGatewayConfig;
  private baseUrl: string;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.cbebirr.com/v1'
      : 'https://sandbox.cbebirr.com/v1';
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const txRef = `CBE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const payload = {
        merchant_code: this.config.merchantId,
        transaction_id: txRef,
        amount: request.amount,
        currency: request.currency,
        customer_name: request.customerName,
        customer_phone: request.customerPhone,
        description: request.description,
        return_url: request.returnUrl,
        notify_url: this.config.callbackUrl,
      };

      const response = await fetch(`${this.baseUrl}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        return {
          success: true,
          transactionId: txRef,
          paymentUrl: data.payment_url,
          message: 'Payment initiated successfully',
        };
      } else {
        return {
          success: false,
          transactionId: txRef,
          message: 'Payment initiation failed',
          error: data.message || 'Unknown error',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        message: 'Payment initiation failed',
        error: error.message,
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; data?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      const data = await response.json();

      return {
        success: response.ok,
        status: data.status || 'unknown',
        data,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
      };
    }
  }
}

/**
 * Payment Gateway Factory
 * Creates appropriate gateway instance based on payment method
 */
export class PaymentGatewayFactory {
  static createGateway(method: string, config: PaymentGatewayConfig) {
    switch (method.toLowerCase()) {
      case 'telebirr':
        return new TelebirrGateway(config);
      case 'cbe_birr':
      case 'cbebirr':
        return new CBEBirrGateway(config);
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}

/**
 * Get payment gateway configuration from environment
 */
export function getPaymentConfig(method: string): PaymentGatewayConfig {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  
  switch (method.toLowerCase()) {
    case 'telebirr':
      return {
        apiKey: process.env.TELEBIRR_API_KEY || 'demo_key',
        apiSecret: process.env.TELEBIRR_API_SECRET || 'demo_secret',
        merchantId: process.env.TELEBIRR_MERCHANT_ID || 'demo_merchant',
        environment: (process.env.PAYMENT_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
        callbackUrl: `${baseUrl}/api/payments/callback/telebirr`,
      };
    case 'cbe_birr':
    case 'cbebirr':
      return {
        apiKey: process.env.CBE_BIRR_API_KEY || 'demo_key',
        apiSecret: process.env.CBE_BIRR_API_SECRET || 'demo_secret',
        merchantId: process.env.CBE_BIRR_MERCHANT_ID || 'demo_merchant',
        environment: (process.env.PAYMENT_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
        callbackUrl: `${baseUrl}/api/payments/callback/cbebirr`,
      };
    default:
      throw new Error(`Unsupported payment method: ${method}`);
  }
}
