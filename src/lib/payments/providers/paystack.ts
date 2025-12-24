// Paystack Payment Provider Implementation

import { createHmac } from 'crypto';
import { BasePaymentProvider } from '../base-provider';
import {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  InitiateMobilePaymentRequest,
  InitiateMobilePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PaymentProvider,
} from '../types';

const PAYSTACK_API_URL = 'https://api.paystack.co';

export class PaystackProvider extends BasePaymentProvider {
  readonly providerId: PaymentProvider = 'paystack';

  private get secretKey(): string {
    return this.credentials.secret_key;
  }

  private get publicKey(): string {
    return this.credentials.public_key;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${PAYSTACK_API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Paystack API error');
    }

    return data;
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      await this.makeRequest('/balance');
      return true;
    } catch {
      return false;
    }
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    try {
      const response = await this.makeRequest<{
        status: boolean;
        data: { authorization_url: string; reference: string };
      }>('/transaction/initialize', 'POST', {
        email: request.email,
        amount: Math.round(request.amount * 100), // Paystack uses kobo/cents
        currency: request.currency,
        reference: request.reference || this.generateReference(),
        callback_url: request.callback_url,
        metadata: {
          ...request.metadata,
          description: request.description,
        },
      });

      return {
        success: true,
        payment_link: response.data.authorization_url,
        reference: response.data.reference,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment link',
      };
    }
  }

  async initiateMobilePayment(request: InitiateMobilePaymentRequest): Promise<InitiateMobilePaymentResponse> {
    try {
      // Paystack uses charge endpoint for mobile money
      const response = await this.makeRequest<{
        status: boolean;
        data: { reference: string; status: string };
      }>('/charge', 'POST', {
        email: `${request.phone}@mobile.paystack.com`, // Paystack requires email
        amount: Math.round(request.amount * 100),
        currency: request.currency,
        mobile_money: {
          phone: request.phone,
          provider: 'mpesa', // or detect from phone number
        },
        reference: request.reference || this.generateReference(),
      });

      return {
        success: true,
        reference: response.data.reference,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate mobile payment',
      };
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const response = await this.makeRequest<{
        status: boolean;
        data: {
          status: string;
          amount: number;
          currency: string;
          paid_at: string;
          channel: string;
          reference: string;
          metadata: Record<string, unknown>;
        };
      }>(`/transaction/verify/${request.reference}`);

      const paymentStatus = response.data.status === 'success' ? 'success' 
        : response.data.status === 'pending' ? 'pending' 
        : 'failed';

      return {
        success: true,
        status: paymentStatus,
        amount: response.data.amount / 100,
        currency: response.data.currency,
        paid_at: response.data.paid_at,
        payment_method: response.data.channel as 'card' | 'mpesa' | 'bank_transfer',
        provider_reference: response.data.reference,
        metadata: response.data.metadata,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }
}
