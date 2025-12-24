// Flutterwave Payment Provider Implementation

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

const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';

export class FlutterwaveProvider extends BasePaymentProvider {
  readonly providerId: PaymentProvider = 'flutterwave';

  private get secretKey(): string {
    return this.credentials.secret_key;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${FLUTTERWAVE_API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Flutterwave API error');
    }

    return data;
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      await this.makeRequest('/balances');
      return true;
    } catch {
      return false;
    }
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    try {
      const txRef = request.reference || this.generateReference();
      
      const response = await this.makeRequest<{
        status: string;
        data: { link: string };
      }>('/payments', 'POST', {
        tx_ref: txRef,
        amount: request.amount,
        currency: request.currency,
        redirect_url: request.callback_url,
        customer: {
          email: request.email,
          phonenumber: request.phone,
        },
        meta: request.metadata,
        customizations: {
          title: 'Invoice Payment',
          description: request.description,
        },
      });

      return {
        success: true,
        payment_link: response.data.link,
        reference: txRef,
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
      const txRef = request.reference || this.generateReference();
      
      // Flutterwave mobile money charge
      const response = await this.makeRequest<{
        status: string;
        data: { id: number; tx_ref: string };
      }>('/charges?type=mobile_money_kenya', 'POST', {
        tx_ref: txRef,
        amount: request.amount,
        currency: request.currency,
        phone_number: request.phone,
        email: `${request.phone}@mobile.flutterwave.com`,
      });

      return {
        success: true,
        reference: response.data.tx_ref,
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
      // First get transaction ID from reference
      const txResponse = await this.makeRequest<{
        status: string;
        data: { id: number }[];
      }>(`/transactions?tx_ref=${request.reference}`);

      if (!txResponse.data || txResponse.data.length === 0) {
        return {
          success: false,
          status: 'failed',
          error: 'Transaction not found',
        };
      }

      const transactionId = txResponse.data[0].id;
      
      const response = await this.makeRequest<{
        status: string;
        data: {
          status: string;
          amount: number;
          currency: string;
          created_at: string;
          payment_type: string;
          flw_ref: string;
          meta: Record<string, unknown>;
        };
      }>(`/transactions/${transactionId}/verify`);

      const paymentStatus = response.data.status === 'successful' ? 'success' 
        : response.data.status === 'pending' ? 'pending' 
        : 'failed';

      return {
        success: true,
        status: paymentStatus,
        amount: response.data.amount,
        currency: response.data.currency,
        paid_at: response.data.created_at,
        payment_method: response.data.payment_type as 'card' | 'mpesa',
        provider_reference: response.data.flw_ref,
        metadata: response.data.meta,
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
    const hash = createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }
}
